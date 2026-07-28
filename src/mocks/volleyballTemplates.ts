// @ts-nocheck
/**
 * Volleyball content templates (Facebook-ready, Thai copy)
 * Each template is a fabric-compatible JSON document.
 */
import { Template } from '@/types/canvas'
import { DEFAULT_FONT_FAMILY } from '@/configs/fonts'

const FONT = DEFAULT_FONT_FAMILY
const VERSION = '6.0.0-beta12'

const id = () => Math.random().toString(36).slice(2, 12)

const workRect = (w: number, h: number, fill = '#0b1f3a') => ({
  rx: 0,
  ry: 0,
  id: 'WorkSpaceDrawType',
  name: 'rect',
  color: fill,
  padding: 0,
  fill,
  selectable: false,
  evented: false,
  fillType: 0,
  lockMovementX: false,
  lockMovementY: false,
  objectCaching: true,
  transparentCorners: false,
  hasBorders: true,
  globalCompositeOperation: 'source-over',
  type: 'Rect',
  version: VERSION,
  originX: 'left',
  originY: 'top',
  left: 0,
  top: 0,
  width: w,
  height: h,
  stroke: '',
  strokeWidth: 0,
  strokeDashArray: null,
  strokeLineCap: 'butt',
  strokeDashOffset: 0,
  strokeLineJoin: 'miter',
  strokeUniform: false,
  strokeMiterLimit: 4,
  scaleX: 1,
  scaleY: 1,
  angle: 0,
  flipX: false,
  flipY: false,
  opacity: 1,
  shadow: null,
  visible: true,
  backgroundColor: 'rgba(0,0,0,0)',
  fillRule: 'nonzero',
  paintFirst: 'fill',
  skewX: 0,
  skewY: 0,
})

const rect = (opts: {
  left: number
  top: number
  width: number
  height: number
  fill: string
  rx?: number
  ry?: number
  opacity?: number
}) => ({
  rx: opts.rx ?? 12,
  ry: opts.ry ?? 12,
  id: id(),
  name: 'rect',
  color: opts.fill,
  padding: 0,
  fill: opts.fill,
  selectable: true,
  evented: true,
  fillType: 0,
  lockMovementX: false,
  lockMovementY: false,
  objectCaching: false,
  transparentCorners: false,
  hasBorders: true,
  globalCompositeOperation: 'source-over',
  type: 'Rect',
  version: VERSION,
  originX: 'left',
  originY: 'top',
  left: opts.left,
  top: opts.top,
  width: opts.width,
  height: opts.height,
  stroke: null,
  strokeWidth: 0,
  strokeDashArray: null,
  strokeLineCap: 'butt',
  strokeDashOffset: 0,
  strokeLineJoin: 'miter',
  strokeUniform: false,
  strokeMiterLimit: 4,
  scaleX: 1,
  scaleY: 1,
  angle: 0,
  flipX: false,
  flipY: false,
  opacity: opts.opacity ?? 1,
  shadow: null,
  visible: true,
  backgroundColor: '',
  fillRule: 'nonzero',
  paintFirst: 'fill',
  skewX: 0,
  skewY: 0,
})

const textbox = (opts: {
  text: string
  left: number
  top: number
  width: number
  fontSize: number
  fill?: string
  fontWeight?: string | number
  textAlign?: string
  fontFamily?: string
}) => ({
  fontSize: opts.fontSize,
  fontWeight: opts.fontWeight ?? 'normal',
  fontFamily: opts.fontFamily ?? FONT,
  fontStyle: 'normal',
  lineHeight: 1.25,
  text: opts.text,
  charSpacing: 0,
  textAlign: opts.textAlign ?? 'center',
  styles: [],
  pathStartOffset: 0,
  pathSide: 'left',
  pathAlign: 'baseline',
  underline: false,
  overline: false,
  linethrough: false,
  textBackgroundColor: '',
  direction: 'ltr',
  minWidth: 20,
  splitByGrapheme: true,
  id: id(),
  name: 'textbox',
  editable: true,
  color: opts.fill ?? '#ffffff',
  padding: 0,
  fill: opts.fill ?? '#ffffff',
  selectable: true,
  evented: true,
  fillType: 0,
  lockMovementX: false,
  lockMovementY: false,
  objectCaching: false,
  transparentCorners: false,
  hasBorders: true,
  globalCompositeOperation: 'source-over',
  type: 'Textbox',
  version: VERSION,
  originX: 'left',
  originY: 'top',
  left: opts.left,
  top: opts.top,
  width: opts.width,
  height: opts.fontSize * 1.4,
  stroke: null,
  strokeWidth: 1,
  strokeDashArray: null,
  strokeLineCap: 'butt',
  strokeDashOffset: 0,
  strokeLineJoin: 'miter',
  strokeUniform: false,
  strokeMiterLimit: 4,
  scaleX: 1,
  scaleY: 1,
  angle: 0,
  flipX: false,
  flipY: false,
  opacity: 1,
  shadow: null,
  visible: true,
  backgroundColor: '',
  fillRule: 'nonzero',
  paintFirst: 'fill',
  skewX: 0,
  skewY: 0,
})

