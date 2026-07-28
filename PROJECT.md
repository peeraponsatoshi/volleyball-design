# Volleyball Design

เว็บแต่งกราฟิกคอนเทนต์ข่าววอลเลย์บอล (ผลแข่ง / โปรแกรม / roster / โพสต์ Facebook)  
ฐาน: **yft-design** (Vue 3 + Fabric.js) · MIT

## รันบนเครื่อง

```bash
# หรือดับเบิลคลิก run.bat
pnpm install
pnpm dev
```

เปิด `http://localhost:5174`

## สิ่งที่พร้อมใช้แล้ว

- ภาษาไทยเป็นค่าเริ่มต้น (สลับ EN/中文 ได้)
- ฟอนต์ไทย (Sarabun, Prompt, Kanit, Noto Sans Thai ฯลฯ ผ่าน Google Fonts)
- ขนาดโซเชียล: FB โพสต์ / ปก / แนวนอน / Story / IG / YouTube
- เทมเพลตวอลเลย์ 6 แบบ ในแท็บ **เทมเพลต**
- ไลบรารีตัวอย่างทีม/นักกีฬา: `public/assets/volleyball/`
- Export PNG / SVG / PDF / JSON
- Deploy ฟรี: ดู [DEPLOY.md](./DEPLOY.md)

## วิธีทำคอนเทนต์เร็ว

1. เปิดแท็บ **เทมเพลต** ทางซ้าย  
2. เลือก เช่น **ผลแข่ง** หรือ **โปรแกรมแข่ง**  
3. ดับเบิลคลิกข้อความ → แก้ชื่อทีม / สกอร์  
4. แผงขวา → เลือกขนาด FB ถ้าต้องการ  
5. กด **ดาวน์โหลด** → ส่งออก PNG  

## ขึ้นออนไลน์ฟรี

1. Push ไป GitHub  
2. Import ที่ [vercel.com](https://vercel.com)  
3. Build `pnpm build` · Output `dist`  

## โครงสร้างสำคัญ

| path | หน้าที่ |
|------|---------|
| `src/mocks/volleyballTemplates.ts` | เทมเพลตคอนเทนต์ |
| `src/configs/background.ts` | ขนาดแคนวาส / preset |
| `src/configs/fonts.ts` | ฟอนต์ไทย |
| `public/assets/volleyball/` | โลโก้ / roster data |
| `src/plugins/i18n/lang/th.ts` | คำแปลไทย |

## License

Upstream MIT · dromara/yft-design
