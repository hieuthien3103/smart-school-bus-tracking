-- ==========================================
-- SMART SCHOOL BUS DATABASE SCHEMA
-- Version: 1.0
-- Date: October 2025
-- ==========================================

-- Create database
CREATE DATABASE IF NOT EXISTS smart_school_bus;
USE smart_school_bus;

-- Set timezone and charset
SET time_zone = '+07:00';
SET NAMES utf8mb4;

-- ==========================================
-- 1. USERS TABLE - Authentication & Authorization
-- ==========================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'parent', 'driver') NOT NULL,
    permissions JSON,
    avatar VARCHAR(500),
    phone VARCHAR(15),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- ==========================================
-- 2. SCHOOLS TABLE - School Information
-- ==========================================
CREATE TABLE schools (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(255),
    principal_name VARCHAR(100),
    coordinates POINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    SPATIAL INDEX idx_coordinates (coordinates)
);

-- ==========================================
-- 3. BUSES TABLE - Bus Information
-- ==========================================
CREATE TABLE buses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bus_number VARCHAR(10) UNIQUE NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(100),
    capacity INT NOT NULL DEFAULT 45,
    year_manufactured YEAR,
    fuel_type ENUM('gasoline', 'diesel', 'electric', 'hybrid') DEFAULT 'diesel',
    status ENUM('active', 'maintenance', 'retired', 'breakdown') DEFAULT 'active',
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    insurance_expiry DATE,
    inspection_expiry DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_bus_number (bus_number),
    INDEX idx_status (status),
    INDEX idx_maintenance (next_maintenance_date)
);

-- ==========================================
-- 4. DRIVERS TABLE - Driver Information
-- ==========================================
CREATE TABLE drivers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(36) NOT NULL,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_type VARCHAR(10) NOT NULL,
    license_expiry DATE NOT NULL,
    experience_years INT DEFAULT 0,
    current_bus_id INT,
    status ENUM('active', 'on_leave', 'suspended', 'retired') DEFAULT 'active',
    hire_date DATE,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (current_bus_id) REFERENCES buses(id) ON DELETE SET NULL,
    INDEX idx_employee_id (employee_id),
    INDEX idx_license (license_number),
    INDEX idx_status (status)
);

-- ==========================================
-- 5. ROUTES TABLE - Bus Routes
-- ==========================================
CREATE TABLE routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_name VARCHAR(100) NOT NULL,
    route_code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    estimated_duration_minutes INT,
    distance_km DECIMAL(6,2),
    school_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (school_id) REFERENCES schools(id),
    INDEX idx_route_code (route_code),
    INDEX idx_active (is_active)
);

-- ==========================================
-- 6. ROUTE_STOPS TABLE - Stops along routes
-- ==========================================
CREATE TABLE route_stops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT NOT NULL,
    stop_name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    coordinates POINT,
    stop_order INT NOT NULL,
    estimated_arrival_time TIME,
    pickup_time_morning TIME,
    dropoff_time_afternoon TIME,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_route_order (route_id, stop_order),
    SPATIAL INDEX idx_coordinates (coordinates),
    UNIQUE KEY uk_route_stop_order (route_id, stop_order)
);

-- ==========================================
-- 7. PARENTS TABLE - Parent Information
-- ==========================================
CREATE TABLE parents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(36) NOT NULL,
    parent_type ENUM('father', 'mother', 'guardian') NOT NULL,
    occupation VARCHAR(100),
    workplace VARCHAR(200),
    workplace_address TEXT,
    workplace_phone VARCHAR(15),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    emergency_contact_relation VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_parent_type (parent_type)
);

-- ==========================================
-- 8. STUDENTS TABLE - Student Information
-- ==========================================
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    class VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female') NOT NULL,
    address TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    school_id INT NOT NULL,
    route_id INT,
    stop_id INT,
    status ENUM('active', 'inactive', 'transferred', 'graduated') DEFAULT 'active',
    medical_notes TEXT,
    allergies TEXT,
    emergency_instructions TEXT,
    photo VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (school_id) REFERENCES schools(id),
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
    FOREIGN KEY (stop_id) REFERENCES route_stops(id) ON DELETE SET NULL,
    INDEX idx_student_code (student_code),
    INDEX idx_grade (grade),
    INDEX idx_status (status),
    INDEX idx_route (route_id)
);

