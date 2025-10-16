-- Sample Data for Reports - Smart School Bus System-- ==========================================

-- Tạo dữ liệu mẫu cho hệ thống báo cáo xe buýt trường học-- SAMPLE DATA FOR REPORTS TESTING

-- Smart School Bus System

USE ssb1;-- Date: October 15, 2025

-- ==========================================

-- Thêm dữ liệu điểm danh mẫu (diemdanh table)

INSERT INTO diemdanh (ma_hoc_sinh, ma_lich, ma_tram_len, ma_tram_xuong, ngay_diem_danh, gio_len_xe, gio_xuong_xe, trang_thai_len_xe, trang_thai_xuong_xe, ghi_chu) VALUESUSE smart_school_bus;

-- Tuần 1 (2025-10-08 đến 2025-10-12)

(1, 1, 1, 2, '2025-10-08 07:15:00', '07:15:00', '16:30:00', 'da_len', 'da_xuong', 'Đúng giờ'),-- ==========================================

(2, 1, 1, 3, '2025-10-08 07:16:00', '07:16:00', '16:32:00', 'da_len', 'da_xuong', 'Đúng giờ'),-- 1. ADD SAMPLE SCHEDULES (Last 6 months)

(3, 2, 2, 1, '2025-10-08 07:20:00', '07:20:00', '16:25:00', 'da_len', 'da_xuong', 'Đúng giờ'),-- ==========================================

(4, 2, 3, 1, '2025-10-08 07:25:00', '07:25:00', '16:20:00', 'vang_mat', 'da_xuong', 'Nghỉ ốm'),

(5, 3, 1, 4, '2025-10-08 07:30:00', '07:30:00', '16:45:00', 'da_len', 'da_xuong', 'Đúng giờ'),-- October 2025 (Current month - 20 schedules)

INSERT INTO schedules (route_id, driver_id, bus_id, schedule_date, schedule_type, start_time, end_time, status, total_students, notes) VALUES

(1, 4, 1, 2, '2025-10-09 07:14:00', '07:14:00', '16:28:00', 'da_len', 'da_xuong', 'Sớm 1 phút'),(1, 1, 1, '2025-10-01', 'morning', '07:00:00', '08:30:00', 'completed', 45, 'Hoàn thành đúng giờ'),

(2, 4, 1, 3, '2025-10-09 07:17:00', '07:17:00', '16:35:00', 'da_len', 'da_xuong', 'Muộn 1 phút'),(1, 1, 1, '2025-10-01', 'afternoon', '15:00:00', '16:30:00', 'completed', 45, 'Hoàn thành đúng giờ'),

(3, 5, 2, 1, '2025-10-09 07:22:00', '07:22:00', '16:27:00', 'da_len', 'da_xuong', 'Muộn 2 phút'),(2, 2, 2, '2025-10-01', 'morning', '07:00:00', '08:00:00', 'completed', 38, 'Hoàn thành đúng giờ'),

(4, 5, 3, 1, '2025-10-09 07:26:00', '07:26:00', '16:22:00', 'da_len', 'da_xuong', 'Đúng giờ'),(2, 2, 2, '2025-10-01', 'afternoon', '15:30:00', '16:30:00', 'completed', 38, 'Hoàn thành đúng giờ'),

(5, 6, 1, 4, '2025-10-09 07:32:00', '07:32:00', '16:47:00', 'da_len', 'da_xuong', 'Muộn 2 phút'),

(1, 1, 1, '2025-10-07', 'morning', '07:00:00', '08:30:00', 'completed', 45, 'Hoàn thành'),

(1, 7, 1, 2, '2025-10-10 07:13:00', '07:13:00', '16:29:00', 'da_len', 'da_xuong', 'Sớm 2 phút'),(1, 1, 1, '2025-10-07', 'afternoon', '15:00:00', '16:30:00', 'completed', 45, 'Hoàn thành'),

(2, 7, 1, 3, '2025-10-10 07:15:00', '07:15:00', '16:31:00', 'da_len', 'da_xuong', 'Đúng giờ'),(2, 2, 2, '2025-10-07', 'morning', '07:00:00', '08:00:00', 'completed', 40, 'Hoàn thành'),

(3, 8, 2, 1, '2025-10-10 07:19:00', '07:19:00', '16:24:00', 'da_len', 'da_xuong', 'Sớm 1 phút'),(2, 2, 2, '2025-10-07', 'afternoon', '15:30:00', '16:30:00', 'completed', 40, 'Hoàn thành'),

(4, 8, 3, 1, '2025-10-10 07:24:00', '07:24:00', '16:19:00', 'da_len', 'da_xuong', 'Sớm 1 phút'),

