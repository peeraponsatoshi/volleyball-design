export const TransparentFill = 'rgba(0,0,0,0)'
export const MinSize = 30
export const MaxSize = 4000
export const Padding = 50000

export const DesignUnitMode = [
  { id: 0, name: 'mm' },
  { id: 1, name: 'px' },
]

/** Canvas size presets — social-first for volleyball content */
export const DesignSizeMode = [
  { id: 0, name: 'FB โพสต์ 1080×1080', disabled: false, width: 1080, height: 1080 },
  { id: 1, name: 'FB ปก 1640×924', disabled: false, width: 1640, height: 924 },
  { id: 2, name: 'FB แนวนอน 1200×630', disabled: false, width: 1200, height: 630 },
  { id: 3, name: 'Story 1080×1920', disabled: false, width: 1080, height: 1920 },
  { id: 4, name: 'IG แนวตั้ง 1080×1350', disabled: false, width: 1080, height: 1350 },
  { id: 5, name: 'YouTube 1280×720', disabled: false, width: 1280, height: 720 },
  { id: 6, name: 'กำหนดเอง', disabled: false, width: 0, height: 0 },
]

export const BackgroundFillMode = [
  { id: 0, name: 'สีทึบ' },
  { id: 1, name: 'พื้นด้วยรูป' },
  { id: 2, name: 'ไล่สี' },
  { id: 3, name: 'ตาราง' },
  { id: 4, name: 'รูปทรง' },
  { id: 5, name: 'เติมอัจฉริยะ' },
]

export const BackgroundFillImageMode = [
  { id: 'contain', name: 'พอดีกรอบ' },
  { id: 'repeat', name: 'เรียงซ้ำ' },
  { id: 'cover', name: 'เต็มพื้นที่' },
]

export const BackgroundFillGradientMode = [
  { id: 0, name: 'ไล่สีเส้นตรง', value: 'linear' },
  { id: 1, name: 'ไล่สีรัศมี', value: 'radial' },
]

export const BackgroundFillGridMode = [
  { id: 0, name: 'ไล่โทน', value: 'interpolateLinear' },
  { id: 1, name: 'ระยิบ', value: 'sparkle' },
  { id: 2, name: 'เงา', value: 'shadows' },
]