-- ==========================================
-- 9. STUDENT_PARENTS TABLE - Student-Parent Relationship
-- ==========================================
CREATE TABLE student_parents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    parent_id INT NOT NULL,
    relationship ENUM('father', 'mother', 'guardian') NOT NULL,
    is_primary_contact BOOLEAN DEFAULT FALSE,
    is_emergency_contact BOOLEAN DEFAULT FALSE,
    can_pickup BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    UNIQUE KEY uk_student_parent (student_id, parent_id),
    INDEX idx_primary_contact (is_primary_contact),
    INDEX idx_emergency_contact (is_emergency_contact)
);

-- ==========================================
-- 10. SCHEDULES TABLE - Daily Schedules
-- ==========================================
CREATE TABLE schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT NOT NULL,
    driver_id INT NOT NULL,
    bus_id INT NOT NULL,
    schedule_date DATE NOT NULL,
    schedule_type ENUM('morning', 'afternoon') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    total_students INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (route_id) REFERENCES routes(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (bus_id) REFERENCES buses(id),
    INDEX idx_schedule_date (schedule_date),
    INDEX idx_route_date (route_id, schedule_date),
    INDEX idx_driver_date (driver_id, schedule_date),
    INDEX idx_status (status),
    UNIQUE KEY uk_route_date_type (route_id, schedule_date, schedule_type)
);

-- ==========================================
-- 11. BUS_TRACKING TABLE - Real-time Bus Location
-- ==========================================
CREATE TABLE bus_tracking (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bus_id INT NOT NULL,
    driver_id INT NOT NULL,
    schedule_id INT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2) DEFAULT 0,
    direction DECIMAL(5, 2) DEFAULT 0,
    altitude DECIMAL(8, 2),
    accuracy_meters DECIMAL(6, 2),
    status ENUM('parked', 'moving', 'stopped', 'emergency', 'maintenance') DEFAULT 'parked',
    engine_status ENUM('on', 'off') DEFAULT 'off',
    fuel_level DECIMAL(5, 2),
    temperature DECIMAL(5, 2),
    mileage DECIMAL(10, 2),
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (bus_id) REFERENCES buses(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL,
    INDEX idx_bus_time (bus_id, recorded_at DESC),
    INDEX idx_schedule (schedule_id),
    INDEX idx_recorded_at (recorded_at DESC),
    SPATIAL INDEX idx_location (latitude, longitude)
);

-- ==========================================
-- 12. STUDENT_ATTENDANCE TABLE - Student Check-in/out
-- ==========================================
CREATE TABLE student_attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    schedule_id INT NOT NULL,
    stop_id INT NOT NULL,
    attendance_type ENUM('pickup', 'dropoff') NOT NULL,
    status ENUM('present', 'absent', 'late', 'early_leave') NOT NULL,
    actual_time TIMESTAMP,
    scheduled_time TIME,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    checked_by_driver_id INT,
    notes TEXT,
    parent_notified BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (stop_id) REFERENCES route_stops(id),
    FOREIGN KEY (checked_by_driver_id) REFERENCES drivers(id),
    INDEX idx_student_date (student_id, created_at DESC),
    INDEX idx_schedule (schedule_id),
    INDEX idx_attendance_type (attendance_type),
    INDEX idx_status (status),
    UNIQUE KEY uk_student_schedule_type (student_id, schedule_id, attendance_type)
);

-- ==========================================
-- 13. NOTIFICATIONS TABLE - System Notifications
-- ==========================================
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('attendance', 'delay', 'emergency', 'maintenance', 'general') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    sender_id VARCHAR(36),
    target_type ENUM('all', 'parents', 'drivers', 'admins', 'specific_user') NOT NULL,
    target_user_id VARCHAR(36),
    student_id INT,
    route_id INT,
    bus_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_target_user (target_user_id),
    INDEX idx_type (type),
    INDEX idx_priority (priority),
    INDEX idx_read_status (is_read),
    INDEX idx_created_at (created_at DESC)
);

-- ==========================================
-- 14. INCIDENTS TABLE - Safety Incidents
-- ==========================================
CREATE TABLE incidents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_type ENUM('accident', 'breakdown', 'medical', 'behavioral', 'weather', 'traffic', 'other') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    bus_id INT,
    driver_id INT,
    route_id INT,
    student_id INT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_description TEXT,
    incident_time TIMESTAMP NOT NULL,
    reported_by_id VARCHAR(36) NOT NULL,
    status ENUM('open', 'investigating', 'resolved', 'closed') DEFAULT 'open',
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    resolved_by_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE SET NULL,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    FOREIGN KEY (reported_by_id) REFERENCES users(id),
    FOREIGN KEY (resolved_by_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_incident_type (incident_type),
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_incident_time (incident_time DESC)
);

