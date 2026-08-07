import { readPsd, getLayerMaskCanvas } from 'ag-psd'
import { nanoid } from 'nanoid'
import { Template } from '@/types/canvas'
import { WorkSpaceDrawData, propertiesToInclude } from '@/configs/canvas'
import { Image as FabricImage } from '@/extension/object/Image'

/**
 * แปลง BlendMode ของ Photoshop เป็น globalCompositeOperation ของ fabric.
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
 * แปลง Layer Mask ของ Photoshop (ที่เป็น Grayscale RGB) ให้กลายเป็น Alpha Channel Mask
 * (255/สีขาว = แสดงผลทึบแสง, 0/สีดำ = โปร่งใส)
 */
const convertGrayscaleToAlphaMask = (maskCanvas: HTMLCanvasElement): HTMLCanvasElement => {
  const width = maskCanvas.width
  const height = maskCanvas.height
  const alphaCanvas = document.createElement('canvas')
  alphaCanvas.width = width
  alphaCanvas.height = height
  const alphaCtx = alphaCanvas.getContext('2d')
  if (!alphaCtx) return maskCanvas

  const maskCtx = maskCanvas.getContext('2d')
  if (!maskCtx) return maskCanvas

  const imgData = maskCtx.getImageData(0, 0, width, height)
  const data = imgData.data

  // แปลงค่าความสว่างของ RGB ให้กลายเป็น Alpha channel
  for (let i = 0; i < data.length; i += 4) {
    const intensity = data[i] // สีขาว=255, สีดำ=0
    data[i + 3] = intensity
  }

  alphaCtx.putImageData(imgData, 0, 0)
  return alphaCanvas
}

/**
 * ตัดขอบ/เจาะรูรูปภาพของเลเยอร์ด้วย Layer Mask (ถ้ามี)
 */
const applyLayerMask = (layer: any, layerCanvas: HTMLCanvasElement): HTMLCanvasElement => {
  const mask = layer.mask
  if (!mask || mask.disabled) return layerCanvas

  // ดึง Canvas ของ Mask (ผ่าน getLayerMaskCanvas หรือ layer.mask.canvas)
  const rawMaskCv = getLayerMaskCanvas(layer) || mask.canvas
  if (!rawMaskCv || !rawMaskCv.width || !rawMaskCv.height) return layerCanvas

  const layerW = layerCanvas.width
  const layerH = layerCanvas.height
  if (!layerW || !layerH) return layerCanvas

  // สร้าง Canvas ใหม่เพื่อทำการรวม Mask เข้ากับรูปภาพ
  const maskedCanvas = document.createElement('canvas')
  maskedCanvas.width = layerW
  maskedCanvas.height = layerH
  const ctx = maskedCanvas.getContext('2d')
  if (!ctx) return layerCanvas

  // วาดรูปภาพเดิม
  ctx.drawImage(layerCanvas, 0, 0)

  // แปลง Mask เป็น Alpha Mask
  const alphaMaskCv = convertGrayscaleToAlphaMask(rawMaskCv)

  // คำนวณตำแหน่ง Mask เทียบกับตัวเลเยอร์
  const layerLeft = layer.left || 0
  const layerTop = layer.top || 0
  const maskLeft = mask.left ?? layerLeft
  const maskTop = mask.top ?? layerTop
  const offsetX = maskLeft - layerLeft
  const offsetY = maskTop - layerTop

  // ใช้ destination-in เพื่อตัดส่วนที่นอกเหนือจาก Mask ให้โปร่งใส
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(alphaMaskCv, offsetX, offsetY)

  return maskedCanvas
}

/**
 * ตัดรูปภาพด้วย Clipping Mask (ตัดตามรูปร่าง/ความโปร่งใสของเลเยอร์ฐาน)
 */
const applyClippingMask = (
  clipCanvas: HTMLCanvasElement,
  clipLeft: number,
  clipTop: number,
  baseCanvas: HTMLCanvasElement,
  baseLeft: number,
  baseTop: number,
): HTMLCanvasElement => {
  const w = clipCanvas.width
  const h = clipCanvas.height
  if (!w || !h) return clipCanvas

  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = w
  resultCanvas.height = h
  const ctx = resultCanvas.getContext('2d')
  if (!ctx) return clipCanvas

  // วาดรูปภาพของเลเยอร์ clipping
  ctx.drawImage(clipCanvas, 0, 0)

  // ตัดขอบด้วย alpha ของเลเยอร์ฐาน (base layer)
  const offsetX = baseLeft - clipLeft
  const offsetY = baseTop - clipTop
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(baseCanvas, offsetX, offsetY)

  return resultCanvas
}

interface ProcessedLayerInfo {
  layer: any
  canvas: HTMLCanvasElement
  left: number
  top: number
}

/**
 * ประมวลผลเลเยอร์และโฟลเดอร์แบบ Recursive พร้อมจัดการ Layer Mask และ Clipping Mask
 */
const processLayerList = async (layerList: any[]): Promise<Record<string, any>[]> => {
  const objects: Record<string, any>[] = []
  let currentBase: ProcessedLayerInfo | null = null

  for (const layer of layerList) {
    if (layer.hidden) continue

    // ถ้าเป็นโฟลเดอร์/กลุ่ม → ประมวลผลลูกข้างใน
    if (layer.children && layer.children.length) {
      const childObjs = await processLayerList(layer.children)
      objects.push(...childObjs)
      currentBase = null
      continue
    }

    let cv = layer.canvas
    if (!cv || !cv.width || !cv.height) continue

    // 1. ประมวลผล Layer Mask (เจาะฉากหลังขาว/ตาม mask)
    cv = applyLayerMask(layer, cv)

    const left = layer.left || 0
    const top = layer.top || 0

    // 2. ประมวลผล Clipping Mask (ถ้าเลเยอร์นี้ใช้เลเยอร์ล่างเป็น clipping mask)
    if (layer.clipping && currentBase) {
      cv = applyClippingMask(cv, left, top, currentBase.canvas, currentBase.left, currentBase.top)
    } else {
      // อัปเดตเลเยอร์ฐานปัจจุบัน
      currentBase = { layer, canvas: cv, left, top }
    }

    const src = cv.toDataURL('image/png')
    const img = await FabricImage.fromURL(
      src,
      {},
      {
        crossOrigin: 'anonymous',
        originX: 'left',
        originY: 'top',
        left,
        top,
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
    objects.push(img.toObject(propertiesToInclude))
  }

  return objects
}

/**
 * อ่านไฟล์ PSD ด้วย ag-psd และสร้าง Template ของตัวแก้ไข
 */
export const psdToTemplate = async (file: File): Promise<Template> => {
  const buffer = await file.arrayBuffer()
  const psd = readPsd(buffer as ArrayBuffer)

  WorkSpaceDrawData.width = psd.width
  WorkSpaceDrawData.height = psd.height

  // ประมวลผลเลเยอร์ทั้งหมด (พร้อม layer mask + clipping mask)
  const objects = await processLayerList(psd.children || [])

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