# BMS - Frontend (Banking Management System)

สำหรับระบบบริหารจัดการบัญชีธนาคาร พัฒนาด้วย React และ Vite เชื่อมต่อกับ Backend API ผ่าน RESTful endpoints

---

## ฟีเจอร์หลัก (Features)

- **จัดการบัญชี (Account Management):** ค้นหาบัญชีด้วย Account ID, เปิดบัญชีใหม่ และแก้ไขข้อมูลส่วนตัว
- **ทำธุรกรรมการเงิน (Transactions):** ทำรายการฝากเงิน (Deposit) และถอนเงิน (Withdraw) พร้อมระบบตรวจสอบยอดคงเหลือ
- **ประวัติการทำธุรกรรม (Transaction History):** แสดงรายการธุรกรรมย้อนหลังและยอดคงเหลือหลังทำรายการ
- **การแจ้งเตือน (Toast Notification):** แสดงสถานะการทำรายการและข้อความแจ้งเตือนจากระบบ

---

## เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework:** React 18
- **Build Tool:** Vite
- **HTTP Client:** Axios
- **Styling:** CSS3 (Vanilla CSS with Custom Design Tokens)

---

## การติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันโปรเจกต์ในโหมด Development
```bash
npm run dev
```
แอปพลิเคชันจะรันที่ `http://localhost:5173` โดยเริ่มต้น

### 3. สร้าง Production Build
```bash
npm run build
```
