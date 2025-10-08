-- ==========================================
-- SMART SCHOOL BUS - SAMPLE DATA INSERT
-- Based on existing mockData from React app
-- ==========================================

USE smart_school_bus;

-- ==========================================
-- CLEAR EXISTING DATA (in proper order to avoid FK constraints)
-- ==========================================

-- Disable safe update mode and foreign key checks temporarily
SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- Clear data from all tables
DELETE FROM audit_logs;
DELETE FROM system_settings;
DELETE FROM notifications;
DELETE FROM student_attendance;
DELETE FROM bus_tracking;
DELETE FROM schedules;
DELETE FROM student_parents;
DELETE FROM students;
DELETE FROM parents;
DELETE FROM route_stops;
DELETE FROM routes;
DELETE FROM drivers;
DELETE FROM buses;
DELETE FROM schools;
DELETE FROM users;

-- Re-enable foreign key checks and safe update mode
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- Reset auto-increment counters
ALTER TABLE schools AUTO_INCREMENT = 1;
ALTER TABLE buses AUTO_INCREMENT = 1;
ALTER TABLE drivers AUTO_INCREMENT = 1;
ALTER TABLE routes AUTO_INCREMENT = 1;
ALTER TABLE route_stops AUTO_INCREMENT = 1;
ALTER TABLE parents AUTO_INCREMENT = 1;
ALTER TABLE students AUTO_INCREMENT = 1;
ALTER TABLE schedules AUTO_INCREMENT = 1;
ALTER TABLE bus_tracking AUTO_INCREMENT = 1;
ALTER TABLE student_attendance AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;
ALTER TABLE audit_logs AUTO_INCREMENT = 1;
ALTER TABLE system_settings AUTO_INCREMENT = 1;

-- ==========================================
-- 1. USERS DATA (Admin, Drivers, Parents)
-- ==========================================

-- Admin user
INSERT INTO users (id, name, email, password_hash, role, permissions, phone, is_active) VALUES
('admin-001', 'Quản trị viên', 'admin@smartschoolbus.com', '$2b$10$example_hash_admin', 'admin', '["all"]', '0900000000', TRUE);

-- Driver users
INSERT INTO users (id, name, email, password_hash, role, permissions, phone, is_active) VALUES
('driver-001', 'Nguyễn Văn A', 'driver1@smartschoolbus.com', '$2b$10$example_hash_driver1', 'driver', '["drive", "attendance"]', '0901111111', TRUE),
('driver-002', 'Trần Thị B', 'driver2@smartschoolbus.com', '$2b$10$example_hash_driver2', 'driver', '["drive", "attendance"]', '0902222222', TRUE),
('driver-003', 'Lê Văn C', 'driver3@smartschoolbus.com', '$2b$10$example_hash_driver3', 'driver', '["drive", "attendance"]', '0903333333', TRUE);

-- Parent users (sample for first few students)
INSERT INTO users (id, name, email, password_hash, role, permissions, phone, is_active) VALUES
('parent-001', 'Nguyễn Văn Tuấn', 'parent1@gmail.com', '$2b$10$example_hash_parent1', 'parent', '["view_child"]', '0901234567', TRUE),
('parent-002', 'Trần Văn Hải', 'parent2@gmail.com', '$2b$10$example_hash_parent2', 'parent', '["view_child"]', '0902345678', TRUE),
('parent-003', 'Lê Thị Mai', 'parent3@gmail.com', '$2b$10$example_hash_parent3', 'parent', '["view_child"]', '0903456789', TRUE),
('parent-004', 'Phạm Văn Đức', 'parent4@gmail.com', '$2b$10$example_hash_parent4', 'parent', '["view_child"]', '0904567890', TRUE),
('parent-005', 'Vũ Thị Lan', 'parent5@gmail.com', '$2b$10$example_hash_parent5', 'parent', '["view_child"]', '0905678901', TRUE);

-- ==========================================
-- 2. SCHOOLS DATA
-- ==========================================

