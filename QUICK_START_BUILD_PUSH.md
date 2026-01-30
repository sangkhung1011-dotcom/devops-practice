# 🚀 Quick Start - Build & Push Docker Image

## Option 1: Sử dụng Script (Thủ công - Nhanh nhất)

### Prerequisites:
```bash
# 1. Setup Git (bắt buộc)
cd /home/ubuntu/devops-practice
git init
git config user.email "you@example.com"
git config user.name "Your Name"
git add .
git commit -m "Initial commit"

# 2. Login to Docker Hub
docker login
# Nhập username & password/token

# 3. Set environment variable (tuỳ chọn)
export DOCKER_USERNAME="your-docker-username"
```

### Build & Push:
```bash
# Build image
./docker-build.sh

# Script sẽ hỏi: "Bạn muốn push image lên Docker Hub không?"
# Trả lời: y (yes)
```

---

## Option 2: Sử dụng GitHub Actions (Tự động)

### Setup:
1. Push repo lên GitHub
2. Add Docker Hub credentials (xem GITHUB_SECRETS_SETUP.md)
3. Pipeline tự động chạy khi push code

### Kiểm tra:
```bash
# View workflow status
gh run list

# View logs
gh run view <RUN_ID> --log
```

---

## Option 3: Manual Docker Commands

### Build:
```bash
docker build -t your-username/login-app:latest .
docker build -t your-username/login-app:v1.0.0 .
```

### Push:
```bash
docker push your-username/login-app:latest
docker push your-username/login-app:v1.0.0
```

### Verify:
```bash
docker images | grep login-app
```

---

## Image Tags Explained

```
your-username/login-app:latest      ← Phiên bản mới nhất
your-username/login-app:v1.0.0      ← Version cụ thể
your-username/login-app:main        ← Branch name
your-username/login-app:abc123f     ← Git commit hash
```

---

## View Image on Docker Hub

```
https://hub.docker.com/r/your-username/login-app
```

---

## Pull & Run Image

```bash
# Pull from Docker Hub
docker pull your-username/login-app:latest

# Run container
docker run -p 3000:3000 your-username/login-app:latest

# Or use docker-compose
docker pull your-username/login-app:latest
# Update docker-compose.yml image: your-username/login-app:latest
# Then: docker compose up -d
```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `denied: access denied` | Run `docker login` |
| `No such file: Dockerfile` | Check Dockerfile location |
| `not a git repository` | Run `git init` |
| `Build failed` | Check `docker-build.sh` output |

---

**Recommended: Use GitHub Actions for automation! 🤖**
