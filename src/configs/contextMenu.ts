import { ContextMenu } from '@/components/Contextmenu/types'
import { ElementNames, AlignCommand, LayerCommand } from '@/types/elements'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store'
import useHandleElement from '@/hooks/useHandleElement'
import useHandleTool from '@/hooks/useHandleTool'

export const contextMenuThumbnails = (): ContextMenu[] => {
  const { pasteElement } = useHandleElement()
  return [
    {
      text: 'วาง',
      subText: 'Ctrl + V',
      handler: pasteElement,
    },
    {
      text: 'เลือกทั้งหมด',
      subText: 'Ctrl + A',
    },
    {
      text: 'หน้าใหม่',
      subText: 'Enter',
    },
    {
      text: 'พรีวิวหน้า',
      subText: 'F5',
    },
  ]
}

export const contextMenus = (): ContextMenu[] => {
  const { lockElement, deleteElement, cutElement, copyElement, pasteElement, uncombineElements, combineElements, resetElements } = useHandleElement()
  const { alignElement, layerElement } = useHandleTool()
  const { canvasObject } = storeToRefs(useMainStore())
  const element = canvasObject.value
  if (!element) {
    return [
      {
        text: 'วาง',
        subText: 'Ctrl + V',
        handler: pasteElement,
      },
      {
        text: 'เลือกทั้งหมด',
        subText: 'Ctrl + A',
      },
      {
        text: 'ไม้บรรทัด',
      },
      {
        text: 'ตารางเส้น',
      },
      {
        text: 'รีเซ็ต',
        handler: resetElements,
      },
    ]
  }
  if (element.lockMovementX && element.lockMovementY) {
    return [{
      text: 'ปลดล็อก',
      handler: () => lockElement(element.id, false),
    }]
  }

  return [
    {
      text: 'ตัด',
      subText: 'Ctrl + X',
      handler: cutElement,
    },
    {
      text: 'คัดลอก',
      subText: 'Ctrl + C',
      handler: copyElement,
    },
    {
      text: 'วาง',
      subText: 'Ctrl + V',
      handler: pasteElement,
    },
    { divider: true },
    {
      text: 'จัดกลางแนวนอน',
      handler: () => alignElement(AlignCommand.HORIZONTAL),
      children: [
        { text: 'กึ่งกลาง', handler: () => alignElement(AlignCommand.CENTER) },
        { text: 'จัดกลางแนวนอน', handler: () => alignElement(AlignCommand.HORIZONTAL) },
        { text: 'ชิดซ้าย', handler: () => alignElement(AlignCommand.LEFT) },
        { text: 'ชิดขวา', handler: () => alignElement(AlignCommand.RIGHT) },
      ],
    },
    {
      text: 'จัดกลางแนวตั้ง',
      handler: () => alignElement(AlignCommand.VERTICAL),
      children: [
        { text: 'กึ่งกลาง', handler: () => alignElement(AlignCommand.CENTER) },
        { text: 'จัดกลางแนวตั้ง', handler: () => alignElement(AlignCommand.VERTICAL) },
        { text: 'ชิดบน', handler: () => alignElement(AlignCommand.TOP) },
        { text: 'ชิดล่าง', handler: () => alignElement(AlignCommand.BOTTOM) },
      ],
    },
    { divider: true },
    {
      text: 'นำมาหน้าสุด',
      handler: () => layerElement(LayerCommand.TOP),
      children: [
        { text: 'นำมาหน้าสุด', handler: () => layerElement(LayerCommand.TOP) },
        { text: 'เลื่อนขึ้นหนึ่งชั้น', handler: () => layerElement(LayerCommand.UP) },
      ],
    },
    {
      text: 'ส่งไปหลังสุด',
      handler: () => layerElement(LayerCommand.BOTTOM),
      children: [
        { text: 'ส่งไปหลังสุด', handler: () => layerElement(LayerCommand.BOTTOM) },
        { text: 'เลื่อนลงหนึ่งชั้น', handler: () => layerElement(LayerCommand.DOWN) },
      ],
    },
    { divider: true },
    {
      text: element.type === ElementNames.GROUP ? 'ยกเลิกกลุ่ม' : 'จัดกลุ่ม',
      subText: 'Ctrl + G',
      handler: element.type === ElementNames.GROUP ? uncombineElements : combineElements,
    },
    {
      text: 'เลือกทั้งหมด',
      subText: 'Ctrl + A',
    },
    {
      text: 'ล็อก',
      subText: 'Ctrl + L',
      handler: () => lockElement(element.id, true),
    },
    {
      text: 'ลบ',
      subText: 'Delete',
      handler: () => deleteElement(element.id),
    },
  ]
}

export const contextMenusThumbnails = (): ContextMenu[] => {
  return [
    {
      text: 'ตัด',
      subText: 'Ctrl + X',
    },
    {
      text: 'คัดลอก',
      subText: 'Ctrl + C',
    },
    {
      text: 'วาง',
      subText: 'Ctrl + V',
    },
    {
      text: 'เลือกทั้งหมด',
      subText: 'Ctrl + A',
    },
    { divider: true },
    {
      text: 'หน้าใหม่',
      subText: 'Enter',
    },
    {
      text: 'คัดลอกหน้า',
      subText: 'Ctrl + D',
    },
    {
      text: 'ลบหน้า',
      subText: 'Delete',
    },
    { divider: true },
    {
      text: 'พรีวิวจากหน้านี้',
      subText: 'Shift + F5',
    },
  ]
}