INSERT IGNORE INTO schools (id, name, address, phone, email, principal_name, coordinates) VALUES
(1, 'Trường THCS Giảng Võ', '46 Nguyễn Thái Học, Ba Đình, Hà Nội', '024-3734-5678', 'info@giangvo.edu.vn', 'Nguyễn Văn Hiệu trưởng', ST_GeomFromText('POINT(105.8342 21.0278)')),
(2, 'Trường THPT Chu Văn An', '28 Nguyễn Thái Học, Ba Đình, Hà Nội', '024-3733-1234', 'info@cva.edu.vn', 'Trần Thị Hiệu trưởng', ST_GeomFromText('POINT(105.8335 21.0285)'));

-- ==========================================
-- 3. BUSES DATA
-- ==========================================

INSERT IGNORE INTO buses (id, bus_number, license_plate, model, capacity, year_manufactured, fuel_type, status, last_maintenance_date, next_maintenance_date) VALUES
(1, 'BS001', '29A-12345', 'Hyundai County', 45, 2023, 'diesel', 'active', '2024-09-15', '2024-12-15'),
(2, 'BS002', '29A-12346', 'Hyundai County', 45, 2023, 'diesel', 'active', '2024-09-20', '2024-12-20'),
(3, 'BS003', '29A-12347', 'Hyundai Universe', 50, 2024, 'diesel', 'active', '2024-10-01', '2025-01-01');

-- ==========================================
-- 4. DRIVERS DATA
-- ==========================================

INSERT IGNORE INTO drivers (id, user_id, employee_id, license_number, license_type, license_expiry, experience_years, current_bus_id, status, hire_date) VALUES
(1, 'driver-001', 'DRV001', 'D123456789', 'D', '2025-12-31', 10, 1, 'active', '2020-01-15'),
(2, 'driver-002', 'DRV002', 'D123456790', 'D', '2026-06-30', 8, 2, 'active', '2021-03-20'),
(3, 'driver-003', 'DRV003', 'D123456791', 'D', '2025-09-15', 5, 3, 'active', '2022-08-10');

-- ==========================================
-- 5. ROUTES DATA
-- ==========================================

INSERT IGNORE INTO routes (id, route_name, route_code, description, start_time, end_time, estimated_duration_minutes, distance_km, school_id, is_active) VALUES
(1, 'Tuyến A1', 'A1', 'Tuyến từ khu vực Láng Hạ đến trường THCS Giảng Võ', '07:00:00', '08:00:00', 60, 12.5, 1, TRUE),
(2, 'Tuyến B2', 'B2', 'Tuyến từ khu vực Hoàng Diệu đến trường THPT Chu Văn An', '07:15:00', '08:15:00', 60, 15.2, 2, TRUE),
(3, 'Tuyến C3', 'C3', 'Tuyến từ khu vực Thống Nhất đến trường THCS Giảng Võ', '07:30:00', '08:30:00', 60, 18.7, 1, TRUE);

-- ==========================================
-- 6. ROUTE STOPS DATA
-- ==========================================

-- Route A1 stops
INSERT INTO route_stops (route_id, stop_name, address, coordinates, stop_order, pickup_time_morning, dropoff_time_afternoon) VALUES
(1, 'Điểm đón Láng Hạ', '123 Ngõ Láng Hạ', ST_GeomFromText('POINT(105.8340 21.0290)'), 1, '07:15:00', '16:30:00'),
(1, 'Điểm đón Thái Thịnh', '45 Phố Thái Thịnh', ST_GeomFromText('POINT(105.8345 21.0295)'), 2, '07:18:00', '16:32:00'),
(1, 'Điểm đón Đống Đa', '67 Đường Đống Đa', ST_GeomFromText('POINT(105.8350 21.0300)'), 3, '07:20:00', '16:35:00'),
(1, 'Trường THCS Giảng Võ', '46 Nguyễn Thái Học', ST_GeomFromText('POINT(105.8342 21.0278)'), 4, '07:50:00', '16:00:00');

