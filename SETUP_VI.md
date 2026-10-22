# Hướng dẫn SecondKey – Windows & GitHub

## 1. Chạy bản đã kiểm chứng trên máy

Mở **Docker Desktop** và container `mytidecloak` (`docker start mytidecloak` nếu container đang dừng). Dùng Tide Console để tải adapter **của riêng bạn** và lưu thành `public/tidecloak.json`. Adapter không nằm trong bản GitHub.

Mở PowerShell tại thư mục dự án:

```powershell
npm.cmd install
npm.cmd run setup:dpop
npm.cmd run dev
```

Mở PowerShell thứ hai tại thư mục đó:

```powershell
$env:TIDE_ISSUER = "http://localhost:8080/realms/secondkey"
$env:TIDE_AUDIENCE = "secondkey-client"
python -m pip install -r api\requirements.txt
python -m uvicorn api.server:app --host 127.0.0.1 --port 8000
```

Mở `http://localhost:5173` → **Sign in with Tide** → **Check access**. User chưa có role `secondkey-reviewer` sẽ bị từ chối **403**. Đây là bước đã được người dùng thử thành công. Không cần thử thêm QEA để nộp video hiện có.

Có thể kiểm tra `http://127.0.0.1:8000/api/health` và chạy `npm.cmd run check:dpop` trong PowerShell khác.

## 2. Nội dung bộ nộp

- `README.md`: 5 mục tiếng Anh theo tiêu chí chính thức, tóm tắt dưới 300 từ ở đầu file.
- `demo.mp4`: video tiếng Anh có phụ đề gắn trực tiếp, dài dưới 2 phút, minh họa đúng những gì đã chạy và những gì chưa hoàn thành.
- `demo.en.srt`: phụ đề bản riêng, có thể chỉnh sửa nếu quay video mới.
- `src/`, `api/`, `public/` (không gồm adapter cục bộ), `scripts/`, `vite.config.js`, `package.json`: source code.
- `docs/PROOF_AND_LIMITATIONS.md`: phạm vi bằng chứng và giới hạn.

**Chưa kiểm chứng**: QEA 2/3, chuyển 403→200 thực, và xác minh DPoP proof trên backend. Video chỉ trình bày chúng là dự kiến.

## 3. Đưa lên GitHub

Vào https://github.com/new, tạo một repository **Public** tên `secondkey-unlocked`, để trống (không tick tạo README/license). Trong PowerShell ở thư mục vừa giải nén, chạy:

```powershell
git init
git add .
git status
git commit -m "SecondKey UNLOCKED prototype and captioned demo"
git branch -M main
git remote add origin https://github.com/USERNAME/secondkey-unlocked.git
git push -u origin main
```

Thay `USERNAME` bằng GitHub username. Nếu Git hỏi danh tính, chạy `git config --global user.name "Your Name"` và `git config --global user.email "you@example.com"`, rồi commit lại. Nếu GitHub từ chối mật khẩu khi push HTTPS, đăng nhập bằng Git Credential Manager (thường có trong Git for Windows) hoặc GitHub CLI.

**Trước khi `git add .`**, chắc chắn bạn đang ở thư mục của gói `SecondKey-GITHUB-READY`, không phải phiên bản chạy local chứa adapter. Kiểm tra bằng `git status`: **không có** `public/tidecloak.json`, `.env`, private keys, tokens, cookies.

Cách không dùng Git: tạo repo Public → **Add file → Upload files** → kéo các file/thư mục *bên trong thư mục giải nén* lên và Commit changes. Kiểm tra cấu trúc thư mục sau khi upload (phải có `README.md` ngay tại thư mục gốc).

## 4. Nộp chính thức

Mở repo ở cửa sổ ẩn danh, chắc chắn có README, source, `demo.mp4` phát/tải được. Tại thời điểm tài liệu được chuẩn bị, trang thử thách ghi hạn nộp Việt Nam **18:00 22/10/2026**. Form: https://forms.gle/HRHYjnqB86j1LFS97. Nộp đường dẫn GitHub repo và lưu lại xác nhận nộp.

Không cần đợi giải quyết lỗi thêm admin mới nộp bản trung thực này. Nếu muốn cải thiện sau đó, phải quay cảnh QEA thật bằng tài khoản riêng và thử thành công 403→200; không sửa video để giả kết quả.
