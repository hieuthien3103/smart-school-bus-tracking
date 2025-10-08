# Hướng dẫn cài đặt và khởi động hệ thống Smart School Bus

## 1. Cài đặt Database (MySQL)

### Bước 1: Cài đặt MySQL Server
```bash
# Windows - Tải từ https://dev.mysql.com/downloads/mysql/
# hoặc sử dụng XAMPP/WAMP

# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# CentOS/RHEL
sudo yum install mysql-server
```

### Bước 2: Tạo Database và User
```sql
-- Đăng nhập MySQL với quyền root
mysql -u root -p

-- Tạo database
CREATE DATABASE smart_school_bus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user và cấp quyền
CREATE USER 'school_bus_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON smart_school_bus.* TO 'school_bus_user'@'localhost';
FLUSH PRIVILEGES;

-- Thoát MySQL
EXIT;
```

### Bước 3: Import Database Schema
```bash
# Import schema
mysql -u school_bus_user -p smart_school_bus < backend/database/smart_school_bus_schema.sql

# Import sample data (optional)
mysql -u school_bus_user -p smart_school_bus < backend/database/sample_data.sql
```

## 2. Cài đặt Backend (Node.js/Express)

### Bước 1: Cài đặt Node.js
- Tải và cài đặt Node.js từ https://nodejs.org/ (version 18+ recommended)
- Kiểm tra: `node --version` và `npm --version`

### Bước 2: Cài đặt dependencies
```bash
cd backend
npm install
```

### Bước 3: Cấu hình environment
```bash
# Copy file environment example
cp .env.example .env

# Chỉnh sửa file .env với thông tin database của bạn
notepad .env  # Windows
nano .env     # Linux/Mac
```

### Bước 4: Khởi động Backend Server
```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start

# Server sẽ chạy tại: http://localhost:5000
```

## 3. Cài đặt Frontend (React/Vite)

### Bước 1: Cài đặt dependencies
```bash
# Từ thư mục gốc
npm install
```

### Bước 2: Cấu hình environment
```bash
# File .env đã được tạo với cấu hình mặc định:
# VITE_API_BASE_URL=http://localhost:5000/api
# VITE_WS_URL=ws://localhost:5000
```

### Bước 3: Khởi động Frontend
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Frontend sẽ chạy tại: http://localhost:5173
```

## 4. Kiểm tra hệ thống

### Bước 1: Kiểm tra Backend API
```bash
# Test API health check
curl http://localhost:5000/api/health

# Test students endpoint
curl http://localhost:5000/api/students
```

### Bước 2: Kiểm tra Frontend
- Mở trình duyệt: http://localhost:5173
- Kiểm tra console không có lỗi
- Test login/logout functionality

### Bước 3: Kiểm tra kết nối Database
- Xem logs backend server
- Test CRUD operations qua frontend
- Kiểm tra data trong MySQL

## 5. Troubleshooting

### Lỗi kết nối Database
```bash
# Kiểm tra MySQL service
# Windows (XAMPP)
- Khởi động MySQL trong XAMPP Control Panel

# Linux
sudo systemctl status mysql
sudo systemctl start mysql

# Kiểm tra port MySQL (mặc định 3306)
netstat -an | grep 3306
```

### Lỗi Backend không khởi động
```bash
# Kiểm tra logs
npm run dev

# Kiểm tra port 5000 có bị sử dụng
netstat -an | grep 5000

# Clear npm cache
npm cache clean --force
rm -rf node_modules
npm install
```

### Lỗi Frontend không load được API
```bash
# Kiểm tra CORS settings trong backend
# Kiểm tra API URL trong .env
# Kiểm tra network tab trong browser DevTools
```

## 6. Cấu hình Production

### Backend
```bash
# Set environment
export NODE_ENV=production

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name "school-bus-api"
pm2 startup
pm2 save
```

### Frontend
```bash
# Build production
npm run build

# Serve with nginx/apache
# Copy dist/ folder to web server
```

### Database
```sql
-- Tạo backup định kỳ
mysqldump -u school_bus_user -p smart_school_bus > backup_$(date +%Y%m%d).sql

-- Optimize tables
OPTIMIZE TABLE students, buses, routes, schedules;
```

## 7. Tính năng chính

### Authentication
- Login/Logout cho Driver, Admin, Parent
- JWT token authentication
- Role-based access control

### Driver Dashboard
- Xem danh sách học sinh cần đón/trả
- Check-in/Check-out học sinh
- Xem lộ trình
- Báo cáo vấn đề

### Admin Dashboard
- Quản lý học sinh, tài xế, xe bus
- Xem báo cáo thống kê
- Cấu hình lộ trình
- Gửi thông báo

### Parent Portal
- Theo dõi con em
- Xem lịch sử đi lại
- Nhận thông báo real-time

### Real-time Features
- GPS tracking (planned)
- Live notifications
- Status updates

## 8. API Documentation

### Base URL: http://localhost:5000/api

### Endpoints chính:
- `GET /health` - Health check
- `POST /auth/login` - Đăng nhập
- `GET /students` - Danh sách học sinh
- `POST /students` - Tạo học sinh mới
- `GET /buses` - Danh sách xe bus
- `GET /routes` - Danh sách lộ trình
- `GET /attendance` - Điểm danh

Để biết thêm chi tiết, xem file `backend/routes/` cho từng endpoint cụ thể.

## 9. Liên hệ hỗ trợ

Nếu gặp vấn đề trong quá trình cài đặt:
1. Kiểm tra logs trong terminal
2. Xem file README.md
3. Kiểm tra phiên bản Node.js và MySQL
4. Đảm bảo tất cả dependencies đã được cài đặt đúng