-- ==========================================
-- 15. MAINTENANCE_RECORDS TABLE - Bus Maintenance
-- ==========================================
CREATE TABLE maintenance_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bus_id INT NOT NULL,
    maintenance_type ENUM('routine', 'repair', 'inspection', 'emergency') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_date DATE,
    start_date DATE,
    completion_date DATE,
    cost DECIMAL(10, 2),
    vendor VARCHAR(200),
    vendor_contact VARCHAR(100),
    parts_replaced TEXT,
    next_maintenance_date DATE,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    created_by_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users(id),
    INDEX idx_bus_id (bus_id),
    INDEX idx_maintenance_type (maintenance_type),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date)
);

-- ==========================================
-- 16. SYSTEM_SETTINGS TABLE - Application Settings
-- ==========================================
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by_id VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_public (is_public)
);

-- ==========================================
-- 17. AUDIT_LOGS TABLE - System Audit Trail
-- ==========================================
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_action (user_id, action),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_created_at (created_at DESC)
);

-- ==========================================
-- VIEWS FOR COMMON QUERIES
-- ==========================================

-- Current bus locations with driver info
CREATE VIEW view_current_bus_locations AS
SELECT 
    b.id as bus_id,
    b.bus_number,
    b.license_plate,
    d.id as driver_id,
    u.name as driver_name,
    u.phone as driver_phone,
    bt.latitude,
    bt.longitude,
    bt.speed,
    bt.direction,
    bt.status as tracking_status,
    bt.recorded_at,
    s.id as schedule_id,
    r.route_name,
    r.route_code
FROM buses b
LEFT JOIN drivers d ON b.id = d.current_bus_id
LEFT JOIN users u ON d.user_id = u.id
LEFT JOIN bus_tracking bt ON b.id = bt.bus_id 
LEFT JOIN schedules s ON bt.schedule_id = s.id
LEFT JOIN routes r ON s.route_id = r.id
WHERE bt.id = (
    SELECT MAX(id) FROM bus_tracking bt2 WHERE bt2.bus_id = b.id
);

-- Student details with parent info
CREATE VIEW view_student_details AS
SELECT 
    s.id,
    s.student_code,
    s.name,
    s.grade,
    s.class,
    s.pickup_address,
    s.dropoff_address,
    s.status,
    sc.name as school_name,
    r.route_name,
    r.route_code,
    GROUP_CONCAT(
        CONCAT(p_users.name, ' (', sp.relationship, '): ', p_users.phone)
        SEPARATOR '; '
    ) as parent_contacts
FROM students s
LEFT JOIN schools sc ON s.school_id = sc.id
LEFT JOIN routes r ON s.route_id = r.id
LEFT JOIN student_parents sp ON s.id = sp.student_id
LEFT JOIN parents p ON sp.parent_id = p.id
LEFT JOIN users p_users ON p.user_id = p_users.id
GROUP BY s.id;