(5, 9, 1, 4, '2025-10-10 07:31:00', '07:31:00', '16:46:00', 'da_len', 'da_xuong', 'Đúng giờ'),(1, 1, 1, '2025-10-14', 'morning', '07:00:00', '08:30:00', 'completed', 45, 'Hoàn thành đúng giờ'),

(1, 1, 1, '2025-10-14', 'afternoon', '15:00:00', '16:30:00', 'completed', 45, 'Hoàn thành đúng giờ'),

(1, 10, 1, 2, '2025-10-11 07:16:00', '07:16:00', '16:33:00', 'da_len', 'da_xuong', 'Muộn 1 phút'),(2, 2, 2, '2025-10-14', 'morning', '07:00:00', '08:00:00', 'completed', 42, 'Hoàn thành'),

(2, 10, 1, 3, '2025-10-11 07:18:00', '07:18:00', '16:36:00', 'vang_mat', 'vang_mat', 'Nghỉ phép'),(2, 2, 2, '2025-10-14', 'afternoon', '15:30:00', '16:30:00', 'completed', 42, 'Hoàn thành'),

(3, 11, 2, 1, '2025-10-11 07:21:00', '07:21:00', '16:26:00', 'da_len', 'da_xuong', 'Đúng giờ'),

(4, 11, 3, 1, '2025-10-11 07:27:00', '07:27:00', '16:23:00', 'da_len', 'da_xuong', 'Muộn 2 phút'),(1, 1, 1, '2025-10-15', 'morning', '07:00:00', '08:30:00', 'completed', 45, 'Hoàn thành đúng giờ'),

(5, 12, 1, 4, '2025-10-11 07:29:00', '07:29:00', '16:44:00', 'da_len', 'da_xuong', 'Sớm 1 phút'),(2, 2, 2, '2025-10-15', 'morning', '07:00:00', '08:00:00', 'completed', 43, 'Hoàn thành đúng giờ'),



(1, 13, 1, 2, '2025-10-12 07:14:00', '07:14:00', '16:30:00', 'da_len', 'da_xuong', 'Sớm 1 phút'),-- Add more routes

(2, 13, 1, 3, '2025-10-12 07:15:00', '07:15:00', '16:33:00', 'da_len', 'da_xuong', 'Đúng giờ'),(3, 1, 3, '2025-10-01', 'morning', '07:00:00', '08:15:00', 'completed', 35, 'Hoàn thành'),

(3, 14, 2, 1, '2025-10-12 07:20:00', '07:20:00', '16:25:00', 'da_len', 'da_xuong', 'Đúng giờ'),(3, 1, 3, '2025-10-07', 'morning', '07:00:00', '08:15:00', 'completed', 35, 'Hoàn thành'),

(4, 14, 3, 1, '2025-10-12 07:25:00', '07:25:00', '16:21:00', 'da_len', 'da_xuong', 'Đúng giờ'),(3, 1, 3, '2025-10-14', 'morning', '07:00:00', '08:15:00', 'completed', 38, 'Hoàn thành'),

(5, 15, 1, 4, '2025-10-12 07:30:00', '07:30:00', '16:45:00', 'da_len', 'da_xuong', 'Đúng giờ');(3, 1, 3, '2025-10-15', 'morning', '07:00:00', '08:15:00', 'completed', 38, 'Hoàn thành'),



-- Thêm thêm dữ liệu cho tuần 2 (2025-10-15 đến 2025-10-19)(4, 2, 4, '2025-10-01', 'afternoon', '15:00:00', '16:00:00', 'completed', 30, 'Hoàn thành'),

INSERT INTO diemdanh (ma_hoc_sinh, ma_lich, ma_tram_len, ma_tram_xuong, ngay_diem_danh, gio_len_xe, gio_xuong_xe, trang_thai_len_xe, trang_thai_xuong_xe, ghi_chu) VALUES(4, 2, 4, '2025-10-14', 'afternoon', '15:00:00', '16:00:00', 'completed', 32, 'Hoàn thành');

(1, 16, 1, 2, '2025-10-15 07:15:00', '07:15:00', '16:30:00', 'da_len', 'da_xuong', 'Đúng giờ'),

(2, 16, 1, 3, '2025-10-15 07:16:00', '07:16:00', '16:32:00', 'da_len', 'da_xuong', 'Đúng giờ'),-- September 2025 (40 schedules)

(3, 17, 2, 1, '2025-10-15 07:20:00', '07:20:00', '16:25:00', 'da_len', 'da_xuong', 'Đúng giờ'),INSERT INTO schedules (route_id, driver_id, bus_id, schedule_date, schedule_type, start_time, end_time, status, total_students, notes) VALUES

(4, 17, 3, 1, '2025-10-15 07:25:00', '07:25:00', '16:20:00', 'da_len', 'da_xuong', 'Đúng giờ'),(1, 1, 1, '2025-09-02', 'morning', '07:00:00', '08:30:00', 'completed', 43, 'Hoàn thành'),