-- Route B2 stops  
INSERT INTO route_stops (route_id, stop_name, address, coordinates, stop_order, pickup_time_morning, dropoff_time_afternoon) VALUES
(2, 'Điểm đón Hoàng Diệu', '77 Đường Hoàng Diệu', ST_GeomFromText('POINT(105.8320 21.0250)'), 1, '07:20:00', '16:35:00'),
(2, 'Điểm đón Lê Duẩn', '88 Ngõ Lê Duẩn', ST_GeomFromText('POINT(105.8325 21.0255)'), 2, '07:22:00', '16:38:00'),
(2, 'Điểm đón Tràng Tiền', '99 Phố Tràng Tiền', ST_GeomFromText('POINT(105.8330 21.0260)'), 3, '07:25:00', '16:40:00'),
(2, 'Trường THPT Chu Văn An', '28 Nguyễn Thái Học', ST_GeomFromText('POINT(105.8335 21.0285)'), 4, '07:55:00', '16:05:00');

-- Route C3 stops
INSERT INTO route_stops (route_id, stop_name, address, coordinates, stop_order, pickup_time_morning, dropoff_time_afternoon) VALUES
(3, 'Điểm đón Thống Nhất', '111 Phố Thống Nhất', ST_GeomFromText('POINT(105.8360 21.0310)'), 1, '07:25:00', '16:40:00'),
(3, 'Điểm đón Nguyễn Du', '222 Đường Nguyễn Du', ST_GeomFromText('POINT(105.8365 21.0315)'), 2, '07:28:00', '16:42:00'),
(3, 'Điểm đón Hai Bà Trưng', '333 Phố Hai Bà Trưng', ST_GeomFromText('POINT(105.8370 21.0320)'), 3, '07:30:00', '16:45:00'),
(3, 'Trường THCS Giảng Võ', '46 Nguyễn Thái Học', ST_GeomFromText('POINT(105.8342 21.0278)'), 4, '08:00:00', '16:10:00');

-- ==========================================
-- 7. PARENTS DATA
-- ==========================================

INSERT INTO parents (id, user_id, parent_type, occupation, workplace) VALUES
(1, 'parent-001', 'father', 'Kỹ sư', 'Công ty TNHH ABC'),
(2, 'parent-002', 'father', 'Giáo viên', 'Trường THPT XYZ'),
(3, 'parent-003', 'mother', 'Bác sĩ', 'Bệnh viện Bạch Mai'),
(4, 'parent-004', 'father', 'Kinh doanh', 'Công ty DEF'),
(5, 'parent-005', 'mother', 'Nhân viên văn phòng', 'Tập đoàn GHI');

-- ==========================================
-- 8. STUDENTS DATA (based on mockData)
-- ==========================================