const baseTemplate = (
  key: string,
  w: number,
  h: number,
  objects: any[],
  bg = '#0b1f3a'
): Template & { meta?: any } =>
  ({
    version: VERSION,
    id: key,
    background: 'rgba(255,255,255,0)',
    objects: [workRect(w, h, bg), ...objects],
    workSpace: {
      fillType: 0,
      left: 0,
      top: 0,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      color: bg,
      fill: bg,
      backgroundColor: 'rgba(0,0,0,0)',
    },
    zoom: 1,
    width: w,
    height: h,
    clip: 0,
    meta: undefined,
  }) as any

/** Match result card — FB square */
export const templateMatchResult = baseTemplate(
  'vb-match-result',
  1080,
  1080,
  [
    rect({ left: 0, top: 0, width: 1080, height: 160, fill: '#e11d48', rx: 0, ry: 0 }),
    textbox({ text: 'ผลการแข่งขัน', left: 40, top: 45, width: 1000, fontSize: 48, fontWeight: 700 }),
    textbox({ text: 'วอลเลย์บอล · Volleyball News', left: 40, top: 105, width: 1000, fontSize: 22, fill: '#fecdd3' }),
    rect({ left: 60, top: 220, width: 420, height: 420, fill: '#132f4c' }),
    rect({ left: 600, top: 220, width: 420, height: 420, fill: '#132f4c' }),
    textbox({ text: 'ทีม A', left: 80, top: 280, width: 380, fontSize: 42, fontWeight: 700 }),
    textbox({ text: '3', left: 80, top: 380, width: 380, fontSize: 120, fontWeight: 700, fill: '#fbbf24' }),
    textbox({ text: 'เซต', left: 80, top: 530, width: 380, fontSize: 28, fill: '#94a3b8' }),
    textbox({ text: 'VS', left: 490, top: 380, width: 100, fontSize: 36, fontWeight: 700, fill: '#f43f5e' }),
    textbox({ text: 'ทีม B', left: 620, top: 280, width: 380, fontSize: 42, fontWeight: 700 }),
    textbox({ text: '1', left: 620, top: 380, width: 380, fontSize: 120, fontWeight: 700, fill: '#fbbf24' }),
    textbox({ text: 'เซต', left: 620, top: 530, width: 380, fontSize: 28, fill: '#94a3b8' }),
    rect({ left: 60, top: 700, width: 960, height: 120, fill: '#1e3a5f' }),
    textbox({
      text: '25-20 | 25-22 | 22-25 | 25-18',
      left: 80,
      top: 720,
      width: 920,
      fontSize: 32,
      fill: '#e2e8f0',
    }),
    textbox({
      text: 'ดับเบิลคลิกเพื่อแก้ชื่อทีม / สกอร์ / เซต',
      left: 60,
      top: 860,
      width: 960,
      fontSize: 24,
      fill: '#64748b',
    }),
    textbox({ text: '@YourVolleyballPage', left: 60, top: 980, width: 960, fontSize: 22, fill: '#94a3b8' }),
  ]
)