(5, 18, 1, 4, '2025-10-15 07:30:00', '07:30:00', '16:45:00', 'da_len', 'da_xuong', 'Đúng giờ'),(1, 1, 1, '2025-09-02', 'afternoon', '15:00:00', '16:30:00', 'completed', 43, 'Hoàn thành'),

(2, 2, 2, '2025-09-02', 'morning', '07:00:00', '08:00:00', 'completed', 36, 'Hoàn thành'),

(1, 19, 1, 2, '2025-10-16 07:17:00', '07:17:00', '16:31:00', 'da_len', 'da_xuong', 'Muộn 2 phút'),(2, 2, 2, '2025-09-02', 'afternoon', '15:30:00', '16:30:00', 'completed', 36, 'Hoàn thành'),

(2, 19, 1, 3, '2025-10-16 07:18:00', '07:18:00', '16:34:00', 'da_len', 'da_xuong', 'Muộn 2 phút'),

(3, 20, 2, 1, '2025-10-16 07:23:00', '07:23:00', '16:28:00', 'da_len', 'da_xuong', 'Muộn 3 phút'),(1, 1, 1, '2025-09-09', 'morning', '07:00:00', '08:30:00', 'completed', 44, 'Hoàn thành'),

(4, 20, 3, 1, '2025-10-16 07:28:00', '07:28:00', '16:23:00', 'da_len', 'da_xuong', 'Muộn 3 phút'),(1, 1, 1, '2025-09-09', 'afternoon', '15:00:00', '16:30:00', 'completed', 44, 'Hoàn thành'),

(5, 21, 1, 4, '2025-10-16 07:33:00', '07:33:00', '16:48:00', 'da_len', 'da_xuong', 'Muộn 3 phút');(2, 2, 2, '2025-09-09', 'morning', '07:00:00', '08:00:00', 'completed', 38, 'Hoàn thành'),

(2, 2, 2, '2025-09-09', 'afternoon', '15:30:00', '16:30:00', 'completed', 38, 'Trễ 5 phút'),

-- Thêm dữ liệu bảo dưỡng xe (baoduong table)

INSERT INTO baoduong (ma_xe, ngay_bao_duong, loai_bao_duong, mo_ta, chi_phi, trang_thai, ghi_chu) VALUES(1, 1, 1, '2025-09-16', 'morning', '07:00:00', '08:30:00', 'completed', 45, 'Hoàn thành'),

(1, '2025-10-01', 'bao_duong_dinh_ky', 'Thay dầu máy, kiểm tra phanh, thay lọc gió', 1500000.00, 'hoan_thanh', 'Bảo dưỡng 3 tháng'),(1, 1, 1, '2025-09-16', 'afternoon', '15:00:00', '16:30:00', 'completed', 45, 'Hoàn thành'),

(2, '2025-10-03', 'sua_chua', 'Sửa hệ thống điều hòa không hoạt động', 800000.00, 'hoan_thanh', 'Thay gas điều hòa'),(2, 2, 2, '2025-09-16', 'morning', '07:00:00', '08:00:00', 'completed', 39, 'Hoàn thành'),

(3, '2025-10-05', 'bao_duong_dinh_ky', 'Thay dầu máy, kiểm tra lốp xe, bôi trơn khớp nối', 1200000.00, 'hoan_thanh', 'Bảo dưỡng 3 tháng'),(2, 2, 2, '2025-09-16', 'afternoon', '15:30:00', '16:30:00', 'completed', 39, 'Hoàn thành'),

(1, '2025-10-08', 'sua_chua', 'Thay bóng đèn pha trước bên phải', 150000.00, 'hoan_thanh', 'Bóng đèn cháy'),

(4, '2025-10-10', 'bao_duong_dinh_ky', 'Thay dầu máy, kiểm tra phanh, thay lọc nhiên liệu', 1300000.00, 'hoan_thanh', 'Bảo dưỡng 3 tháng'),(1, 1, 1, '2025-09-23', 'morning', '07:00:00', '08:30:00', 'completed', 45, 'Hoàn thành'),

(2, '2025-10-12', 'sua_chua', 'Sửa hệ thống phanh ABS báo lỗi', 2500000.00, 'dang_xu_ly', 'Cần thay cảm biến ABS'),(1, 1, 1, '2025-09-23', 'afternoon', '15:00:00', '16:30:00', 'completed', 45, 'Hoàn thành'),

(5, '2025-10-14', 'bao_duong_dinh_ky', 'Thay dầu máy, kiểm tra hệ thống làm mát', 1100000.00, 'hoan_thanh', 'Bảo dưỡng 3 tháng'),(2, 2, 2, '2025-09-23', 'morning', '07:00:00', '08:00:00', 'completed', 40, 'Hoàn thành'),

