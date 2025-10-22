# Smart School Bus Tracking - Frontend & Backend Sync Fix Plan

## 1. Tổng quan kiểm tra hệ thống
- Đã refactor toàn bộ frontend loại bỏ AppDataContext, sử dụng các context module mới: DriversContext, StudentsContext, RoutesContext, SchedulesContext.
- Đảm bảo các component, hook, service đều đồng bộ với backend và database.
- Đã rà soát các lỗi, bug, exception, TODO/FIXME trong code.

## 2. Các lỗi/bug phát hiện
### Frontend
- Một số lỗi exception chưa xử lý triệt để (ví dụ: lỗi khi submit form, lỗi khi xóa item, lỗi context provider chưa đúng).
- Một số TODO chưa hoàn thành: lấy danh sách trường học từ database, lấy danh sách điểm dừng theo tuyến.
- Cảnh báo duplicate bus ID, cần kiểm tra lại dữ liệu đầu vào từ backend.
- Các lỗi context: cần đảm bảo mọi hook context đều nằm trong provider.
- Cảnh báo lỗi mapping field giữa frontend ↔ backend (cần kiểm tra lại các service và type).

### Backend
- Model Driver.js: cần kiểm tra lại logic update, đảm bảo truyền đủ field cho MySQL.
- API studentService: cần kiểm tra lại trả về errors đúng chuẩn.

## 3. Kế hoạch fix triệt để
### 3.1. Frontend
- [ ] Kiểm tra và hoàn thiện các TODO (trường học, điểm dừng, ...).
- [ ] Bổ sung xử lý exception cho mọi thao tác CRUD (thêm/sửa/xóa) ở các form.
- [ ] Kiểm tra lại mapping field giữa frontend ↔ backend (đặc biệt các enum, trường tiếng Việt).
- [ ] Đảm bảo mọi hook context đều nằm trong provider, không throw lỗi.
- [ ] Kiểm tra lại các service API, đảm bảo trả về lỗi đúng chuẩn và hiển thị lỗi cho người dùng.
- [ ] Kiểm tra lại các cảnh báo duplicate ID, fix logic filter dữ liệu đầu vào.
- [ ] Viết test cho các context, service, component chính.

### 3.2. Backend
- [ ] Kiểm tra lại model Driver.js, bổ sung validate field khi update.
- [ ] Kiểm tra lại các controller, đảm bảo trả về lỗi đúng chuẩn cho frontend.
- [ ] Kiểm tra lại các API trả về dữ liệu mapping đúng với frontend.
- [ ] Viết test cho các route chính (driver, student, bus, schedule).

### 3.3. Database
- [ ] Kiểm tra lại schema các bảng, đảm bảo mapping đúng với type frontend.
- [ ] Kiểm tra lại enum, trường tiếng Việt, đảm bảo đồng bộ với frontend/backend.

## 4. Đảm bảo đồng bộ
- [ ] Kiểm tra lại toàn bộ flow CRUD: frontend form → context → service → backend → database.
- [ ] Kiểm tra lại các field mapping, enum, trạng thái, ...
- [ ] Đảm bảo reload UI sau mỗi thao tác CRUD.
- [ ] Đảm bảo mọi lỗi đều được hiển thị rõ ràng cho người dùng.

## 5. Quy trình kiểm thử
- [ ] Viết test cho các module chính.
- [ ] Kiểm thử manual toàn bộ flow CRUD.
- [ ] Kiểm thử đồng bộ dữ liệu giữa frontend ↔ backend ↔ database.

---
**Người thực hiện:** GitHub Copilot
**Ngày:** 22/10/2025