-- Daily attendance summary
CREATE VIEW view_daily_attendance AS
SELECT 
    DATE(sa.created_at) as attendance_date,
    s.route_id,
    r.route_name,
    sa.attendance_type,
    COUNT(CASE WHEN sa.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN sa.status = 'absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN sa.status = 'late' THEN 1 END) as late_count,
    COUNT(*) as total_students
FROM student_attendance sa
JOIN students s ON sa.student_id = s.id
JOIN routes r ON s.route_id = r.id
GROUP BY DATE(sa.created_at), s.route_id, sa.attendance_type;

-- ==========================================
-- TRIGGERS FOR AUDIT LOGGING
-- ==========================================

DELIMITER //

-- Trigger for users table
CREATE TRIGGER users_audit_insert AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (NEW.id, 'INSERT', 'users', NEW.id, JSON_OBJECT(
        'name', NEW.name,
        'email', NEW.email,
        'role', NEW.role
    ));
END//

CREATE TRIGGER users_audit_update AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (NEW.id, 'UPDATE', 'users', NEW.id,
        JSON_OBJECT('name', OLD.name, 'email', OLD.email, 'role', OLD.role),
        JSON_OBJECT('name', NEW.name, 'email', NEW.email, 'role', NEW.role)
    );
END//

-- Trigger for student attendance
CREATE TRIGGER attendance_audit_insert AFTER INSERT ON student_attendance
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (NEW.checked_by_driver_id, 'INSERT', 'student_attendance', NEW.id, JSON_OBJECT(
        'student_id', NEW.student_id,
        'status', NEW.status,
        'attendance_type', NEW.attendance_type
    ));
END//

DELIMITER ;

-- ==========================================
-- STORED PROCEDURES
-- ==========================================

DELIMITER //

-- Get students by route
CREATE PROCEDURE GetStudentsByRoute(IN route_id INT)
BEGIN
    SELECT 
        s.*,
        GROUP_CONCAT(
            CONCAT(u.name, ' (', sp.relationship, '): ', u.phone)
            SEPARATOR '; '
        ) as parent_contacts
    FROM students s
    LEFT JOIN student_parents sp ON s.id = sp.student_id
    LEFT JOIN parents p ON sp.parent_id = p.id
    LEFT JOIN users u ON p.user_id = u.id
    WHERE s.route_id = route_id AND s.status = 'active'
    GROUP BY s.id
    ORDER BY s.name;
END//

-- Check in/out student
CREATE PROCEDURE CheckStudentAttendance(
    IN p_student_id INT,
    IN p_schedule_id INT,
    IN p_stop_id INT,
    IN p_attendance_type ENUM('pickup', 'dropoff'),
    IN p_status ENUM('present', 'absent', 'late', 'early_leave'),
    IN p_driver_id INT,
    IN p_location_lat DECIMAL(10, 8),
    IN p_location_lng DECIMAL(11, 8),
    IN p_notes TEXT
)
BEGIN
    DECLARE attendance_exists INT DEFAULT 0;
    
    -- Check if attendance record already exists
    SELECT COUNT(*) INTO attendance_exists
    FROM student_attendance
    WHERE student_id = p_student_id 
      AND schedule_id = p_schedule_id 
      AND attendance_type = p_attendance_type;
    
    IF attendance_exists = 0 THEN
        -- Insert new attendance record
        INSERT INTO student_attendance (
            student_id, schedule_id, stop_id, attendance_type, status,
            actual_time, checked_by_driver_id, location_lat, location_lng, notes
        ) VALUES (
            p_student_id, p_schedule_id, p_stop_id, p_attendance_type, p_status,
            NOW(), p_driver_id, p_location_lat, p_location_lng, p_notes
        );
    ELSE
        -- Update existing record
        UPDATE student_attendance 
        SET status = p_status,
            actual_time = NOW(),
            checked_by_driver_id = p_driver_id,
            location_lat = p_location_lat,
            location_lng = p_location_lng,
            notes = p_notes,
            updated_at = NOW()
        WHERE student_id = p_student_id 
          AND schedule_id = p_schedule_id 
          AND attendance_type = p_attendance_type;
    END IF;
END//

DELIMITER ;

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Additional composite indexes for common queries
CREATE INDEX idx_students_route_status ON students(route_id, status);
CREATE INDEX idx_attendance_student_date ON student_attendance(student_id, created_at DESC);
CREATE INDEX idx_tracking_bus_time ON bus_tracking(bus_id, recorded_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(target_user_id, is_read, created_at DESC);

-- ==========================================
-- INSERT DEFAULT DATA
-- ==========================================

-- Default admin user
INSERT INTO users (id, name, email, password_hash, role, permissions, phone) VALUES
(UUID(), 'Administrator', 'admin@smartschoolbus.com', '$2b$10$example_hash', 'admin', '["all"]', '0900000000');

-- Default school
INSERT INTO schools (name, address, phone, email, principal_name) VALUES
('Trường THCS Giảng Võ', '46 Nguyễn Thái Học, Ba Đình, Hà Nội', '024-3734-5678', 'info@giangvo.edu.vn', 'Nguyễn Văn Hiệu trưởng');

-- Default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('app_name', 'Smart School Bus', 'string', 'Application name', true),
('max_students_per_bus', '45', 'number', 'Maximum students per bus', false),
('default_pickup_buffer_minutes', '5', 'number', 'Default buffer time for pickup', false),
('enable_real_time_tracking', 'true', 'boolean', 'Enable real-time GPS tracking', false),
('notification_settings', '{"email": true, "sms": true, "push": true}', 'json', 'Notification preferences', false);

-- ==========================================
-- COMPLETION MESSAGE
-- ==========================================
SELECT 'Smart School Bus Database created successfully!' as message;