(3, '2025-10-15', 'sua_chua', 'Thay lốp xe phía sau do mòn quá mức', 1800000.00, 'dang_xu_ly', 'Cần thay 2 lốp sau'),(2, 2, 2, '2025-09-23', 'afternoon', '15:30:00', '16:30:00', 'completed', 40, 'Hoàn thành'),

(1, '2025-10-16', 'kiem_tra', 'Kiểm tra định kỳ an toàn giao thông', 200000.00, 'hoan_thanh', 'Kiểm tra 6 tháng'),

(4, '2025-10-17', 'sua_chua', 'Sửa cửa xe tự động không đóng được', 600000.00, 'dang_xu_ly', 'Thay motor cửa'),(1, 1, 1, '2025-09-30', 'morning', '07:00:00', '08:30:00', 'completed', 45, 'Hoàn thành'),

(5, '2025-10-18', 'kiem_tra', 'Kiểm tra hệ thống GPS và camera', 300000.00, 'hoan_thanh', 'Tất cả hoạt động bình thường'),(1, 1, 1, '2025-09-30', 'afternoon', '15:00:00', '16:30:00', 'completed', 45, 'Hoàn thành'),

(2, '2025-10-19', 'bao_duong_dinh_ky', 'Thay dầu hộp số, kiểm tra hệ thống truyền động', 1600000.00, 'cho_duyet', 'Chờ phê duyệt chi phí'),(2, 2, 2, '2025-09-30', 'morning', '07:00:00', '08:00:00', 'completed', 41, 'Hoàn thành'),

(3, '2025-10-20', 'sua_chua', 'Thay kính chắn gió do bị nứt', 2200000.00, 'cho_duyet', 'Chờ đặt hàng kính mới');(2, 2, 2, '2025-09-30', 'afternoon', '15:30:00', '16:30:00', 'completed', 41, 'Hoàn thành'),



-- Thêm dữ liệu lịch trình mẫu bổ sung (nếu chưa có đủ)(3, 1, 3, '2025-09-02', 'morning', '07:00:00', '08:15:00', 'completed', 33, 'Hoàn thành'),

INSERT INTO lichtrinh (ma_tuyen, ma_xe, ma_tai_xe, ngay_chay, gio_bat_dau, gio_ket_thuc, trang_thai_lich) VALUES(3, 1, 3, '2025-09-09', 'morning', '07:00:00', '08:15:00', 'completed', 34, 'Hoàn thành'),

-- Tuần 1(3, 1, 3, '2025-09-16', 'morning', '07:00:00', '08:15:00', 'completed', 35, 'Hoàn thành'),

(1, 1, 1, '2025-10-08', '07:00:00', '17:00:00', 'hoan_thanh'),(3, 1, 3, '2025-09-23', 'morning', '07:00:00', '08:15:00', 'completed', 36, 'Hoàn thành'),

(2, 2, 2, '2025-10-08', '07:15:00', '17:15:00', 'hoan_thanh'),(3, 1, 3, '2025-09-30', 'morning', '07:00:00', '08:15:00', 'completed', 37, 'Hoàn thành'),

(3, 3, 3, '2025-10-08', '07:30:00', '17:30:00', 'hoan_thanh'),

(4, 2, 4, '2025-09-02', 'afternoon', '15:00:00', '16:00:00', 'completed', 28, 'Hoàn thành'),

(1, 1, 1, '2025-10-09', '07:00:00', '17:00:00', 'hoan_thanh'),(4, 2, 4, '2025-09-09', 'afternoon', '15:00:00', '16:00:00', 'completed', 29, 'Hoàn thành'),

(2, 2, 2, '2025-10-09', '07:15:00', '17:15:00', 'hoan_thanh'),(4, 2, 4, '2025-09-16', 'afternoon', '15:00:00', '16:00:00', 'completed', 30, 'Hoàn thành'),

(3, 3, 3, '2025-10-09', '07:30:00', '17:30:00', 'hoan_thanh'),(4, 2, 4, '2025-09-23', 'afternoon', '15:00:00', '16:00:00', 'completed', 31, 'Trễ 10 phút'),

(4, 2, 4, '2025-09-30', 'afternoon', '15:00:00', '16:00:00', 'completed', 32, 'Hoàn thành'),

(1, 1, 1, '2025-10-10', '07:00:00', '17:00:00', 'hoan_thanh'),

(2, 2, 2, '2025-10-10', '07:15:00', '17:15:00', 'hoan_thanh'),-- Additional routes for diversity

(3, 3, 3, '2025-10-10', '07:30:00', '17:30:00', 'hoan_thanh'),(1, 1, 1, '2025-09-05', 'morning', '07:00:00', '08:30:00', 'completed', 44, 'Hoàn thành'),

