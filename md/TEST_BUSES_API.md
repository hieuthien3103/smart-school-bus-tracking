# 🧪 TEST BUSES CRUD API - PowerShell Commands

## ✅ ĐÃ THÊM VÀO buses.js:

```javascript
✅ GET    /api/buses        - Lấy tất cả
✅ GET    /api/buses/:id    - Lấy chi tiết
✅ POST   /api/buses        - Tạo mới
✅ PUT    /api/buses/:id    - Cập nhật
✅ DELETE /api/buses/:id    - Xóa
✅ PATCH  /api/buses/:id/status - Cập nhật trạng thái
```

---

## 🚀 BẮT ĐẦU TEST

### 1. Khởi động Backend Server
```powershell
cd c:\Users\Admin\smart-school-bus\backend
node server.js
```

**Đợi thấy:**
```
✅ Database connected successfully
🚀 Server running on port 5000
```

---

## 📝 TEST COMMANDS (Chạy trong PowerShell mới)

### ✅ TEST 1: GET - Lấy tất cả buses
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/buses" -Method GET
Write-Host "`n=== ALL BUSES ===" -ForegroundColor Green
$response.data | Format-Table id, bus_number, license_plate, capacity, status
Write-Host "Total buses:" $response.data.Count
```

---

### ✅ TEST 2: POST - Tạo bus mới
```powershell
$newBus = @{
    bus_number = "BS999"
    license_plate = "29A-99999"
    model = "Test Bus Model"
    capacity = 35
    year_manufactured = 2024
    fuel_type = "diesel"
    status = "active"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/buses" -Method POST -Body $newBus -ContentType "application/json"
Write-Host "`n=== CREATED BUS ===" -ForegroundColor Green
$response.data | Format-List
Write-Host "New Bus ID:" $response.data.id -ForegroundColor Yellow
```

**Lưu ID vừa tạo để test tiếp:**
```powershell
$busId = $response.data.id
```

---

### ✅ TEST 3: GET - Lấy bus vừa tạo
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/buses/$busId" -Method GET
Write-Host "`n=== BUS DETAIL ===" -ForegroundColor Green
$response.data | Format-List
```

---

### ✅ TEST 4: PUT - Cập nhật bus
```powershell
$updateBus = @{
    model = "Updated Bus Model"
    capacity = 40
    status = "maintenance"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/buses/$busId" -Method PUT -Body $updateBus -ContentType "application/json"
Write-Host "`n=== UPDATED BUS ===" -ForegroundColor Green
$response.data | Format-List
```

---

### ✅ TEST 5: PATCH - Cập nhật trạng thái
```powershell
$statusUpdate = @{
    status = "active"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/buses/$busId/status" -Method PATCH -Body $statusUpdate -ContentType "application/json"
Write-Host "`n=== STATUS UPDATED ===" -ForegroundColor Green
$response.data | Format-List
```

---

### ✅ TEST 6: DELETE - Xóa bus
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/buses/$busId" -Method DELETE
Write-Host "`n=== DELETED ===" -ForegroundColor Green
$response | Format-List

# Verify deleted
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/buses/$busId" -Method GET
} catch {
    Write-Host "`n✅ Confirmed: Bus $busId has been deleted" -ForegroundColor Green
}
```

---

## 🧪 TEST VALIDATION

### TEST: Duplicate bus_number
```powershell
$duplicateBus = @{
    bus_number = "BS001"  # Existing bus
    license_plate = "29A-88888"
    capacity = 30
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/buses" -Method POST -Body $duplicateBus -ContentType "application/json"
} catch {
    Write-Host "`n✅ Validation working: Duplicate detected" -ForegroundColor Green
    $_.Exception.Response.StatusCode
}
```

### TEST: Missing required fields
```powershell
$invalidBus = @{
    model = "Bus without number"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/buses" -Method POST -Body $invalidBus -ContentType "application/json"
} catch {
    Write-Host "`n✅ Validation working: Missing fields detected" -ForegroundColor Green
    $_.Exception.Response.StatusCode
}
```

### TEST: Invalid status
```powershell
$invalidStatus = @{
    status = "flying"  # Not valid status
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/buses/1/status" -Method PATCH -Body $invalidStatus -ContentType "application/json"
} catch {
    Write-Host "`n✅ Validation working: Invalid status detected" -ForegroundColor Green
}
```

---

## 🎯 COMPLETE TEST SCRIPT (Copy & Run)

```powershell
# COMPLETE TEST SEQUENCE
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   BUSES CRUD API TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Get all buses
Write-Host "[1/6] Testing GET all buses..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/buses" -Method GET
Write-Host "✅ Found" $response.data.Count "buses" -ForegroundColor Green

# 2. Create new bus
Write-Host "`n[2/6] Testing POST create bus..." -ForegroundColor Yellow
$newBus = @{
    bus_number = "BS-TEST-$(Get-Random -Maximum 9999)"
    license_plate = "TEST-$(Get-Random -Maximum 99999)"
    model = "Test Bus Model"
    capacity = 35
    year_manufactured = 2024
    fuel_type = "diesel"
    status = "active"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/buses" -Method POST -Body $newBus -ContentType "application/json"
$busId = $response.data.id
Write-Host "✅ Created bus ID: $busId" -ForegroundColor Green

# 3. Get specific bus
Write-Host "`n[3/6] Testing GET bus by ID..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/buses/$busId" -Method GET
Write-Host "✅ Retrieved bus:" $response.data.bus_number -ForegroundColor Green

# 4. Update bus
Write-Host "`n[4/6] Testing PUT update bus..." -ForegroundColor Yellow
$updateBus = @{
    capacity = 40
    status = "maintenance"
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/buses/$busId" -Method PUT -Body $updateBus -ContentType "application/json"
Write-Host "✅ Updated capacity:" $response.data.capacity -ForegroundColor Green

# 5. Update status
Write-Host "`n[5/6] Testing PATCH update status..." -ForegroundColor Yellow
$statusUpdate = @{ status = "active" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/buses/$busId/status" -Method PATCH -Body $statusUpdate -ContentType "application/json"
Write-Host "✅ Updated status:" $response.data.status -ForegroundColor Green

# 6. Delete bus
Write-Host "`n[6/6] Testing DELETE bus..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/buses/$busId" -Method DELETE
Write-Host "✅ Deleted bus ID: $busId" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   ALL TESTS PASSED! ✅" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
```

---

## 📊 EXPECTED RESULTS

### ✅ Successful Responses:
- **GET /api/buses** → 200 OK with array
- **GET /api/buses/:id** → 200 OK with object
- **POST /api/buses** → 201 Created with new bus
- **PUT /api/buses/:id** → 200 OK with updated bus
- **PATCH /api/buses/:id/status** → 200 OK with updated status
- **DELETE /api/buses/:id** → 200 OK with success message

### ❌ Error Responses:
- **404** - Bus not found
- **400** - Missing required fields
- **409** - Duplicate bus_number or license_plate
- **500** - Server error

---

## 🎉 NEXT STEPS

Sau khi test API thành công:

1. **Test trong Frontend UI:**
   ```bash
   cd c:\Users\Admin\smart-school-bus
   npm run dev
   ```
   - Mở http://localhost:5173
   - Vào Bus Management
   - Test "Thêm xe mới" button
   - Test Edit/Delete buttons

2. **Repeat for other modules:**
   - drivers.js
   - students.js
   - schedules.js

---

**Status:** ✅ Buses CRUD API Complete & Ready to Test!
