# 🚌 Smart School Bus Tracking System

**Modern web application** để quản lý và theo dõi hệ thống xe buýt trường học với GPS real-time, quản lý học sinh, tài xế, lịch trình và thông báo tự động.

[![Version](https://img.shields.io/badge/version-2.0-blue.svg)](https://github.com/hieuthien3103/smart-school-bus-tracking)
[![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-green.svg)](./packages/backend)
[![Frontend](https://img.shields.io/badge/frontend-React%2019-61dafb.svg)](./packages/frontend)
[![Database](https://img.shields.io/badge/database-MySQL%208.0-orange.svg)](./database)

---

## 🎯 Tính năng chính

### 👨‍💼 Admin Dashboard
- ✅ Quản lý học sinh, tài xế, xe buýt
- ✅ Tạo và quản lý lịch trình
- ✅ Quản lý tuyến đường và điểm dừng
- ✅ Báo cáo và analytics
- ✅ Theo dõi real-time tất cả xe buýt

### 👨‍👩‍👧 Parent Dashboard  
- 🔔 Nhận thông báo khi xe sắp đến (trong 1km)
- 📍 Theo dõi vị trí xe buýt real-time
- 👦 Xem thông tin con em
- 📊 Lịch sử chuyến đi
- ✅ Xác nhận đón/trả học sinh

### 🚗 Driver Dashboard
- 🗺️ GPS navigation theo tuyến đường
- 📋 Danh sách học sinh cần đón/trả
- ✅ Check-in/check-out học sinh
- 🔔 Nhận thông báo và nhiệm vụ
- 📊 Lịch làm việc của tài xế

---

## 🏗️ Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Socket.IO Client** - Real-time updates

### Backend
- **Node.js** + **Express**
- **MySQL 8.0** - Database
- **Express Validator** - Input validation
- **Socket.IO** - Real-time communication
- **JWT** - Authentication (coming soon)

### DevOps
- **pnpm** - Package manager (workspaces)
- **Git** - Version control
- **Docker** - Containerization (optional)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- pnpm 8+
- MySQL 8.0+

### Installation

```bash
# 1. Clone repository
git clone https://github.com/hieuthien3103/smart-school-bus-tracking.git
cd smart-school-bus-tracking

# 2. Install dependencies
pnpm install

# 3. Setup database
mysql -u root -p < database/smart_school_bus_schema.sql

# 4. Configure environment
cd packages/backend
cp .env.example .env
# Edit .env with your database credentials

# 5. Start all services
cd ../..
pnpm dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

---

## 📚 Documentation

### Essential Guides
- **[INDEX.md](./INDEX.md)** - 📚 Documentation navigation hub
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - 🚀 Complete setup guide
- **[BACKEND_MIGRATION_SUMMARY.md](./BACKEND_MIGRATION_SUMMARY.md)** - 🔄 Backend v2.0 changes
- **[FRONTEND_UPDATE_GUIDE.md](./FRONTEND_UPDATE_GUIDE.md)** - 📝 Frontend update guide

### API Documentation
- **[Backend API Reference](./packages/backend/README.md)** - Complete API docs
- **[Database Schema](./database/smart_school_bus_schema.sql)** - Full schema

### For Developers
- **Frontend:** React components in `packages/frontend/src/components/`
- **Backend:** RESTful API in `packages/backend/src/`
- **Database:** MySQL schema in `database/`

---

## 🗂️ Project Structure

```
smart-school-bus/
├── packages/
│   ├── frontend/          # React TypeScript app
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── services/     # API services
│   │   │   ├── contexts/     # React contexts
│   │   │   └── types/        # TypeScript types
│   │   └── README.md
│   │
│   ├── backend/           # Node.js Express API
│   │   ├── src/
│   │   │   ├── models/       # Database models
│   │   │   ├── controllers/  # Business logic
│   │   │   ├── routes/       # API routes
│   │   │   ├── validators/   # Input validation
│   │   │   └── middleware/   # Express middleware
│   │   ├── server.js
│   │   └── README.md
│   │
│   └── shared/            # Shared TypeScript types
│
├── database/
│   └── smart_school_bus_schema.sql
│
├── docs/                  # Documentation
├── INDEX.md              # Doc navigation
└── README.md             # This file
```

---

## 🎨 Screenshots

### Admin Dashboard
![Admin Dashboard](./docs/screenshots/admin-dashboard.png)

### Parent Tracking
![Parent Dashboard](./docs/screenshots/parent-tracking.png)

### Driver Navigation
![Driver App](./docs/screenshots/driver-navigation.png)

---

## 🔄 Recent Updates (v2.0)

### ✅ Backend Complete Rewrite
- Clean MVC architecture
- 100% database schema compliance
- Auto-increment IDs (no manual input)
- Express-validator for all endpoints
- Comprehensive error handling
- RESTful API standards

### 📝 Frontend Updates Needed
- Form fields to match new API
- See [FRONTEND_UPDATE_GUIDE.md](./FRONTEND_UPDATE_GUIDE.md)

### 📊 Database
- Optimized schema with proper relationships
- Foreign key constraints
- Indexes for performance
- ENUM types for status fields

---

## 🛣️ Roadmap

### Phase 1 - Core Features ✅
- [x] Admin dashboard
- [x] Student management
- [x] Driver management  
- [x] Bus management
- [x] Schedule management
- [x] Backend API v2.0

### Phase 2 - Real-time & Integration ⏳
- [ ] Update frontend forms
- [ ] Socket.IO real-time tracking
- [ ] GPS integration
- [ ] Notification system
- [ ] Mobile responsive UI

### Phase 3 - Advanced Features 🔮
- [ ] JWT authentication
- [ ] Role-based access control
- [ ] Parent mobile app
- [ ] Driver mobile app
- [ ] Report generation
- [ ] Analytics dashboard

### Phase 4 - Production 🚀
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Docker deployment
- [ ] CI/CD pipeline
- [ ] Monitoring & logging

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Developer:** [@hieuthien3103](https://github.com/hieuthien3103)
- **Project:** Smart School Bus Tracking System
- **Version:** 2.0
- **Last Updated:** October 14, 2025

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/hieuthien3103/smart-school-bus-tracking/issues)
- **Documentation:** [INDEX.md](./INDEX.md)
- **Email:** [Your email here]

---

**Made with ❤️ for safe student transportation**