(1, 1, 1, '2025-09-12', 'morning', '07:00:00', '08:30:00', 'completed', 45, 'Hoàn thành'),

(1, 1, 1, '2025-10-11', '07:00:00', '17:00:00', 'hoan_thanh'),(1, 1, 1, '2025-09-19', 'morning', '07:00:00', '08:30:00', 'completed', 45, 'Hoàn thành'),

(2, 2, 2, '2025-10-11', '07:15:00', '17:15:00', 'hoan_thanh'),(1, 1, 1, '2025-09-26', 'morning', '07:00:00', '08:30:00', 'completed', 45, 'Hoàn thành'),

(3, 3, 3, '2025-10-11', '07:30:00', '17:30:00', 'hoan_thanh'),

(2, 2, 2, '2025-09-05', 'afternoon', '15:30:00', '16:30:00', 'completed', 37, 'Hoàn thành'),

(1, 1, 1, '2025-10-12', '07:00:00', '17:00:00', 'hoan_thanh'),(2, 2, 2, '2025-09-12', 'afternoon', '15:30:00', '16:30:00', 'completed', 38, 'Hoàn thành'),

(2, 2, 2, '2025-10-12', '07:15:00', '17:15:00', 'hoan_thanh'),(2, 2, 2, '2025-09-19', 'afternoon', '15:30:00', '16:30:00', 'completed', 39, 'Hoàn thành'),

(3, 3, 3, '2025-10-12', '07:30:00', '17:30:00', 'hoan_thanh'),(2, 2, 2, '2025-09-26', 'afternoon', '15:30:00', '16:30:00', 'completed', 40, 'Hoàn thành');



-- Tuần 2-- August 2025 (35 schedules)

(1, 1, 1, '2025-10-15', '07:00:00', '17:00:00', 'hoan_thanh'),INSERT INTO schedules (route_id, driver_id, bus_id, schedule_date, schedule_type, start_time, end_time, status, total_students, notes) VALUES

(2, 2, 2, '2025-10-15', '07:15:00', '17:15:00', 'hoan_thanh'),(1, 1, 1, '2025-08-05', 'morning', '07:00:00', '08:30:00', 'completed', 42, 'Hoàn thành'),

(3, 3, 3, '2025-10-15', '07:30:00', '17:30:00', 'hoan_thanh'),(1, 1, 1, '2025-08-05', 'afternoon', '15:00:00', '16:30:00', 'completed', 42, 'Hoàn thành'),

(2, 2, 2, '2025-08-05', 'morning', '07:00:00', '08:00:00', 'completed', 35, 'Hoàn thành'),

(1, 1, 1, '2025-10-16', '07:00:00', '17:00:00', 'hoan_thanh'),(2, 2, 2, '2025-08-05', 'afternoon', '15:30:00', '16:30:00', 'completed', 35, 'Hoàn thành'),

(2, 2, 2, '2025-10-16', '07:15:00', '17:15:00', 'hoan_thanh'),

(3, 3, 3, '2025-10-16', '07:30:00', '17:30:00', 'hoan_thanh');(1, 1, 1, '2025-08-12', 'morning', '07:00:00', '08:30:00', 'completed', 43, 'Hoàn thành'),

(1, 1, 1, '2025-08-12', 'afternoon', '15:00:00', '16:30:00', 'completed', 43, 'Hoàn thành'),

-- Kiểm tra dữ liệu đã tạo(2, 2, 2, '2025-08-12', 'morning', '07:00:00', '08:00:00', 'completed', 36, 'Hoàn thành'),

SELECT 'Tổng số bản ghi điểm danh:' as thong_tin, COUNT(*) as so_luong FROM diemdanh(2, 2, 2, '2025-08-12', 'afternoon', '15:30:00', '16:30:00', 'completed', 36, 'Trễ 8 phút'),

UNION ALL

SELECT 'Tổng số bản ghi bảo dưỡng:', COUNT(*) FROM baoduong(1, 1, 1, '2025-08-19', 'morning', '07:00:00', '08:30:00', 'completed', 44, 'Hoàn thành'),

UNION ALL  (1, 1, 1, '2025-08-19', 'afternoon', '15:00:00', '16:30:00', 'completed', 44, 'Hoàn thành'),

SELECT 'Tổng số bản ghi lịch trình:', COUNT(*) FROM lichtrinh;(2, 2, 2, '2025-08-19', 'morning', '07:00:00', '08:00:00', 'completed', 37, 'Hoàn thành'),

(2, 2, 2, '2025-08-19', 'afternoon', '15:30:00', '16:30:00', 'completed', 37, 'Hoàn thành'),

-- Kiểm tra dữ liệu điểm danh theo ngày

