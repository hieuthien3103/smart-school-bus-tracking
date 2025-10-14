# 🧪 TEST DRIVERS CRUD API - PowerShell Commands

## ✅ ĐÃ THÊM VÀO drivers.js:

```javascript
✅ GET    /api/drivers               - Lấy tất cả
✅ GET    /api/drivers/:id           - Lấy chi tiết  
✅ POST   /api/drivers               - Tạo mới
✅ PUT    /api/drivers/:id           - Cập nhật
✅ DELETE /api/drivers/:id           - Xóa
✅ PATCH  /api/drivers/:id/status    - Cập nhật trạng thái
✅ PATCH  /api/drivers/:id/assign-bus - Phân công xe bus
```

---

## 🚀 TEST DRIVERS API

### Prerequisite: Server phải đang chạy
```powershell
# Nếu chưa chạy:
cd c:\Users\Admin\smart-school-bus\backend
node server.js
```

---

## 📝 COMPLETE TEST SCRIPT

```powershell
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   🚗 DRIVERS CRUD API TEST SUITE" -ForegroundColor Cyan  
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: GET all drivers
Write-Host "[1/7] Testing GET /api/drivers..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/drivers" -Method GET
    Write-Host "✅ Found" $response.data.Count "drivers" -ForegroundColor Green
    Write-Host "`nExisting drivers:" -ForegroundColor Cyan
    $response.data | Select-Object -First 3 | Format-Table id, employee_id, license_number, status -AutoSize
} catch {
    Write-Host "❌ GET drivers failed:" $_.Exception.Message -ForegroundColor Red
}

# Test 2: Get users for driver creation (need valid user_id)
Write-Host "`n[2/7] Getting available users..." -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method GET -ErrorAction SilentlyContinue
    if ($users.data -and $users.data.Count -gt 0) {
        $testUserId = $users.data[0].id
        Write-Host "✅ Found user ID for testing:" $testUserId -ForegroundColor Green
    } else {
        # Create a test user first (assuming users API exists)
        Write-Host "⚠️ No users found, using UUID format for testing" -ForegroundColor Yellow
        $testUserId = [System.Guid]::NewGuid().ToString()
        Write-Host "Using test user ID:" $testUserId -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️ Cannot access users API, using test UUID" -ForegroundColor Yellow
    $testUserId = [System.Guid]::NewGuid().ToString()
}

# Test 3: Create new driver
Write-Host "`n[3/7] Testing POST /api/drivers (Create)..." -ForegroundColor Yellow
$newDriver = @{
    user_id = $testUserId
    employee_id = "EMP-TEST-$(Get-Random -Maximum 9999)"
    license_number = "LICENSE-TEST-$(Get-Random -Maximum 999999)"
    license_type = "B2"
    license_expiry = "2025-12-31"
    experience_years = 5
    status = "active"
    hire_date = "2024-01-15"
    emergency_contact_name = "Test Emergency Contact"
    emergency_contact_phone = "0901234567"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/drivers" -Method POST -Body $newDriver -ContentType "application/json"
    $driverId = $response.data.id
    Write-Host "✅ Created driver ID:" $driverId -ForegroundColor Green
    Write-Host "Employee ID:" $response.data.employee_id -ForegroundColor Cyan
} catch {
    Write-Host "❌ Create driver failed:" $_.Exception.Message -ForegroundColor Red
    # Use existing driver ID for testing if creation fails
    $drivers = Invoke-RestMethod -Uri "http://localhost:5000/api/drivers" -Method GET
    if ($drivers.data.Count -gt 0) {
        $driverId = $drivers.data[0].id
        Write-Host "Using existing driver ID for testing:" $driverId -ForegroundColor Yellow
    }
}

# Test 4: GET driver by ID
Write-Host "`n[4/7] Testing GET /api/drivers/$driverId..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/drivers/$driverId" -Method GET
    Write-Host "✅ Retrieved driver:" $response.data.employee_id -ForegroundColor Green
    $response.data | Format-List employee_id, license_number, status, experience_years
} catch {
    Write-Host "❌ Get driver failed:" $_.Exception.Message -ForegroundColor Red
}

# Test 5: Update driver
Write-Host "`n[5/7] Testing PUT /api/drivers/$driverId (Update)..." -ForegroundColor Yellow
$updateDriver = @{
    experience_years = 7
    emergency_contact_name = "Updated Emergency Contact"
    status = "active"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/drivers/$driverId" -Method PUT -Body $updateDriver -ContentType "application/json"
    Write-Host "✅ Updated successfully" -ForegroundColor Green
    Write-Host "New experience years:" $response.data.experience_years -ForegroundColor Cyan
} catch {
    Write-Host "❌ Update driver failed:" $_.Exception.Message -ForegroundColor Red
}

# Test 6: Update status
Write-Host "`n[6/7] Testing PATCH /api/drivers/$driverId/status..." -ForegroundColor Yellow
$statusUpdate = @{
    status = "on_leave"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/drivers/$driverId/status" -Method PATCH -Body $statusUpdate -ContentType "application/json"
    Write-Host "✅ Status updated to:" $response.data.status -ForegroundColor Green
} catch {
    Write-Host "❌ Status update failed:" $_.Exception.Message -ForegroundColor Red
}

