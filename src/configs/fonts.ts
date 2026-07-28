import { SystemFont } from "@/types/common"

/** System fonts (cross-platform + Thai-friendly) */
export const SYS_FONTS: SystemFont[] = [
  { label: 'Sarabun (ไทย)', value: 'Sarabun' },
  { label: 'Prompt (ไทย)', value: 'Prompt' },
  { label: 'Noto Sans Thai', value: 'Noto Sans Thai' },
  { label: 'Kanit (ไทย)', value: 'Kanit' },
  { label: 'Mitr (ไทย)', value: 'Mitr' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Tahoma', value: 'Tahoma' },
  { label: 'Segoe UI', value: 'Segoe UI' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Verdana', value: 'Verdana' },
]

/** Web fonts loaded via CSS @font-face / Google Fonts */
export const WEB_FONTS = [
  { label: 'Sarabun', value: 'Sarabun' },
  { label: 'Prompt', value: 'Prompt' },
  { label: 'Noto Sans Thai', value: 'Noto Sans Thai' },
  { label: 'Kanit', value: 'Kanit' },
  { label: 'Mitr', value: 'Mitr' },
  { label: 'Chakra Petch', value: 'Chakra Petch' },
  { label: 'IBM Plex Sans Thai', value: 'IBM Plex Sans Thai' },
]

/** Default font for new text objects */
export const DEFAULT_FONT_FAMILY = 'Sarabun'