SELECT (1, 1, 1, '2025-08-26', 'morning', '07:00:00', '08:30:00', 'completed', 45, 'Hoàn thành'),

    DATE(ngay_diem_danh) as ngay,(1, 1, 1, '2025-08-26', 'afternoon', '15:00:00', '16:30:00', 'completed', 45, 'Hoàn thành'),

    COUNT(*) as so_luong_diem_danh,(2, 2, 2, '2025-08-26', 'morning', '07:00:00', '08:00:00', 'completed', 38, 'Hoàn thành'),

    COUNT(CASE WHEN trang_thai_len_xe = 'da_len' THEN 1 END) as da_len_xe,(2, 2, 2, '2025-08-26', 'afternoon', '15:30:00', '16:30:00', 'completed', 38, 'Hoàn thành'),

    COUNT(CASE WHEN trang_thai_len_xe = 'vang_mat' THEN 1 END) as vang_mat

FROM diemdanh (3, 1, 3, '2025-08-05', 'morning', '07:00:00', '08:15:00', 'completed', 32, 'Hoàn thành'),

GROUP BY DATE(ngay_diem_danh)(3, 1, 3, '2025-08-12', 'morning', '07:00:00', '08:15:00', 'completed', 33, 'Hoàn thành'),

ORDER BY ngay DESC;(3, 1, 3, '2025-08-19', 'morning', '07:00:00', '08:15:00', 'completed', 34, 'Hoàn thành'),
(3, 1, 3, '2025-08-26', 'morning', '07:00:00', '08:15:00', 'completed', 35, 'Hoàn thành'),

(4, 2, 4, '2025-08-05', 'afternoon', '15:00:00', '16:00:00', 'completed', 26, 'Hoàn thành'),
(4, 2, 4, '2025-08-12', 'afternoon', '15:00:00', '16:00:00', 'completed', 27, 'Hoàn thành'),
(4, 2, 4, '2025-08-19', 'afternoon', '15:00:00', '16:00:00', 'completed', 28, 'Hoàn thành'),
(4, 2, 4, '2025-08-26', 'afternoon', '15:00:00', '16:00:00', 'completed', 29, 'Trễ 12 phút'),

(1, 1, 1, '2025-08-07', 'morning', '07:00:00', '08:30:00', 'completed', 43, 'Hoàn thành'),
(1, 1, 1, '2025-08-14', 'morning', '07:00:00', '08:30:00', 'completed', 44, 'Hoàn thành'),
(1, 1, 1, '2025-08-21', 'morning', '07:00:00', '08:30:00', 'completed', 44, 'Hoàn thành'),
(1, 1, 1, '2025-08-28', 'morning', '07:00:00', '08:30:00', 'completed', 45, 'Hoàn thành'),

(2, 2, 2, '2025-08-07', 'afternoon', '15:30:00', '16:30:00', 'completed', 36, 'Hoàn thành'),
(2, 2, 2, '2025-08-14', 'afternoon', '15:30:00', '16:30:00', 'completed', 37, 'Hoàn thành'),
(2, 2, 2, '2025-08-21', 'afternoon', '15:30:00', '16:30:00', 'completed', 37, 'Hoàn thành'),
(2, 2, 2, '2025-08-28', 'afternoon', '15:30:00', '16:30:00', 'completed', 38, 'Hoàn thành');

-- July, June, May 2025 (30 schedules each)
-- July
INSERT INTO schedules (route_id, driver_id, bus_id, schedule_date, schedule_type, start_time, end_time, status, total_students, notes) VALUES
(1, 1, 1, '2025-07-07', 'morning', '07:00:00', '08:30:00', 'completed', 40, 'Hoàn thành'),
(1, 1, 1, '2025-07-14', 'morning', '07:00:00', '08:30:00', 'completed', 41, 'Hoàn thành'),
(1, 1, 1, '2025-07-21', 'morning', '07:00:00', '08:30:00', 'completed', 42, 'Hoàn thành'),
(1, 1, 1, '2025-07-28', 'morning', '07:00:00', '08:30:00', 'completed', 43, 'Hoàn thành'),
(2, 2, 2, '2025-07-07', 'afternoon', '15:30:00', '16:30:00', 'completed', 34, 'Hoàn thành'),
(2, 2, 2, '2025-07-14', 'afternoon', '15:30:00', '16:30:00', 'completed', 35, 'Hoàn thành'),
(2, 2, 2, '2025-07-21', 'afternoon', '15:30:00', '16:30:00', 'completed', 35, 'Trễ 5 phút'),
(2, 2, 2, '2025-07-28', 'afternoon', '15:30:00', '16:30:00', 'completed', 36, 'Hoàn thành');