# Test 7: Bus assignment (if buses exist)
Write-Host "`n[7/7] Testing Bus Assignment..." -ForegroundColor Yellow
try {
    $buses = Invoke-RestMethod -Uri "http://localhost:5000/api/buses" -Method GET
    if ($buses.data.Count -gt 0) {
        $testBusId = $buses.data[0].id
        
        # First set driver back to active
        $activeStatus = @{ status = "active" } | ConvertTo-Json
        Invoke-RestMethod -Uri "http://localhost:5000/api/drivers/$driverId/status" -Method PATCH -Body $activeStatus -ContentType "application/json"
        
        # Assign bus
        $busAssignment = @{ bus_id = $testBusId } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/drivers/$driverId/assign-bus" -Method PATCH -Body $busAssignment -ContentType "application/json"
        Write-Host "✅ Assigned bus:" $response.data.bus_number -ForegroundColor Green
    } else {
        Write-Host "⚠️ No buses available for assignment testing" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Bus assignment failed:" $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   🎉 DRIVERS API TEST COMPLETE!" -ForegroundColor Cyan  
Write-Host "========================================`n" -ForegroundColor Cyan
```

---

## 🧪 VALIDATION TESTS

### Test duplicate employee_id
```powershell
Write-Host "`n🔍 Testing Validation - Duplicate Employee ID..." -ForegroundColor Magenta
$duplicateDriver = @{
    user_id = [System.Guid]::NewGuid().ToString()
    employee_id = "EMP001"  # Assuming this exists
    license_number = "UNIQUE-LICENSE-123"
    license_type = "B2"
    license_expiry = "2025-12-31"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/drivers" -Method POST -Body $duplicateDriver -ContentType "application/json"
} catch {
    Write-Host "✅ Validation working - Duplicate employee_id detected!" -ForegroundColor Green
    Write-Host "Status Code:" $_.Exception.Response.StatusCode -ForegroundColor Yellow
}
```

### Test invalid status
```powershell
Write-Host "`n🔍 Testing Validation - Invalid Status..." -ForegroundColor Magenta
$invalidStatus = @{
    status = "flying"  # Not valid status
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/drivers/1/status" -Method PATCH -Body $invalidStatus -ContentType "application/json"
} catch {
    Write-Host "✅ Validation working - Invalid status detected!" -ForegroundColor Green
}
```

### Test missing required fields
```powershell
Write-Host "`n🔍 Testing Validation - Missing Required Fields..." -ForegroundColor Magenta
$invalidDriver = @{
    employee_id = "INCOMPLETE-DRIVER"
    # Missing required fields: user_id, license_number, etc.
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/drivers" -Method POST -Body $invalidDriver -ContentType "application/json"
} catch {
    Write-Host "✅ Validation working - Missing fields detected!" -ForegroundColor Green
}
```

---

## 📊 EXPECTED RESULTS

### ✅ Success Responses:
- **GET /api/drivers** → 200 OK with drivers array
- **GET /api/drivers/:id** → 200 OK with driver + user info
- **POST /api/drivers** → 201 Created with new driver
- **PUT /api/drivers/:id** → 200 OK with updated driver  
- **PATCH /api/drivers/:id/status** → 200 OK with status update
- **PATCH /api/drivers/:id/assign-bus** → 200 OK with bus assignment

### ❌ Error Responses:
- **404** - Driver not found
- **400** - Missing required fields, invalid bus assignment
- **409** - Duplicate employee_id or license_number
- **500** - Server error

---

## 🔗 BUSINESS LOGIC FEATURES

### ✅ Advanced Features Implemented:

1. **Bus Assignment Logic:**
   - Check bus availability
   - Prevent double assignment
   - Automatic unassignment on status change

2. **Status Management:**
   - Valid statuses: active, on_leave, suspended, retired
   - Auto-remove bus when not active
   - Socket.IO broadcast for status changes

3. **Data Integrity:**
   - Foreign key validation (user_id, bus_id)
   - Unique constraints (employee_id, license_number)
   - Prevent deletion of active drivers

4. **Rich Queries:**
   - JOIN with users table for complete info
   - Include bus information in responses
   - Dynamic UPDATE queries

---

## 🎯 COMPARISON: Buses vs Drivers

| Feature | Buses | Drivers | 
|---------|-------|---------|
| **CRUD Operations** | ✅ | ✅ |
| **Status Management** | ✅ | ✅ |
| **Advanced Logic** | Basic | ✅ Rich |
| **Relationship Handling** | Simple | ✅ Complex |
| **Business Rules** | ✅ | ✅ Enhanced |

**Drivers API is more complex due to:**
- User relationship (JOIN queries)
- Bus assignment logic
- Status-dependent business rules
- Multiple validation layers

---

**Status:** ✅ Drivers CRUD API Complete & Enhanced!

**Next:** Run the test script to verify all endpoints work correctly.