/** Match schedule */
export const templateSchedule = baseTemplate(
  'vb-schedule',
  1080,
  1080,
  [
    rect({ left: 0, top: 0, width: 1080, height: 140, fill: '#0369a1', rx: 0, ry: 0 }),
    textbox({ text: 'โปรแกรมการแข่งขัน', left: 40, top: 40, width: 1000, fontSize: 44, fontWeight: 700 }),
    textbox({ text: 'ประจำสัปดาห์ · Weekly Schedule', left: 40, top: 95, width: 1000, fontSize: 22, fill: '#bae6fd' }),
    ...[0, 1, 2, 3].flatMap((i) => {
      const y = 200 + i * 160
      return [
        rect({ left: 50, top: y, width: 980, height: 140, fill: '#0c4a6e' }),
        textbox({
          text: `คู่ที่ ${i + 1}  ·  วันเสาร์ 18:00 น.`,
          left: 80,
          top: y + 20,
          width: 900,
          fontSize: 26,
          fill: '#7dd3fc',
          textAlign: 'left',
        }),
        textbox({
          text: 'ทีมเหย้า  vs  ทีมเยือน',
          left: 80,
          top: y + 65,
          width: 900,
          fontSize: 36,
          fontWeight: 600,
          textAlign: 'left',
        }),
      ]
    }),
    textbox({ text: 'แก้ไขวันเวลาและชื่อทีมได้ทันที', left: 50, top: 900, width: 980, fontSize: 22, fill: '#64748b' }),
  ],
  '#082f49'
)

/** Player roster */
export const templateRoster = baseTemplate(
  'vb-roster',
  1080,
  1350,
  [
    rect({ left: 0, top: 0, width: 1080, height: 180, fill: '#7c3aed', rx: 0, ry: 0 }),
    textbox({ text: 'รายชื่อนักกีฬา', left: 40, top: 45, width: 1000, fontSize: 48, fontWeight: 700 }),
    textbox({ text: 'Team Roster 2026', left: 40, top: 110, width: 1000, fontSize: 26, fill: '#ddd6fe' }),
    ...Array.from({ length: 6 }).flatMap((_, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 50 + col * 510
      const y = 230 + row * 320
      return [
        rect({ left: x, top: y, width: 470, height: 290, fill: '#1e1b4b' }),
        rect({ left: x + 30, top: y + 30, width: 140, height: 140, fill: '#4c1d95', rx: 70, ry: 70 }),
        textbox({ text: String(i + 1).padStart(2, '0'), left: x + 30, top: y + 70, width: 140, fontSize: 40, fontWeight: 700 }),
        textbox({
          text: `นักกีฬา ${i + 1}`,
          left: x + 190,
          top: y + 50,
          width: 250,
          fontSize: 28,
          fontWeight: 600,
          textAlign: 'left',
        }),
        textbox({
          text: 'ตำแหน่ง: ตัวตบ\nหมายเลข: 0' + (i + 1),
          left: x + 190,
          top: y + 110,
          width: 250,
          fontSize: 22,
          fill: '#c4b5fd',
          textAlign: 'left',
        }),
      ]
    }),
    textbox({
      text: 'ดับเบิลคลิกแก้ชื่อ / ตำแหน่ง / เบอร์เสื้อ',
      left: 50,
      top: 1240,
      width: 980,
      fontSize: 22,
      fill: '#64748b',
    }),
  ],
  '#0f0a1f'
)

/** News headline */
export const templateNews = baseTemplate(
  'vb-news',
  1200,
  630,
  [
    rect({ left: 0, top: 0, width: 1200, height: 630, fill: '#111827', rx: 0, ry: 0 }),
    rect({ left: 0, top: 0, width: 18, height: 630, fill: '#f43f5e', rx: 0, ry: 0 }),
    textbox({ text: 'BREAKING', left: 60, top: 50, width: 400, fontSize: 28, fill: '#f43f5e', fontWeight: 700, textAlign: 'left' }),
    textbox({
      text: 'หัวข้อข่าววอลเลย์บอล\nใส่หัวข้อที่นี่',
      left: 60,
      top: 120,
      width: 900,
      fontSize: 56,
      fontWeight: 700,
      textAlign: 'left',
    }),
    textbox({
      text: 'สรุปสั้น ๆ ของข่าว หรือไฮไลต์นัดสำคัญ\nดับเบิลคลิกเพื่อแก้ไขข้อความ',
      left: 60,
      top: 320,
      width: 900,
      fontSize: 28,
      fill: '#cbd5e1',
      textAlign: 'left',
    }),
    rect({ left: 60, top: 480, width: 280, height: 64, fill: '#f43f5e', rx: 8, ry: 8 }),
    textbox({ text: 'อ่านต่อ', left: 60, top: 492, width: 280, fontSize: 28, fontWeight: 600 }),
    textbox({ text: '@YourVolleyballPage', left: 380, top: 500, width: 500, fontSize: 22, fill: '#94a3b8', textAlign: 'left' }),
  ],
  '#111827'
)