-- June
INSERT INTO schedules (route_id, driver_id, bus_id, schedule_date, schedule_type, start_time, end_time, status, total_students, notes) VALUES
(1, 1, 1, '2025-06-02', 'morning', '07:00:00', '08:30:00', 'completed', 38, 'Hoàn thành'),
(1, 1, 1, '2025-06-09', 'morning', '07:00:00', '08:30:00', 'completed', 39, 'Hoàn thành'),
(1, 1, 1, '2025-06-16', 'morning', '07:00:00', '08:30:00', 'completed', 40, 'Hoàn thành'),
(1, 1, 1, '2025-06-23', 'morning', '07:00:00', '08:30:00', 'completed', 40, 'Hoàn thành'),
(2, 2, 2, '2025-06-02', 'afternoon', '15:30:00', '16:30:00', 'completed', 32, 'Hoàn thành'),
(2, 2, 2, '2025-06-09', 'afternoon', '15:30:00', '16:30:00', 'completed', 33, 'Hoàn thành'),
(2, 2, 2, '2025-06-16', 'afternoon', '15:30:00', '16:30:00', 'completed', 34, 'Hoàn thành'),
(2, 2, 2, '2025-06-23', 'afternoon', '15:30:00', '16:30:00', 'completed', 34, 'Hoàn thành');

-- May
INSERT INTO schedules (route_id, driver_id, bus_id, schedule_date, schedule_type, start_time, end_time, status, total_students, notes) VALUES
(1, 1, 1, '2025-05-05', 'morning', '07:00:00', '08:30:00', 'completed', 36, 'Hoàn thành'),
(1, 1, 1, '2025-05-12', 'morning', '07:00:00', '08:30:00', 'completed', 37, 'Hoàn thành'),
(1, 1, 1, '2025-05-19', 'morning', '07:00:00', '08:30:00', 'completed', 38, 'Hoàn thành'),
(1, 1, 1, '2025-05-26', 'morning', '07:00:00', '08:30:00', 'completed', 38, 'Trễ 10 phút'),
(2, 2, 2, '2025-05-05', 'afternoon', '15:30:00', '16:30:00', 'completed', 30, 'Hoàn thành'),
(2, 2, 2, '2025-05-12', 'afternoon', '15:30:00', '16:30:00', 'completed', 31, 'Hoàn thành'),
(2, 2, 2, '2025-05-19', 'afternoon', '15:30:00', '16:30:00', 'completed', 32, 'Hoàn thành'),
(2, 2, 2, '2025-05-26', 'afternoon', '15:30:00', '16:30:00', 'completed', 32, 'Hoàn thành');

-- ==========================================
-- 2. ADD STUDENT ATTENDANCE RECORDS
-- ==========================================

-- Link students to recent schedules (last 20 schedule IDs)
-- Note: Adjust the schedule IDs based on your actual data
-- This creates attendance records for students in each schedule

INSERT INTO student_attendance (student_id, schedule_id, stop_id, attendance_type, status, actual_time, scheduled_time, checked_by_driver_id, parent_notified)
SELECT 
  s.id as student_id,
  sch.id as schedule_id,
  s.pickup_stop_id as stop_id,
  'pickup' as attendance_type,
  'present' as status,
  TIMESTAMP(sch.schedule_date, sch.start_time) as actual_time,
  sch.start_time as scheduled_time,
  sch.driver_id as checked_by_driver_id,
  TRUE as parent_notified
FROM students s
CROSS JOIN (
  SELECT * FROM schedules 
  WHERE schedule_date >= '2025-09-01' 
  AND schedule_type = 'morning'
  ORDER BY id DESC 
  LIMIT 20
) sch
WHERE s.status = 'active'
AND s.route_id = sch.route_id
LIMIT 500;

INSERT INTO student_attendance (student_id, schedule_id, stop_id, attendance_type, status, actual_time, scheduled_time, checked_by_driver_id, parent_notified)
SELECT 
  s.id as student_id,
  sch.id as schedule_id,
  s.dropoff_stop_id as stop_id,
  'dropoff' as attendance_type,
  'present' as status,
  TIMESTAMP(sch.schedule_date, sch.end_time) as actual_time,
  sch.end_time as scheduled_time,
  sch.driver_id as checked_by_driver_id,
  TRUE as parent_notified
FROM students s
CROSS JOIN (
  SELECT * FROM schedules 
  WHERE schedule_date >= '2025-09-01' 
  AND schedule_type = 'afternoon'
  ORDER BY id DESC 
  LIMIT 20
) sch
WHERE s.status = 'active'
AND s.route_id = sch.route_id
LIMIT 500;

-- ==========================================
-- 3. ADD MAINTENANCE RECORDS
-- ==========================================