-- Students for Route A1 (BS001)
INSERT INTO students (id, student_code, name, grade, class, date_of_birth, gender, address, pickup_address, dropoff_address, school_id, route_id, stop_id, status) VALUES
(1, 'STU001', 'Nguyễn Minh An', 'Lớp 6A', '6A1', '2012-03-15', 'male', '123 Ngõ Láng Hạ', '123 Ngõ Láng Hạ', 'Trường THCS Giảng Võ', 1, 1, 1, 'active'),
(2, 'STU002', 'Trần Thúy Linh', 'Lớp 6B', '6B1', '2012-05-20', 'female', '45 Phố Thái Thịnh', '45 Phố Thái Thịnh', 'Trường THCS Giảng Võ', 1, 1, 2, 'active'),
(3, 'STU003', 'Lê Hoàng Nam', 'Lớp 7A', '7A1', '2011-08-10', 'male', '67 Đường Đống Đa', '67 Đường Đống Đa', 'Trường THCS Giảng Võ', 1, 1, 3, 'active'),
(4, 'STU004', 'Phạm Thu Hà', 'Lớp 7B', '7B1', '2011-12-05', 'female', '89 Phố Huế', '89 Phố Huế', 'Trường THCS Giảng Võ', 1, 1, 3, 'active'),
(5, 'STU005', 'Vũ Đức Anh', 'Lớp 8A', '8A1', '2010-09-18', 'male', '12 Ngõ Quỳnh', '12 Ngõ Quỳnh', 'Trường THCS Giảng Võ', 1, 1, 3, 'active'),
(6, 'STU006', 'Hoàng Minh Quân', 'Lớp 8B', '8B1', '2010-11-22', 'male', '34 Phố Tôn Đức Thắng', '34 Phố Tôn Đức Thắng', 'Trường THCS Giảng Võ', 1, 1, 3, 'active'),
(7, 'STU007', 'Ngô Thị Hương', 'Lớp 9A', '9A1', '2009-07-30', 'female', '56 Đường Bà Triệu', '56 Đường Bà Triệu', 'Trường THCS Giảng Võ', 1, 1, 3, 'active'),
(8, 'STU008', 'Đặng Văn Khoa', 'Lớp 9B', '9B1', '2009-04-14', 'male', '78 Ngõ Hàng Bạc', '78 Ngõ Hàng Bạc', 'Trường THCS Giảng Võ', 1, 1, 3, 'active'),
(9, 'STU009', 'Bùi Thị Nga', 'Lớp 6C', '6C1', '2012-01-08', 'female', '90 Phố Hàng Gai', '90 Phố Hàng Gai', 'Trường THCS Giảng Võ', 1, 1, 3, 'active'),
(10, 'STU010', 'Lương Đức Thành', 'Lớp 7C', '7C1', '2011-10-25', 'male', '11 Đường Lý Thường Kiệt', '11 Đường Lý Thường Kiệt', 'Trường THCS Giảng Võ', 1, 1, 3, 'active'),
(11, 'STU011', 'Phan Thị Mai', 'Lớp 8C', '8C1', '2010-06-12', 'female', '22 Ngõ Trần Hưng Đạo', '22 Ngõ Trần Hưng Đạo', 'Trường THCS Giảng Võ', 1, 1, 3, 'active'),
(12, 'STU012', 'Cao Minh Đức', 'Lớp 9C', '9C1', '2009-02-28', 'male', '33 Phố Đinh Tiên Hoàng', '33 Phố Đinh Tiên Hoàng', 'Trường THCS Giảng Võ', 1, 1, 3, 'active'),
(13, 'STU013', 'Nguyễn Thu Trang', 'Lớp 6D', '6D1', '2012-08-16', 'female', '44 Đường Lê Lợi', '44 Đường Lê Lợi', 'Trường THCS Giảng Võ', 1, 1, 3, 'active'),
(14, 'STU014', 'Trần Đức Hiếu', 'Lớp 7D', '7D1', '2011-11-09', 'male', '55 Ngõ Nguyễn Du', '55 Ngõ Nguyễn Du', 'Trường THCS Giảng Võ', 1, 1, 3, 'active'),
(15, 'STU015', 'Lê Thị Hồng', 'Lớp 8D', '8D1', '2010-03-21', 'female', '66 Phố Hàng Khay', '66 Phố Hàng Khay', 'Trường THCS Giảng Võ', 1, 1, 3, 'active');

