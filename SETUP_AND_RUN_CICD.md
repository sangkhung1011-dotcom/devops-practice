# 📖 Hướng Dẫn Sử Dụng CI/CD Pipeline (Build & Push Docker)

Để hệ thống tự động Build và Push Docker image hoạt động, bạn cần làm theo 3 bước sau:

## Bước 1: Cấu hình "Chìa khóa" (Secrets) trên GitHub 🔑
GitHub cần mật khẩu để đăng nhập vào Docker Hub thay cho bạn. **Đây là bước bắt buộc làm 1 lần đầu tiên.**

1. Truy cập vào trang Repository của bạn trên GitHub.
2. Vào tab **Settings** (Cài đặt) trên thanh menu trên cùng.
3. Ở menu bên trái, tìm mục **Secrets and variables** -> chọn **Actions**.
4. Bấm nút màu xanh **New repository secret**.
5. Thêm 2 secret sau:

| Name (Tên) | Secret (Giá trị) |
| :--- | :--- |
| `DOCKER_USERNAME` | Tên đăng nhập Docker Hub của bạn (ví dụ: `nguyenvana`) |
| `DOCKER_PASSWORD` | Password Docker Hub (hoặc Access Token nếu bạn biết cách tạo) |

> ⚠️ *Nếu không có bước này, Pipeline sẽ báo lỗi "Login failed".*

---

## Bước 2: Kích hoạt Pipeline (Chạy tự động) 🚀
Bạn không cần bấm nút "Start". Pipeline được cài đặt để **tự chạy** mỗi khi bạn đẩy code lên.

### Cách làm:
Mở terminal tại máy bạn và chạy các lệnh sau để giả lập việc update code:

```bash
# 1. Sửa một file bất kỳ (ví dụ thêm dòng trống vào README hoặc Dockerfile)
echo " " >> README.md

# 2. Lưu thay đổi vào Git
git add .
git commit -m "Update code: test CI/CD pipeline"

# 3. Đẩy lên GitHub -> Lúc này Pipeline sẽ TỰ ĐỘNG CHẠY
git push origin main
```

*(Lưu ý: Nếu bạn đang ở nhánh khác, ví dụ `develop`, hãy thay `main` bằng `develop`. Tuy nhiên, file cấu hình hiện tại chỉ Push image khi ở nhánh `main`)*.

---

## Bước 3: Xem kết quả chạy (Monitor) 📺

1. Quay lại trang GitHub Repo của bạn.
2. Bấm vào tab **Actions** (biểu tượng nút Play ▶️).
3. Bạn sẽ thấy một dòng workflow đang chạy (màu vàng) có tên: **"Update code: test CI/CD pipeline"**.
4. Bấm vào đó để xem chi tiết từng bước:
   - `build-and-push`: Đang build và đẩy lên Docker Hub.
   - `scan-image`: Đang quét bảo mật.

Nếu hiện màu **Xanh lá (Success)** ✅: Chúc mừng! Code của bạn đã được đóng gói thành Image và nằm trên Docker Hub.

---

## Bước 4: Kiểm tra trên Docker Hub
Truy cập: `https://hub.docker.com/repository/docker/<username-cua-ban>/login-app`
Bạn sẽ thấy Image mới vừa xuất hiện với tag `latest` và tag trùng với mã commit.
