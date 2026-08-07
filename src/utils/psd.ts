import { readPsd } from 'ag-psd'
import { nanoid } from 'nanoid'
import { Template } from '@/types/canvas'
import { WorkSpaceDrawData, propertiesToInclude } from '@/configs/canvas'
import { Image as FabricImage } from '@/extension/object/Image'

/**
 * แปลง BlendMode ของ Photoshop เป็น globalCompositeOperation ของ fabric.
 * canvas 2D (GlobalCompositeOperation) และ propertiesToInclude (src/configs/canvas.ts)
 * รองรับชื่อโหมดเหล่านี้อยู่แล้ว ส่วนที่ map ไม่ได้ให้ใช้ 'source-over' (ปกติ)
 */
const BLEND_MODE_MAP: Record<string, string> = {
  normal: 'source-over',
  'pass through': 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  darken: 'darken',
  lighten: 'lighten',
  'color dodge': 'color-dodge',
  'color burn': 'color-burn',
  'soft light': 'soft-light',
  'hard light': 'hard-light',
  difference: 'difference',
  exclusion: 'exclusion',
  hue: 'hue',
  saturation: 'saturation',
  color: 'color',
  luminosity: 'luminosity',
}

const toGlobalCompositeOperation = (blendMode?: string) =>
  BLEND_MODE_MAP[blendMode || 'normal'] || 'source-over'

/**
 * แปลงเลเยอร์หนึ่ง ๆ ให้เป็น object fabric Image ที่ผ่า `canvas.loadFromJSON` ได้
 * โดยใช้คลาส Image ของตัวแก้ไขเอง + `.toObject(propertiesToInclude)` (ช่องเดียวกับตอนเซฟ)
 * - layer ที่ซ่อน: ข้าม
 * - โฟลเดอร์/กลุ่ม: ลงลึกใน children (เรียงตาม z-order เดิม bottom-to-top)
 * - เลเยอร์ที่ไม่มีข้อมูลภาพ (เช่น adjustment layer, empty group): ข้าม
 */
const layerToObject = async (layer: any): Promise<Record<string, any>[]> => {
  if (layer.hidden) return []

  if (layer.children && layer.children.length) {
    const objects: Record<string, any>[] = []
    for (const child of layer.children) {
      objects.push(...(await layerToObject(child)))
    }
    return objects
  }

  const canvas = layer.canvas
  if (!canvas) return []

  const src = canvas.toDataURL('image/png')
  const img = await FabricImage.fromURL(
    src,
    {},
    {
      crossOrigin: 'anonymous',
      originX: 'left',
      originY: 'top',
      left: layer.left || 0,
      top: layer.top || 0,
      angle: 0,
      opacity: 1,
      id: nanoid(10),
      name: layer.name || 'Image',
      layer: layer.name || 'Image',
    },
  )
  img.set({
    opacity: layer.opacity ?? 1,
    globalCompositeOperation: toGlobalCompositeOperation(layer.blendMode),
  })
  return [img.toObject(propertiesToInclude)]
}

/**
 * อ่านไฟล์ PSD ด้วย ag-psd และสร้าง Template ของตัวแก้ไข
 * (โครงสร้างเดียวกับ generateSVGTemplate ใน src/components/FileUpload/index.vue)
 *
 * หมายเหตุ:
 * - แต่ละเลเยอร์ถูกนำเข้าเป็น object รูปภาพ (text layer ก็เป็นภาพ รักษาความละเอียดต้นฉบับ)
 * - ตำแหน่ง Telaxer ใช้พิกเซลของเอกสารโดยตรง (Template width/height = psd.width/height, zoom=1)
 * - blend mode ของ group ขั้นสูง (layer mask ที่ไม่ใช่ flat) ได้ผลลัพธ์โดยประมาณจาก globalCompositeOperation
 */
export const psdToTemplate = async (file: File): Promise<Template> => {
  const buffer = await file.arrayBuffer()
  const psd = readPsd(buffer as ArrayBuffer)

  WorkSpaceDrawData.width = psd.width
  WorkSpaceDrawData.height = psd.height

  const objects: Record<string, any>[] = []
  // children ของ PSD เรียงล่าง→บน (ตรงกับ z-order ของ fabric ที่ objects[0] อยู่ล่างสุด)
  for (const layer of psd.children || []) {
    objects.push(...(await layerToObject(layer)))
  }

  const template: Template = {
    id: nanoid(10),
    version: '6.12',
    zoom: 1,
    width: psd.width,
    height: psd.height,
    clip: 2,
    objects: [WorkSpaceDrawData as any, ...objects],
    workSpace: {
      fillType: 0,
      left: 0,
      top: 0,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
    },
  }
  return template
}