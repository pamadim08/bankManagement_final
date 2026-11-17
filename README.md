# BMS - Banking Management System (ระบบจัดการบัญชีธนาคาร)

ระบบจัดการบัญชีธนาคารแบบ Full-Stack เชื่อมต่อข้อมูลจริงระหว่าง Frontend (React + Vite) และ Backend (Spring Boot + PostgreSQL) รองรับการเปิดบัญชี จัดการข้อมูล ทำธุรกรรมฝาก-ถอน และแสดงประวัติธุรกรรมแบบเรียลไทม์

---

## เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:** React, Vite, Axios, Vanilla CSS
- **Backend:** Java 17/21, Spring Boot, Spring Data JPA, Maven
- **Database:** MySQL (ค่าเริ่มต้น `localhost:3307`, ฐานข้อมูล `bank`)

---

## สิ่งที่ต้องติดตั้งก่อนเริ่ม (Prerequisites)

1. **Node.js** (เวอร์ชัน 18 ขึ้นไป)
2. **Java JDK** (เวอร์ชัน 17 หรือ 21)
3. **Git** (สำหรับดึงโค้ดโปรเจกต์)

---

## วิธีติดตั้งและเริ่มรันระบบ (Getting Started)

เปิด Terminal หรือ Command Prompt **2 หน้าต่าง** เพื่อรัน Backend และ Frontend พร้อมกัน

### 1. รัน Backend (Spring Boot - Port 8080)

เปิด Terminal หน้าต่างที่ 1:

```bash
# 1. เข้าสู่โฟลเดอร์ Backend
cd backend/backend

# 2. เริ่มต้นรันเซิร์ฟเวอร์ Spring Boot
# สำหรับ Windows (Command Prompt / PowerShell):
./mvnw.cmd spring-boot:run

# สำหรับ macOS / Linux:
./mvnw spring-boot:run
```

**ตั้งค่าฐานข้อมูล (ก่อนรันครั้งแรก):**
- สร้างฐานข้อมูล MySQL ชื่อ `bank` (ตารางจะถูกสร้างและอัปเดตอัตโนมัติเมื่อเริ่มต้นระบบ)
- คัดลอก `backend/backend/application-local.properties.example` เป็น `backend/backend/application-local.properties` แล้วใส่ username/password ของคุณ (ไฟล์นี้ถูก git ignore ไม่ถูกอัปโหลด)
- หรือกำหนด environment variable `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` แทน
- ถ้าไม่ตั้ง `DB_PASSWORD` ระบบจะไม่ยอมเริ่มทำงาน (ตั้งใจให้เป็นแบบนี้ เพื่อไม่ให้รหัสผ่านอยู่ในซอร์สโค้ด)

**หมายเหตุ:**
- เมื่อระบบรันเสร็จสมบูรณ์ จะแสดงข้อความ `Started BackendApplication` ที่พอร์ต `http://localhost:8080`

---

### 2. รัน Frontend (React + Vite - Port 5173)

เปิด Terminal หน้าต่างที่ 2:

```bash
# 1. เข้าสู่โฟลเดอร์ Frontend
cd frontend

# 2. ติดตั้ง Dependencies (ทำเฉพาะครั้งแรก)
npm install

# 3. เริ่มรันเว็บเซิร์ฟเวอร์สำหรับ Development
npm run dev
```

- เมื่อรันสำเร็จ ให้เข้าใช้งานผ่านเว็บเบราว์เซอร์ที่: **http://localhost:5173**

---

## ข้อมูลการเชื่อมต่อและพอร์ต (URLs & Ports)

| บริการ | URL | รายละเอียด |
| :--- | :--- | :--- |
| **Frontend UI** | `http://localhost:5173` | หน้า Dashboard ใช้งานระบบ |
| **Backend API** | `http://localhost:8080` | เซิร์ฟเวอร์ REST API |
| **Base API Endpoint** | `http://localhost:8080/api/accounts` | Endpoint หลักสำหรับบัญชีและธุรกรรม |