-- Students for Route B2 (BS002) - Trường THPT Chu Văn An
INSERT INTO students (id, student_code, name, grade, class, date_of_birth, gender, address, pickup_address, dropoff_address, school_id, route_id, stop_id, status) VALUES
(16, 'STU016', 'Phạm Minh Tuấn', 'Lớp 6A', '6A2', '2012-04-18', 'male', '77 Đường Hoàng Diệu', '77 Đường Hoàng Diệu', 'Trường THPT Chu Văn An', 2, 2, 5, 'active'),
(17, 'STU017', 'Vũ Thu Hương', 'Lớp 6B', '6B2', '2012-07-23', 'female', '88 Ngõ Lê Duẩn', '88 Ngõ Lê Duẩn', 'Trường THPT Chu Văn An', 2, 2, 6, 'active'),
(18, 'STU018', 'Hoàng Văn Lâm', 'Lớp 7A', '7A2', '2011-09-14', 'male', '99 Phố Tràng Tiền', '99 Phố Tràng Tiền', 'Trường THPT Chu Văn An', 2, 2, 7, 'active'),
(19, 'STU019', 'Ngô Thị Lan', 'Lớp 7B', '7B2', '2011-01-27', 'female', '10 Đường Nguyễn Thái Học', '10 Đường Nguyễn Thái Học', 'Trường THPT Chu Văn An', 2, 2, 7, 'active'),
(20, 'STU020', 'Đặng Minh Hoàng', 'Lớp 8A', '8A2', '2010-05-11', 'male', '21 Ngõ Hàng Bông', '21 Ngõ Hàng Bông', 'Trường THPT Chu Văn An', 2, 2, 7, 'active'),
(21, 'STU021', 'Bùi Thị Quỳnh', 'Lớp 8B', '8B2', '2010-12-03', 'female', '32 Phố Cầu Gỗ', '32 Phố Cầu Gỗ', 'Trường THPT Chu Văn An', 2, 2, 7, 'active'),
(22, 'STU022', 'Lương Văn Hải', 'Lớp 9A', '9A2', '2009-08-19', 'male', '43 Đường Hàng Bài', '43 Đường Hàng Bài', 'Trường THPT Chu Văn An', 2, 2, 7, 'active'),
(23, 'STU023', 'Phan Thị Ngọc', 'Lớp 9B', '9B2', '2009-03-06', 'female', '54 Ngõ Lò Sũ', '54 Ngõ Lò Sũ', 'Trường THPT Chu Văn An', 2, 2, 7, 'active'),
(24, 'STU024', 'Cao Đức Thắng', 'Lớp 6C', '6C2', '2012-10-13', 'male', '65 Phố Nhà Thờ', '65 Phố Nhà Thờ', 'Trường THPT Chu Văn An', 2, 2, 7, 'active'),
(25, 'STU025', 'Nguyễn Thị Uyên', 'Lớp 7C', '7C2', '2011-06-29', 'female', '76 Đường Hàng Ngang', '76 Đường Hàng Ngang', 'Trường THPT Chu Văn An', 2, 2, 7, 'active'),
(26, 'STU026', 'Trần Minh Nhật', 'Lớp 8C', '8C2', '2010-02-15', 'male', '87 Ngõ Hàng Đào', '87 Ngõ Hàng Đào', 'Trường THPT Chu Văn An', 2, 2, 7, 'active'),
(27, 'STU027', 'Lê Thị Bích', 'Lớp 9C', '9C2', '2009-11-07', 'female', '98 Phố Lý Quốc Sư', '98 Phố Lý Quốc Sư', 'Trường THPT Chu Văn An', 2, 2, 7, 'active'),
(28, 'STU028', 'Phạm Văn Tú', 'Lớp 6D', '6D2', '2012-09-24', 'male', '19 Đường Hàng Trống', '19 Đường Hàng Trống', 'Trường THPT Chu Văn An', 2, 2, 7, 'active'),
(29, 'STU029', 'Vũ Thị Phương', 'Lớp 7D', '7D2', '2011-04-12', 'female', '20 Ngõ Đinh Lễ', '20 Ngõ Đinh Lễ', 'Trường THPT Chu Văn An', 2, 2, 7, 'active'),
(30, 'STU030', 'Hoàng Đức Mạnh', 'Lớp 8D', '8D2', '2010-07-05', 'male', '31 Phố Hàng Mã', '31 Phố Hàng Mã', 'Trường THPT Chu Văn An', 2, 2, 7, 'active');

