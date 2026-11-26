# Bài thử M10 cho người thử tự làm: hướng dẫn cài đặt và chạy

P03 "Made in…?", Nhóm 02. Trang này là bản tự làm trên web của quy trình M10-01 (`notebooks/M10/07_evaluation_M10.ipynb`, file `evidence/tests/m10_protocol.md`). Câu hỏi, gợi ý, thứ tự giống protocol; khác biệt ghi ở mục 9 của protocol.

| File | Vai trò |
|---|---|
| `index.html` | Trang người thử mở: phiếu đồng ý, sàng lọc, bài 5 giây, T1 đến T5, 3 câu hỏi cuối |
| `scrolly.html` | Trang cuộn M9-04 (T1, T5) |
| `explorer.html` | Bản HTML của explorer M9-03 (T2 đến T5) |
| `c3.png` | Hình C3, hình số 1 của Big Idea (bài 5 giây, T5) |
| `Code.gs` | Apps Script nhận câu trả lời và ghi vào Google Sheet |

Trang **không chứa đáp án**. Notebook chấm từ dữ liệu thô ở mục 4a.

## 1. Cài đặt nơi lưu kết quả (một người làm, khoảng 10 phút)

1. Tạo một Google Sheet trong thư mục nhóm, đặt tên `M10_ket_qua_tu_lam`.
2. Trong Sheet: **Tiện ích mở rộng > Apps Script**. Xóa nội dung `Code.gs` có sẵn, dán nội dung file `Code.gs` của repo này, bấm Lưu.
3. **Triển khai > Tùy chọn triển khai mới**, loại **Ứng dụng web**:
   - Thực thi với tư cách: **Tôi**
   - Ai có quyền truy cập: **Bất kỳ ai** (bắt buộc, nếu không trang trên GitHub không gửi được dữ liệu)
4. Bấm Triển khai và cấp quyền cho tài khoản của bạn. Nếu Google báo "ứng dụng chưa được xác minh", chọn Nâng cao > Đi tới dự án (đây là script của chính bạn).
5. Sao chép **URL ứng dụng web** (kết thúc bằng `/exec`).
6. Mở `index.html` trên GitHub, tìm dòng `const API_URL = "";`, dán URL vào giữa hai dấu ngoặc kép, Commit. Sau khoảng 1 phút trang trên GitHub Pages bắt đầu lưu kết quả.

Khi `API_URL` để trống, trang chạy ở chế độ thử: mã có dạng `THU-xxxx` và không lưu gì.

## 2. Chạy thử trước khi mời người thật

1. Mở link có thêm `?pilot=1` ở cuối (ví dụ `https://nguyendinhphuc-tdzy.github.io/m10-thu-nguoi-dung/?pilot=1`) trong cửa sổ ẩn danh, làm hết một lượt. Mã sẽ là `P1`, `P2`…, notebook không tính.
2. Kiểm tra Sheet đã có trang tính `sessions` (1 dòng) và `responses` (6 dòng: F5, T1 đến T5).
3. Nếu có câu hỏi khó hiểu, sửa `index.html` **trước** khi mời người thật, và ghi thay đổi vào ghi chú buổi chạy thử `m10_notes_U0.md`.

## 3. Mời người thử

- 5 người: 1 người làm kinh doanh, 4 sinh viên ngoài nhóm; chưa xem biểu đồ của nhóm, chưa làm bài thử nào khác (M8, M9-04, nghe Big Idea). Trang tự hỏi 3 câu sàng lọc và cho dừng nếu không đủ điều kiện (mã `X1`, `X2`… trong Sheet).
- Gửi link **không có** `?pilot=1`. Dặn: làm trên máy tính có chuột hoặc bàn di, một lần, một mình, không mở tab khác, khoảng 25 phút.
- Người làm kinh doanh nên làm có người dẫn: Phúc ngồi cạnh, đọc lời mở đầu trong protocol; Tường Vy ghi think-aloud vào `m10_notes_Ux.md` theo mã hiện trên màn hình.
- Tên thật và sổ mời lưu riêng, không đưa vào bài nộp.

## 4. Lấy dữ liệu cho notebook

1. Trong Sheet: chọn trang tính `responses`, **Tệp > Tải xuống > Giá trị được phân tách bằng dấu phẩy (.csv)**, lưu thành `evidence/tests/m10_form_responses.csv`. Làm tương tự với `sessions` thành `m10_form_sessions.csv`.
2. Mở `07_evaluation_M10.ipynb`, Run all. Mục 4a chấm T1 đến T4 và thêm vào `m10_results.csv`, `m10_five_second.csv`, `m10_insights.csv`, `m10_issues.csv`.
3. Chấm tay phần còn lại: `rater1`, `rater2` của bài 5 giây (hai người chấm độc lập); `correct`, `depth` của insight; `severity` của vấn đề. Chạy lại mục 4 để ra `m10_summary.md`.

## 5. Bảo vệ dữ liệu

- Repo này công khai: ai cũng xem được code và URL `/exec`, nhưng không xem được Sheet. Không đưa dữ liệu kết quả lên repo.
- Trang tính `contacts` chỉ có ngày và liên hệ người thử tự nguyện để lại, không có mã, không nối được với câu trả lời. Không đưa vào bài nộp; xóa sau khi môn học kết thúc.
- Thu xong thì **gỡ triển khai** Apps Script (Triển khai > Quản lý các lần triển khai > Lưu trữ) để Sheet không nhận thêm dòng lạ.

## 6. Nếu cần sửa

- Sửa `index.html`: commit lên GitHub, link giữ nguyên. Đổi câu hỏi sau khi đã có người thật làm thì phải ghi rõ phiên bản (`APP_VERSION`) và báo cáo riêng.
- Sửa `Code.gs`: dán lại vào Apps Script, rồi **Triển khai > Quản lý các lần triển khai > Chỉnh sửa > Phiên bản: Phiên bản mới > Triển khai** để URL `/exec` giữ nguyên.
