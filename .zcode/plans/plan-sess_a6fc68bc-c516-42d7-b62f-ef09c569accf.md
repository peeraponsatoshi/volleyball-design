## แผนการพัฒนาระบบเชื่อมต่อ Google Drive (ซิงก์งานข้ามคอมและมือถือ)

### 🎯 เป้าหมาย
ให้ผู้ใช้งานสามารถ **"บันทึกงานลง Google Drive"** และ **"เปิดแก้งานจาก Google Drive"** ได้โดยตรงผ่านหน้าเว็บทั้งบนคอมพิวเตอร์และโทรศัพท์มือถือ โดยไม่ต้องดาวน์โหลดไฟล์มาถือเอง ข้อมูลเก็บอยู่ใน Google Drive ส่วนตัวของผู้ใช้ ปลอดภัย ความจุ 15 GB ฟรี ไม่โดนตัดลบ

---

### 🏗️ โครงสร้างการทำงาน (Architecture)

1. **ใช้ Google Identity Services (GIS) & Drive API (Client-side 100%)**:
   - ใช้ OAuth 2.0 สิทธิ์แบบ `https://www.googleapis.com/auth/drive.file` (เข้าถึงเฉพาะไฟล์/โฟลเดอร์ที่แอปเป็นคนสร้างขึ้นเท่านั้น ปลอดภัยสูงสุด)
   - ไม่ต้องมี backend ประมวลผลบน Vercel static ได้ทันที 100%

2. **สร้างโฟลเดอร์อัตโนมัติ `Volleyball Design` ใน Google Drive**:
   - เมื่อกดบันทึกครั้งแรก ระบบจะสร้างโฟลเดอร์ `Volleyball Design` ใน Google Drive ให้อัตโนมัติ
   - เซฟไฟล์งานในรูปแบบ `.json` (โครงสร้างเลเยอร์เต็ม) พร้อมเซฟรูปพรีวิว (Thumbnail) เพื่อแสดงหน้าปกตอนเลือกเปิดงาน

3. **ระบบจัดการสิทธิ์และจำไฟล์เดิม (Quick Save)**:
   - บันทึก `driveFileId` ของงานปัจจุบันไว้ ทำให้พอกดบันทึกครั้งถัดไป จะเป็นการเขียนทับไฟล์เดิม ไม่เกิดไฟล์ซ้ำซ้อน

---

### 📝 ขั้นตอนการพัฒนา

1. **สร้าง Helper `src/utils/googleDrive.ts`**:
   - `initGoogleDriveScript()`: โหลดสคริปต์ Google GIS (`https://accounts.google.com/gsi/client`) อัตโนมัติ
   - `requestGoogleToken()`: เปิดป๊อปอัปให้ผู้ใช้ล็อกอินบัญชี Google และขออนุญาตสิทธิ์ Drive
   - `saveProjectToDrive(template, thumbnailDataUrl, existingFileId?)`: สร้าง/อัปเดตไฟล์งาน `.json` ในโฟลเดอร์ `Volleyball Design`
   - `listDriveProjects()`: ดึงรายการงานออกแบบที่เซฟไว้ใน Google Drive พร้อมชื่อ วันที่แก้ไขล่าสุด และรูปพรีวิว
   - `loadDriveProject(fileId)`: ดาวน์โหลดไฟล์งาน `.json` จาก Drive และส่งให้ตัวแก้ไขเปิดขึ้นมาทำงานทันที
   - `deleteDriveProject(fileId)`: ลบงานที่ไม่ต้องการออกจาก Drive

2. **สร้าง UI Component `src/components/GoogleDriveModal/index.vue`**:
   - หน้าต่างแสดงรายการงานที่อยู่ใน Google Drive (การ์ดงานพร้อมรูปตัวอย่าง วันที่ ปุ่มเปิดแก้ และปุ่มลบ)
   - สถานะการเชื่อมต่อ (แสดงชื่อผู้ใช้ Google / ปุ่มสลับบัญชี)

3. **เพิ่มปุ่มควบคุมในหน้า Editor (`src/views/Editor/CanvasRight/index.vue`)**:
   - เพิ่มปุ่ม ☁️ **"Google Drive"** ข้าง ๆ ปุ่มดาวน์โหลด/แชร์
   - มีเมนูดร็อปดาวน์:
     - 💾 **บันทึกไปที่ Google Drive**
     - 📂 **เปิดงานจาก Google Drive**

4. **การตั้งค่า Google OAuth Client ID**:
   - รองรับการใส่ `VITE_GOOGLE_CLIENT_ID` ในไฟล์ `.env.local` หรือ Vercel Environment Variables
   - เพิ่มคำแนะนำสั้น ๆ สำหรับวิธีรับ Client ID ฟรีจาก Google Cloud Console (ถ้าผู้ใช้อยากใช้ Client ID ตัวเอง)

---

### 🧪 การทดสอบ & ยืนยัน
- ทดสอบสร้างโปรเจกต์ → บันทึกลง Google Drive
- ทดสอบเปิดรายการงานใน Google Drive → ดึงไฟล์กลับมาแก้ไขในแคนวาส
- ทดสอบ `pnpm build` ผ่านเรียบร้อย และ Push ขึ้น Vercel deployment