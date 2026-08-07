## เป้าหมาย
ทำให้เว็บรองรับ "นำเข้าไฟล์ PSD จริง ๆ" แบบประมวลผลในตัว (client-side) — ไม่ต้องพึ่ง backend ที่ไม่มีบน Vercel static อีกต่อไป

## เหตุผล / สถานะปัจจุบัน
- ตอนนี้ UI รับ `.psd` แต่โค้ดส่งไฟล์ไปให้ backend `/api/design/parse/file`; บนเว็บ static ที่ deploy แล้วไม่มี backend → โยน PSD ไม่ได้
- เราจะใช้ไลบรารี **ag-psd** (pure JS/TS, รันในเบราว์เซอร์ได้, ผ่าน Context7 ยืนยัน API แล้ว: `readPsd(ArrayBuffer)` → `psd.width/height/children`, `layer.canvas` (HTMLCanvasElement), `layer.left/top/width/height`, `layer.opacity`, `layer.blendMode`, `layer.hidden`)
- เลเยอร์ใน PSD ตำแหน่งเป็นพิกเซลของเอกสาร และ Template ที่ตัวแก้ไขใช้มี width/height = พิกเซล + `zoom:1` → ตำแหน่งจับคู่ 1:1 พอดี

## รูปแบบที่เลือก
**แยกเลเยอร์เป็นรูปภาพ** — แต่ละเลเยอร์ (รวมตัวหนังสือ) นำเข้าเป็น object รูปภาพแยกชิ้น: ขยับ/ย่อ/ลบ/เรียง ลำดับได้ทีละเลเยอร์ (ตัวหนังสือยังเป็นภาพ v1)

## วิธีทำ
1. **ติดตั้ง**: `pnpm add ag-psd`
2. **สร้าง `src/utils/psd.ts`** — ฟังก์ชัน `psdToTemplate(file: File): Promise<Template>`:
   - `const buffer = await file.arrayBuffer()` → `readPsd(buffer)`
   - สร้าง Template ตาม pattern `generateSVGTemplate` (ใน `src/components/FileUpload/index.vue`): `WorkSpaceDrawData.width/height = psd.width/height`, `objects[0] = WorkSpaceDrawData`, `width/height = psd.width/height`, `zoom:1`, `clip:2`, `version:'6.12'`
   - flatten เลเยอร์แบบ recursive (รองรับกลุ่ม/โฟลเดอร์):
     - ล้าง `hidden` ทิ้ง
     - ถ้ามี `children` → ทำ recursive ตามลำดับ (โฟลเดอร์)
     - ถ้ามี `canvas` ข้อมูล → `cv.toDataURL('image/png')` แล้วสร้าง object fabric `Image` (literal serialized): `type:'Image'`, `src:dataURL`, `crossOrigin:'anonymous'`, `left/top/width/height` จาก layer, `opacity: layer.opacity`, `globalCompositeOperation` map จาก `layer.blendMode` (fabric รองรับชื่อโหมดเดียวกับ Photoshop — `propertiesToInclude` มี field นี้อยู่แล้ว), `id:nanoid(10)`, `name: layer.name`, `visible:true`
     - เรียง `objects` ตามลำดับ bottom→top (ตรง z-order)
   - โหมด blend/mask ขั้นซับซ้อนของ group ได้ผลลัพธ์โดยประมาณ (บันทึกข้อจำกัด)
3. **Wire เข้า `src/components/FileUpload/index.vue`** ใน `uploadHandle`: เพิ่ม branch `if (fileSuffix === 'psd')` → `templatesStore.addTemplate(await psdToTemplate(file))` → `setCanvasTransform()` → `emit('close')` ก่อนถึง backend (pdf/ai/cdr ตามเดิม)
4. **Wire เข้า `src/plugins/directive/dropImage.ts`** (`defaultUpload`): เพิ่ม branch `psd` คล้ายกัน (แล้ว `return` เพื่อไม่ดเลยไป `uploadFile`)
5. **Build config**: ใส่ `'ag-psd'` ใน `optimizeDeps.include` (`build/optimize.ts`) และ `manualChunks` (ตัวเลือก, กัน bundle โต)
6. **Feedback**: ใช้ `uploading` + `v-loading` (มีอยู่แล้ว) ครอบการทำงาน, ปรับ tip เป็น "รองรับ PSD / PDF / SVG / รูปภาพ„
7. **ยืนยัน**: `pnpm build` ไม่ error + ทดสอบด้วยไฟล์ PSD ตัวอย่าง (device)

## สิ่งที่หาแพระ / ไม่ทำ
- ตัวหนังสือจะนำเข้าเป็นภาพ (ความละเอียดตรงต้นฉบับ) — แปลงเป็นกล่องข้อความแก้ได้เป็น follow-up
- PDF/AI/CDR ยังพึ่ง backend เหมือนเดิม (ส่วนนี้บอกไปว่าใช้ไม่ได้บน Vercel เว้นมี backend)
- หลาย artboard → ยังนำเข้าเป็นเอกสารเดียว (flatten ตามลำดับ)

## ไฟล์ที่จะแก้
- `package.json` (+ deps) / `pnpm-lock.yaml`
- `src/utils/psd.ts` (ใหม่)
- `src/components/FileUpload/index.vue`
- `src/plugins/directive/dropImage.ts`
- (ตัวเลือก) `build/optimize.ts`, `vite.config.mts`, `build/plugins.ts`