-- Add maintenance records for buses
INSERT INTO maintenance_records (bus_id, maintenance_type, title, description, scheduled_date, start_date, completion_date, cost, vendor, vendor_contact, status)
VALUES
-- Bus 1 maintenance
(1, 'routine', 'Bảo dưỡng định kỳ tháng 9', 'Thay dầu, kiểm tra phanh, lốp xe', '2025-09-15', '2025-09-15', '2025-09-15', 3500000, 'Garage ABC', '0912345678', 'completed'),
(1, 'inspection', 'Kiểm định an toàn', 'Kiểm định an toàn 6 tháng', '2025-08-01', '2025-08-01', '2025-08-01', 1500000, 'Trung tâm đăng kiểm', '0923456789', 'completed'),
(1, 'repair', 'Sửa hệ thống điều hòa', 'Sửa chữa máy lạnh không hoạt động', '2025-07-20', '2025-07-20', '2025-07-21', 8500000, 'Garage XYZ', '0934567890', 'completed'),

-- Bus 2 maintenance
(2, 'routine', 'Bảo dưỡng định kỳ tháng 9', 'Thay dầu, lọc gió, kiểm tra hệ thống', '2025-09-20', '2025-09-20', '2025-09-20', 3200000, 'Garage ABC', '0912345678', 'completed'),
(2, 'inspection', 'Kiểm định an toàn', 'Kiểm định an toàn 6 tháng', '2025-08-05', '2025-08-05', '2025-08-05', 1500000, 'Trung tâm đăng kiểm', '0923456789', 'completed'),
(2, 'repair', 'Thay lốp xe', 'Thay 4 lốp xe mới', '2025-06-15', '2025-06-15', '2025-06-15', 12000000, 'Cửa hàng lốp DEF', '0945678901', 'completed'),

-- Bus 3 maintenance
(3, 'routine', 'Bảo dưỡng định kỳ tháng 10', 'Thay dầu, kiểm tra toàn bộ hệ thống', '2025-10-10', '2025-10-10', '2025-10-10', 3800000, 'Garage ABC', '0912345678', 'completed'),
(3, 'emergency', 'Sửa hệ thống phanh khẩn cấp', 'Phanh bị yếu, cần sửa ngay', '2025-09-25', '2025-09-25', '2025-09-26', 15000000, 'Garage GHI', '0956789012', 'completed'),
(3, 'inspection', 'Kiểm định an toàn', 'Kiểm định an toàn 6 tháng', '2025-07-10', '2025-07-10', '2025-07-10', 1500000, 'Trung tâm đăng kiểm', '0923456789', 'completed'),

-- Bus 4 maintenance
(4, 'routine', 'Bảo dưỡng định kỳ tháng 8', 'Bảo dưỡng toàn diện', '2025-08-25', '2025-08-25', '2025-08-25', 4000000, 'Garage ABC', '0912345678', 'completed'),
(4, 'repair', 'Sửa hệ thống điện', 'Sửa đèn và hệ thống điện', '2025-07-05', '2025-07-05', '2025-07-06', 6500000, 'Garage JKL', '0967890123', 'completed'),

-- Bus 5 maintenance
(5, 'routine', 'Bảo dưỡng định kỳ tháng 9', 'Thay dầu và bảo dưỡng', '2025-09-10', '2025-09-10', '2025-09-10', 3300000, 'Garage ABC', '0912345678', 'completed'),
(5, 'inspection', 'Kiểm định an toàn', 'Kiểm định an toàn hàng năm', '2025-06-20', '2025-06-20', '2025-06-20', 1500000, 'Trung tâm đăng kiểm', '0923456789', 'completed');

-- ==========================================
-- 4. VERIFICATION QUERIES
-- ==========================================

-- Count schedules by month
SELECT 
  DATE_FORMAT(schedule_date, '%Y-%m') as month,
  COUNT(*) as total_schedules
FROM schedules
WHERE schedule_date >= '2025-05-01'
GROUP BY DATE_FORMAT(schedule_date, '%Y-%m')
ORDER BY month DESC;

-- Count attendance records
SELECT COUNT(*) as total_attendance FROM student_attendance;

-- Count maintenance records
SELECT 
  bus_id,
  COUNT(*) as total_maintenance,
  SUM(cost) as total_cost
FROM maintenance_records
GROUP BY bus_id
ORDER BY bus_id;

-- Display summary
SELECT 
  'Total Schedules' as metric,
  COUNT(*) as count
FROM schedules
WHERE schedule_date >= '2025-05-01'
UNION ALL
SELECT 
  'Total Attendance Records',
  COUNT(*)
FROM student_attendance
UNION ALL
SELECT 
  'Total Maintenance Records',
  COUNT(*)
FROM maintenance_records
UNION ALL
SELECT 
  'Active Students',
  COUNT(*)
FROM students
WHERE status = 'active'
UNION ALL
SELECT 
  'Active Drivers',
  COUNT(*)
FROM drivers
WHERE status = 'active';

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

SELECT '✅ Sample data inserted successfully!' as status,
       'You can now test the Reports API with realistic data' as message;