---

## ฟังก์ชันการทำงานหลัก (Features)

1. **เปิดบัญชีใหม่ (Create Account):**
   - กรอกชื่อ, อีเมล, เบอร์โทรศัพท์ และยืนยันเพื่อสร้างบัญชี ระบบจะออก Account ID ให้ทันที
2. **ค้นหาและจัดการข้อมูลบัญชี (Search & Update Account):**
   - ค้นหาบัญชีด้วย Account ID แสดงข้อมูลเจ้าของบัญชี และสามารถแก้ไขข้อมูลหรือลบบัญชีได้
3. **ดูยอดเงินคงเหลือ (Live Balance Display):**
   - แสดงยอดเงินคงเหลือปัจจุบันแบบเรียลไทม์
4. **ทำธุรกรรมฝาก - ถอนเงิน (Deposit & Withdraw):**
   - เลือกทำรายการฝากหรือถอนเงิน พร้อมปุ่มลัดระบุจำนวนเงิน (+100, +500, +1,000, +5,000 บาท)
   - อัปเดตยอดคงเหลือทันทีหลังทำรายการสำเร็จ พร้อมระบบแจ้งเตือน (Toast Notification)
5. **ประวัติธุรกรรม (Transaction History):**
   - แสดงประวัติรายการฝาก-ถอน ยอดเงินคงเหลือหลังทำรายการ และวันเวลาที่ทำรายการอย่างละเอียด

---

## สรุป REST API Endpoints

### 1. ระบบจัดการบัญชี (Account Endpoints)

| Method | Endpoint | คำอธิบาย | ตัวอย่าง Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/accounts` | เปิดบัญชีใหม่ | `{"name": "...", "email": "...", "phone": "..."}` |
| `GET` | `/api/accounts` | ดึงรายชื่อบัญชีทั้งหมด | - |
| `GET` | `/api/accounts/{id}` | ค้นหาข้อมูลบัญชีตาม ID | - |
| `PUT` | `/api/accounts/{id}` | แก้ไขข้อมูลบัญชี | `{"name": "...", "email": "...", "phone": "..."}` |
| `DELETE` | `/api/accounts/{id}` | ลบบัญชี | - |

### 2. ระบบธุรกรรม (Transaction Endpoints)

| Method | Endpoint | คำอธิบาย | ตัวอย่าง Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/accounts/{id}/deposit` | ฝากเงินเข้าบัญชี | `{"amount": 1000.00}` |
| `POST` | `/api/accounts/{id}/withdraw` | ถอนเงินออกจากบัญชี | `{"amount": 500.00}` |
| `GET` | `/api/accounts/{id}/balance` | ดึงยอดเงินคงเหลือ | - |
| `GET` | `/api/accounts/{id}/history` | ดึงประวัติธุรกรรมทั้งหมดของบัญชี | - |

---


## การแก้ไขปัญหาเบื้องต้น (Troubleshooting)

- **พอร์ต 8080 หรือ 5173 ถูกใช้งานอยู่:**
  - ตรวจสอบและปิดโปรแกรมที่ใช้งานพอร์ตดังกล่าว หรือเปลี่ยนพอร์ตในไฟล์ `application.properties` (Backend) หรือ `vite.config.js` (Frontend)
- **PowerShell แจ้งเตือนข้อผิดพลาดเรื่อง Script Execution ตอนรัน npm (Windows):**
  - ให้รันผ่าน Command Prompt (CMD) หรือตั้งค่านโยบายใน PowerShell ด้วยคำสั่ง `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
- **Backend ไม่สามารถรันได้เนื่องจากเวอร์ชัน Java:**
  - ตรวจสอบเวอร์ชัน Java บนเครื่องด้วยคำสั่ง `java -version` โดยระบบต้องการ Java 17 ขึ้นไป
