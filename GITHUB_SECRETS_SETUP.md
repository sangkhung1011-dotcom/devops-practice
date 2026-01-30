# 🔐 GitHub Secrets Setup Guide

## Bước 1: Tạo Docker Hub Access Token

1. Vào https://hub.docker.com/settings/security
2. Click **"New Access Token"**
3. Đặt tên: `github-actions`
4. Click **"Generate"**
5. **Copy token** (lưu lại, chỉ hiển thị 1 lần)

---

## Bước 2: Add Secrets vào GitHub

### Cách 1: Qua GitHub Web UI

1. Vào repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Thêm 2 secrets:

```
Name: DOCKER_USERNAME
Value: your-docker-hub-username

Name: DOCKER_PASSWORD
Value: your-access-token (từ bước 1)
```

4. Click **"Add secret"**

### Cách 2: Qua GitHub CLI (nhanh hơn)

```bash
# Install GitHub CLI (nếu chưa có)
# macOS: brew install gh
# Linux: sudo apt install gh
# Windows: choco install gh

# Login to GitHub
gh auth login

# Set secrets
gh secret set DOCKER_USERNAME --body "your-username" --repo your-username/devops-practice
gh secret set DOCKER_PASSWORD --body "your-token" --repo your-username/devops-practice

# Kiểm tra secrets
gh secret list --repo your-username/devops-practice
```

---

## Bước 3: Test Pipeline

1. **Push code lên main branch:**
```bash
git add .
git commit -m "Add Docker build pipeline"
git push origin main
```

2. **Xem pipeline chạy:**
   - Vào GitHub repo → **Actions** tab
   - Chờ workflow hoàn thành (2-3 phút)
   - Kiểm tra logs

3. **Verify image được push:**
```bash
docker pull your-username/login-app:latest
```

---

## Bước 4: Tùy chỉnh Workflow

### Kích hoạt pipeline thủ công:

1. Vào **Actions** → **Build & Push Docker Image**
2. Click **"Run workflow"** button
3. Chọn branch → Click **"Run workflow"**

### Trigger tự động:

Pipeline sẽ chạy khi:
- ✅ Push code vào `main` hoặc `develop`
- ✅ Chỉnh sửa files liên quan (app/, Dockerfile, package.json)
- ✅ Tạo Pull Request

---

## Bước 5: Monitoring & Debugging

```bash
# Xem tất cả workflows
gh workflow list

# Xem chi tiết run
gh run list

# Xem logs của run
gh run view <RUN_ID> --log

# Re-run failed job
gh run rerun <RUN_ID>

# View secret list (không hiển thị value)
gh secret list
```

---

## Troubleshooting

### ❌ "401 Unauthorized" error

- Kiểm tra Docker Hub username/token có đúng
- Token có hết hạn không?
- Xóa secret cũ, thêm secret mới

### ❌ "No such file or directory: Dockerfile"

- Đảm bảo file `Dockerfile` ở root folder
- Check file path trong workflow YAML

### ❌ "image not found"

- Build chưa hoàn thành
- Check workflow logs
- Đảm bảo branch là `main`

---

## Optional: Slack Notifications

Thêm Slack webhook để nhận thông báo:

1. Vào Slack workspace settings
2. Create Slack App → Incoming Webhooks
3. Copy webhook URL
4. Add secret:
```bash
gh secret set SLACK_WEBHOOK --body "https://hooks.slack.com/..."
```

Workflow sẽ tự động gửi thông báo khi build success/fail ✅

---

## Useful Commands

```bash
# Login to Docker
docker login -u your-username

# View images locally
docker images | grep login-app

# Remove image
docker rmi your-username/login-app:latest

# Check Docker Hub repo
open https://hub.docker.com/r/your-username/login-app
```

---

**Sau khi setup xong, mọi push sẽ tự động build & push image! 🚀**