-- Students for Route C3 (BS003) - Back to Trường THCS Giảng Võ
INSERT INTO students (id, student_code, name, grade, class, date_of_birth, gender, address, pickup_address, dropoff_address, school_id, route_id, stop_id, status) VALUES
(31, 'STU031', 'Ngô Minh Quang', 'Lớp 6A', '6A3', '2012-12-17', 'male', '111 Phố Thống Nhất', '111 Phố Thống Nhất', 'Trường THCS Giảng Võ', 1, 3, 9, 'active'),
(32, 'STU032', 'Đặng Thúy Kiều', 'Lớp 6B', '6B3', '2012-05-31', 'female', '222 Đường Nguyễn Du', '222 Đường Nguyễn Du', 'Trường THCS Giảng Võ', 1, 3, 10, 'active'),
(33, 'STU033', 'Bùi Hoàng Long', 'Lớp 7A', '7A3', '2011-08-26', 'male', '333 Phố Hai Bà Trưng', '333 Phố Hai Bà Trưng', 'Trường THCS Giảng Võ', 1, 3, 11, 'active'),
(34, 'STU034', 'Lương Thu Thảo', 'Lớp 7B', '7B3', '2011-03-13', 'female', '444 Đường Lê Thánh Tông', '444 Đường Lê Thánh Tông', 'Trường THCS Giảng Võ', 1, 3, 11, 'active'),
(35, 'STU035', 'Phan Đức Minh', 'Lớp 8A', '8A3', '2010-10-08', 'male', '555 Ngõ Nguyễn Huy Tưởng', '555 Ngõ Nguyễn Huy Tưởng', 'Trường THCS Giảng Võ', 1, 3, 11, 'active'),
(36, 'STU036', 'Cao Thị Loan', 'Lớp 8B', '8B3', '2010-01-21', 'female', '666 Phố Kim Mã', '666 Phố Kim Mã', 'Trường THCS Giảng Võ', 1, 3, 11, 'active'),
(37, 'STU037', 'Nguyễn Văn Phong', 'Lớp 9A', '9A3', '2009-06-16', 'male', '777 Đường Giải Phóng', '777 Đường Giải Phóng', 'Trường THCS Giảng Võ', 1, 3, 11, 'active'),
(38, 'STU038', 'Trần Thị Thương', 'Lớp 9B', '9B3', '2009-11-04', 'female', '888 Ngõ Phạm Ngọc Thạch', '888 Ngõ Phạm Ngọc Thạch', 'Trường THCS Giảng Võ', 1, 3, 11, 'active'),
(39, 'STU039', 'Lê Minh Tâm', 'Lớp 6C', '6C3', '2012-02-09', 'male', '999 Phố Trần Đại Nghĩa', '999 Phố Trần Đại Nghĩa', 'Trường THCS Giảng Võ', 1, 3, 11, 'active'),
(40, 'STU040', 'Phạm Thị Xuân', 'Lớp 7C', '7C3', '2011-09-22', 'female', '101 Đường Hoàng Quốc Việt', '101 Đường Hoàng Quốc Việt', 'Trường THCS Giảng Võ', 1, 3, 11, 'active'),
(41, 'STU041', 'Vũ Đức Nam', 'Lớp 8C', '8C3', '2010-04-07', 'male', '202 Ngõ Cầu Giấy', '202 Ngõ Cầu Giấy', 'Trường THCS Giảng Võ', 1, 3, 11, 'active'),
(42, 'STU042', 'Hoàng Thị Yến', 'Lớp 9C', '9C3', '2009-12-19', 'female', '303 Phố Xuân Thủy', '303 Phố Xuân Thủy', 'Trường THCS Giảng Võ', 1, 3, 11, 'active'),
(43, 'STU043', 'Đặng Văn Hùng', 'Lớp 6D', '6D3', '2012-07-11', 'male', '404 Đường Láng', '404 Đường Láng', 'Trường THCS Giảng Võ', 1, 3, 11, 'active'),
(44, 'STU044', 'Bùi Thị Linh', 'Lớp 7D', '7D3', '2011-01-25', 'female', '505 Ngõ Đại Cồ Việt', '505 Ngõ Đại Cồ Việt', 'Trường THCS Giảng Võ', 1, 3, 11, 'active'),
(45, 'STU045', 'Lương Minh Khôi', 'Lớp 8D', '8D3', '2010-08-14', 'male', '606 Phố Thái Hà', '606 Phố Thái Hà', 'Trường THCS Giảng Võ', 1, 3, 11, 'active');

