const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL Pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME || 'logindb',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Nodemailer transporter - Smart Config (MailHog for DEV, Gmail for PROD)
let transporter;
if (process.env.NODE_ENV === 'development') {
  // MailHog for development
  transporter = nodemailer.createTransport({
    host: 'mailhog',
    port: 1025,
    secure: false,
    auth: false
  });
  console.log('📧 Using MailHog for development');
} else {
  // Gmail SMTP for production
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: process.env.MAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD
    }
  });
  console.log('📧 Using Gmail SMTP for production');
}

// In-memory OTP storage (for production use Redis)
const otpStore = new Map();

// Helper function to generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to send OTP email
async function sendOTPEmail(email, otp, username) {
  try {
    const fromEmail = process.env.NODE_ENV === 'development' 
      ? 'noreply@loginapp.com'
      : (process.env.GMAIL_USER || 'noreply@loginapp.com');
    
    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: 'Your Login OTP Code',
      html: `
        <h2>Welcome ${username}!</h2>
        <p>Your OTP code is: <strong style="font-size: 24px; color: #667eea;">${otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
      `
    });
    console.log(`OTP sent to ${email}`);
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
}

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}));

// Initialize database
async function initDB() {
  let retries = 5;
  while (retries) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Database initialized successfully');
      break;
    } catch (err) {
      retries--;
      console.log(`Database init error, retrying... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

initDB();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Tất cả trường là bắt buộc' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Mật khẩu không khớp' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );

    req.session.userId = result.rows[0].id;
    req.session.username = username;
    res.json({ success: true, message: 'Đăng ký thành công' });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Username hoặc email đã tồn tại' });
    } else {
      res.status(500).json({ error: 'Lỗi đăng ký' });
    }
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username và password là bắt buộc' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Username hoặc password sai' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Username hoặc password sai' });
    }

    // Generate OTP
    const otp = generateOTP();
    otpStore.set(user.id, {
      otp: otp,
      email: user.email,
      username: user.username,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // Send OTP email
    await sendOTPEmail(user.email, otp, user.username);

    // Store userId temporarily for OTP verification
    req.session.tempUserId = user.id;
    req.session.awaitingOTP = true;

    res.json({ 
      success: true, 
      message: 'Mã OTP đã được gửi đến email của bạn',
      userId: user.id
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Lỗi đăng nhập' });
  }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ error: 'User ID và OTP là bắt buộc' });
    }

    const otpData = otpStore.get(userId);

    if (!otpData) {
      return res.status(400).json({ error: 'OTP không tồn tại hoặc đã hết hạn' });
    }

    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(userId);
      return res.status(400).json({ error: 'OTP đã hết hạn' });
    }

    if (otpData.otp !== otp) {
      return res.status(401).json({ error: 'OTP không chính xác' });
    }

    // OTP verified, set session
    req.session.userId = userId;
    req.session.username = otpData.username;
    req.session.awaitingOTP = false;
    otpStore.delete(userId);

    res.json({ success: true, message: 'Đăng nhập thành công' });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ error: 'Lỗi xác thực OTP' });
  }
});

// Get user info
app.get('/api/user', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }
  res.json({ userId: req.session.userId, username: req.session.username });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi đăng xuất' });
    }
    res.json({ success: true, message: 'Đã đăng xuất' });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
