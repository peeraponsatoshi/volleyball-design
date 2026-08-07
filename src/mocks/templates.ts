import { Template } from '@/types/canvas'
import { WorkSpaceDrawData } from '@/configs/canvas'

// หน้ากระดาษว่างเริ่มต้น 1 แผ่น (ขนาดมาตรฐาน 1080x1080)
const defaultBlankPage: Template = {
  id: 'blank_template_01',
  version: '6.12',
  zoom: 1,
  width: 1080,
  height: 1080,
  clip: 2,
  objects: [{ ...WorkSpaceDrawData, width: 1080, height: 1080 }],
  workSpace: {
    fillType: 0,
    left: 0,
    top: 0,
    angle: 0,
    scaleX: 1,
    scaleY: 1,
  },
}

export const Templates: Template[] = [defaultBlankPage]