/** Story teaser */
export const templateStory = baseTemplate(
  'vb-story',
  1080,
  1920,
  [
    rect({ left: 0, top: 0, width: 1080, height: 1920, fill: '#0f172a', rx: 0, ry: 0 }),
    rect({ left: 80, top: 200, width: 920, height: 120, fill: '#e11d48', rx: 16, ry: 16 }),
    textbox({ text: 'TONIGHT', left: 80, top: 230, width: 920, fontSize: 48, fontWeight: 700 }),
    textbox({ text: 'แมตช์คืนนี้', left: 80, top: 400, width: 920, fontSize: 72, fontWeight: 700 }),
    textbox({ text: 'ทีมเหย้า', left: 80, top: 700, width: 920, fontSize: 56, fontWeight: 600 }),
    textbox({ text: 'VS', left: 80, top: 820, width: 920, fontSize: 48, fill: '#fbbf24' }),
    textbox({ text: 'ทีมเยือน', left: 80, top: 920, width: 920, fontSize: 56, fontWeight: 600 }),
    rect({ left: 140, top: 1200, width: 800, height: 160, fill: '#1e293b' }),
    textbox({ text: 'เวลา 19:00 น.\nสนามหลัก · ถ่ายทอดสด', left: 140, top: 1230, width: 800, fontSize: 36, fill: '#e2e8f0' }),
    textbox({ text: 'Swipe up / ดูรายละเอียด', left: 80, top: 1700, width: 920, fontSize: 28, fill: '#64748b' }),
  ]
)

/** Starting lineup */
export const templateLineup = baseTemplate(
  'vb-lineup',
  1080,
  1080,
  [
    rect({ left: 0, top: 0, width: 1080, height: 150, fill: '#15803d', rx: 0, ry: 0 }),
    textbox({ text: '11 ตัวจริง · Starting 11', left: 40, top: 45, width: 1000, fontSize: 42, fontWeight: 700 }),
    textbox({ text: 'รายชื่อตัวจริงประจำนัด', left: 40, top: 100, width: 1000, fontSize: 22, fill: '#bbf7d0' }),
    ...Array.from({ length: 6 }).map((_, i) => {
      const y = 200 + i * 110
      return rect({ left: 60, top: y, width: 960, height: 95, fill: '#14532d' })
    }),
    ...Array.from({ length: 6 }).flatMap((_, i) => {
      const y = 215 + i * 110
      return [
        textbox({
          text: `${String(i + 1).padStart(2, '0')}  ชื่อนักกีฬา`,
          left: 90,
          top: y,
          width: 600,
          fontSize: 32,
          fontWeight: 600,
          textAlign: 'left',
        }),
        textbox({
          text: 'ตำแหน่ง',
          left: 720,
          top: y,
          width: 260,
          fontSize: 28,
          fill: '#86efac',
          textAlign: 'right',
        }),
      ]
    }),
    textbox({ text: 'แก้ไขรายชื่อก่อนโพสต์', left: 60, top: 980, width: 960, fontSize: 22, fill: '#64748b' }),
  ],
  '#052e16'
)

export const VolleyballTemplates: Template[] = [
  templateMatchResult,
  templateSchedule,
  templateRoster,
  templateNews,
  templateStory,
  templateLineup,
]

/** Catalog for template picker UI */
export const VolleyballTemplateCatalog = [
  {
    id: 'vb-match-result',
    name: 'ผลแข่ง',
    desc: 'สกอร์ + เซต · 1080×1080',
    size: '1080×1080',
    template: templateMatchResult,
    color: '#e11d48',
  },
  {
    id: 'vb-schedule',
    name: 'โปรแกรมแข่ง',
    desc: 'ตารางคู่แข่งรายสัปดาห์',
    size: '1080×1080',
    template: templateSchedule,
    color: '#0369a1',
  },
  {
    id: 'vb-roster',
    name: 'รายชื่อนักกีฬา',
    desc: 'Roster · 1080×1350',
    size: '1080×1350',
    template: templateRoster,
    color: '#7c3aed',
  },
  {
    id: 'vb-news',
    name: 'หัวข่าว',
    desc: 'ลิงก์พรีวิว FB · 1200×630',
    size: '1200×630',
    template: templateNews,
    color: '#f43f5e',
  },
  {
    id: 'vb-story',
    name: 'Story แมตช์คืนนี้',
    desc: 'Story 1080×1920',
    size: '1080×1920',
    template: templateStory,
    color: '#0f172a',
  },
  {
    id: 'vb-lineup',
    name: 'ตัวจริง',
    desc: 'Starting lineup',
    size: '1080×1080',
    template: templateLineup,
    color: '#15803d',
  },
]
