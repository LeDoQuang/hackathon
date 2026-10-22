# SecondKey — checklist trước khi nộp

**Các thứ cần có trên GitHub:** repo Public, source code hoạt động, README mở đầu gồm 5 câu trả lời tối đa 300 từ, video MP4 tối đa 2 phút và dưới 100 MB; nộp repo URL qua Google Form.

- [x] README đúng 5 câu hỏi, phần đầu 222 từ.
- [x] `demo.mp4` dài 88 giây, phụ đề tiếng Anh gắn vào khung hình và có `demo.en.srt` riêng.
- [x] Mô tả dữ liệu học bổng mẫu, không có dữ liệu sinh viên thật.
- [x] Source TideCloak + FastAPI, nhận diện kiểm tra JWT và role.
- [x] **Đã thấy thực tế trên máy người dùng:** đăng nhập Tide thành công, yêu cầu không đủ role trả 403.
- [x] 9 bài kiểm thử Python đạt, JS/Vite config qua syntax check tại môi trường tạo release.
- [x] Bỏ adapter local `public/tidecloak.json`, token và file cấu hình bí mật khỏi bộ GitHub.
- [ ] Kiểm tra repo ở chế độ Public và có `demo.mp4` tại gốc, bấm được link video.
- [ ] Gửi URL repo qua form và lưu màn hình xác nhận.

**Chưa hoàn tất, không được mô tả là đã chạy:** phê duyệt QEA bằng 2 người độc lập, quyền đổi từ 403 sang 200, xác minh DPoP tại resource server. Video hiện tại phân biệt rõ kịch bản dự kiến với kiểm chứng thực tế.

Lưu ý hạn nộp Việt Nam trên trang bạn gửi: **18:00 22/10/2026**. Form: https://forms.gle/HRHYjnqB86j1LFS97.
