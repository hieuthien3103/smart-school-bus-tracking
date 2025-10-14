# 📦 SETUP GUIDE FOR COLLABORATOR

## ✅ **FILES CẦN GỬI CHO BẠN:**

### **📁 Cấu trúc cần gửi:**
```
smart-school-bus/
├── packages/                    ✅ Bắt buộc  
│   ├── frontend/               ✅ React app
│   ├── backend/                ✅ Node.js API
│   └── shared/                 ✅ Shared types
├── database/                   ✅ Database files
├── .env                        ✅ Environment config  
├── package.json                ✅ Root workspace
├── pnpm-workspace.yaml         ✅ Workspace config
└── README.md                   ✅ Documentation
```

### **❌ KHÔNG cần gửi (sẽ tạo lại):**
```
❌ node_modules/               # Quá lớn, sẽ install lại
❌ packages/*/node_modules/    # Dependencies  
❌ packages/*/dist/            # Build output
❌ pnpm-lock.yaml             # Sẽ tạo lại
❌ .git/ (tùy chọn)           # Git history
```

---

## 🚀 **HƯỚNG DẪN CHO BẫN:**

### **1. Prerequisites (Cài trước):**
```bash
# Node.js 18+
https://nodejs.org/

# pnpm package manager
npm install -g pnpm

# MySQL (hoặc XAMPP)  
https://dev.mysql.com/downloads/mysql/
```

### **2. Setup Steps:**
```bash
# Bước 1: Giải nén project
cd smart-school-bus

# Bước 2: Install dependencies (có thể mất 2-3 phút)
pnpm install

# Bước 3: Build shared types
pnpm build:shared

# Bước 4: Import database
mysql -u root -p < database/smart_school_bus.sql

# Bước 5: Config .env (sửa DB password)
DB_HOST=localhost
DB_USER=root  
DB_PASSWORD=your_mysql_password
DB_NAME=smart_school_bus

# Bước 6: Start system
pnpm dev:full
```

### **3. Kiểm tra hoạt động:**
- Frontend: http://localhost:5173 ✅
- Backend: http://localhost:5000/api ✅
- Dashboard hoạt động ✅
- API trả về data ✅

---

## 📤 **CÁCH GỬI HIỆU QUẢ:**

### **Option 1: GitHub (Khuyên dùng)**
```bash
# Tạo private repository
git add .
git commit -m "Smart School Bus monorepo"
git push origin main

# Invite collaborator
Settings → Collaborators → Add people
```

### **Option 2: ZIP File**  
```bash
# Tạo ZIP loại trừ file không cần
# Size: ~50MB thay vì ~500MB
```

### **Option 3: Cloud Storage**
- Google Drive / OneDrive
- Upload folder (bỏ node_modules)

---

## 🆘 **TROUBLESHOOTING COMMON ISSUES:**

### **Error: Port 5173 in use**
```bash
npx kill-port 5173 5000
```

### **Error: Database connection**  
```bash
# Kiểm tra MySQL running
mysql -u root -p
# Kiểm tra database tồn tại  
SHOW DATABASES;
```

### **Error: pnpm not found**
```bash
npm install -g pnpm
```

### **Error: Dependencies issue**
```bash
# Clean reinstall
rm -rf node_modules packages/*/node_modules  
pnpm install
```

---

## 📞 **SUPPORT:**

Nếu bạn gặp vấn đề:
1. ✅ Kiểm tra Prerequisites đã cài đủ
2. ✅ Database import thành công  
3. ✅ .env config đúng
4. ✅ Port 5173, 5000 không bị chiếm

**Ready to collaborate! 🚀**