-- ==========================================
-- 9. STUDENT-PARENT RELATIONSHIPS
-- ==========================================

INSERT INTO student_parents (student_id, parent_id, relationship, is_primary_contact, is_emergency_contact, can_pickup) VALUES
(1, 1, 'father', TRUE, TRUE, TRUE),
(2, 2, 'father', TRUE, TRUE, TRUE),
(3, 3, 'mother', TRUE, TRUE, TRUE),
(4, 4, 'father', TRUE, TRUE, TRUE),
(5, 5, 'mother', TRUE, TRUE, TRUE);

-- ==========================================
-- 10. CURRENT SCHEDULES
-- ==========================================

-- Today's morning schedules
INSERT INTO schedules (id, route_id, driver_id, bus_id, schedule_date, schedule_type, start_time, end_time, status, total_students) VALUES
(1, 1, 1, 1, CURDATE(), 'morning', '07:00:00', '08:00:00', 'completed', 15),
(2, 2, 2, 2, CURDATE(), 'morning', '07:15:00', '08:15:00', 'completed', 15),
(3, 3, 3, 3, CURDATE(), 'morning', '07:30:00', '08:30:00', 'completed', 15);

-- Today's afternoon schedules
INSERT INTO schedules (id, route_id, driver_id, bus_id, schedule_date, schedule_type, start_time, end_time, status, total_students) VALUES
(4, 1, 1, 1, CURDATE(), 'afternoon', '16:00:00', '17:00:00', 'scheduled', 15),
(5, 2, 2, 2, CURDATE(), 'afternoon', '16:05:00', '17:05:00', 'scheduled', 15),
(6, 3, 3, 3, CURDATE(), 'afternoon', '16:10:00', '17:10:00', 'scheduled', 15);

-- ==========================================
-- 11. SAMPLE TRACKING DATA (Last 2 hours)
-- ==========================================

-- Bus BS001 tracking
INSERT INTO bus_tracking (bus_id, driver_id, schedule_id, latitude, longitude, speed, direction, status, engine_status, fuel_level, temperature, recorded_at) VALUES
(1, 1, 4, 21.0285, 105.8542, 25, 45, 'moving', 'on', 85.5, 92, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(1, 1, 4, 21.0280, 105.8540, 30, 50, 'moving', 'on', 85.3, 93, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(1, 1, 4, 21.0275, 105.8538, 0, 45, 'stopped', 'on', 85.1, 91, DATE_SUB(NOW(), INTERVAL 15 MINUTE));

-- Bus BS002 tracking
INSERT INTO bus_tracking (bus_id, driver_id, schedule_id, latitude, longitude, speed, direction, status, engine_status, fuel_level, temperature, recorded_at) VALUES
(2, 2, 5, 21.0245, 105.8412, 0, 90, 'stopped', 'on', 78.2, 89, DATE_SUB(NOW(), INTERVAL 1 MINUTE)),
(2, 2, 5, 21.0240, 105.8410, 15, 85, 'moving', 'on', 78.0, 90, DATE_SUB(NOW(), INTERVAL 6 MINUTE)),
(2, 2, 5, 21.0235, 105.8408, 20, 80, 'moving', 'on', 77.8, 88, DATE_SUB(NOW(), INTERVAL 11 MINUTE));

-- Bus BS003 tracking
INSERT INTO bus_tracking (bus_id, driver_id, schedule_id, latitude, longitude, speed, direction, status, engine_status, fuel_level, temperature, recorded_at) VALUES
(3, 3, 6, 21.0311, 105.8372, 35, 180, 'moving', 'on', 72.5, 87, DATE_SUB(NOW(), INTERVAL 30 SECOND)),
(3, 3, 6, 21.0315, 105.8375, 40, 175, 'moving', 'on', 72.3, 86, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(3, 3, 6, 21.0320, 105.8378, 25, 170, 'moving', 'on', 72.1, 85, DATE_SUB(NOW(), INTERVAL 10 MINUTE));

-- ==========================================
-- 12. SAMPLE ATTENDANCE DATA
-- ==========================================

-- Morning attendance for some students
INSERT INTO student_attendance (student_id, schedule_id, stop_id, attendance_type, status, actual_time, checked_by_driver_id, notes) VALUES
(1, 1, 1, 'pickup', 'present', '2024-10-01 07:15:30', 1, 'Đón đúng giờ'),
(2, 1, 2, 'pickup', 'present', '2024-10-01 07:18:45', 1, 'Đón đúng giờ'),
(3, 1, 3, 'pickup', 'late', '2024-10-01 07:25:10', 1, 'Muộn 5 phút'),
(16, 2, 5, 'pickup', 'present', '2024-10-01 07:20:15', 2, 'Đón đúng giờ'),
(17, 2, 6, 'pickup', 'absent', NULL, 2, 'Không có mặt tại điểm đón'),
(31, 3, 9, 'pickup', 'present', '2024-10-01 07:25:20', 3, 'Đón đúng giờ');

-- ==========================================
-- 13. SAMPLE NOTIFICATIONS
-- ==========================================

INSERT INTO notifications (type, title, message, priority, target_type, target_user_id, student_id, created_at) VALUES
('attendance', 'Học sinh vắng mặt', 'Học sinh Vũ Thu Hương không có mặt tại điểm đón sáng nay', 'medium', 'specific_user', 'parent-002', 17, NOW()),
('delay', 'Xe buýt chậm trễ', 'Xe buýt BS001 chậm 10 phút do tắc đường', 'low', 'parents', NULL, NULL, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('general', 'Thông báo bảo trì', 'Xe buýt BS003 sẽ bảo trì định kỳ vào cuối tuần', 'medium', 'all', NULL, NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- ==========================================
-- 14. SYSTEM SETTINGS
-- ==========================================

INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('app_name', 'Smart School Bus', 'string', 'Tên ứng dụng', TRUE),
('app_version', '1.0.0', 'string', 'Phiên bản ứng dụng', TRUE),
('max_students_per_bus', '45', 'number', 'Số học sinh tối đa trên một xe', FALSE),
('default_pickup_buffer_minutes', '5', 'number', 'Thời gian buffer mặc định cho việc đón (phút)', FALSE),
('default_dropoff_buffer_minutes', '5', 'number', 'Thời gian buffer mặc định cho việc trả (phút)', FALSE),
('enable_real_time_tracking', 'true', 'boolean', 'Bật theo dõi thời gian thực', FALSE),
('tracking_update_interval_seconds', '30', 'number', 'Khoảng thời gian cập nhật vị trí (giây)', FALSE),
('notification_settings', '{"email": true, "sms": true, "push": true}', 'json', 'Cài đặt thông báo', FALSE),
('school_start_time', '08:00:00', 'string', 'Giờ bắt đầu học', TRUE),
('school_end_time', '16:00:00', 'string', 'Giờ kết thúc học', TRUE),
('emergency_contact', '113', 'string', 'Số điện thoại khẩn cấp', TRUE),
('support_email', 'support@smartschoolbus.com', 'string', 'Email hỗ trợ', TRUE),
('company_address', '123 Đường ABC, Quận XYZ, Hà Nội', 'string', 'Địa chỉ công ty', TRUE);

-- ==========================================
-- COMPLETION MESSAGE
-- ==========================================

SELECT 'Sample data inserted successfully!' as message,
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM students) as total_students,
       (SELECT COUNT(*) FROM drivers) as total_drivers,
       (SELECT COUNT(*) FROM buses) as total_buses,
       (SELECT COUNT(*) FROM routes) as total_routes;