export const CanvasSize = { width: 1080, height: 1080 }
export const DefaultDPI = 96
export const DefaultRatio = 25.4
export const DefaultVersion = '6.0.0'
export const PageSize = 20

/** Social / Facebook presets (pixels) */
export const SocialSizePresets = [
  { id: 'fb-post', name: 'Facebook โพสต์', width: 1080, height: 1080 },
  { id: 'fb-cover', name: 'Facebook ปกเพจ', width: 1640, height: 924 },
  { id: 'fb-landscape', name: 'Facebook แนวนอน', width: 1200, height: 630 },
  { id: 'fb-story', name: 'Facebook / IG Story', width: 1080, height: 1920 },
  { id: 'ig-post', name: 'Instagram โพสต์', width: 1080, height: 1080 },
  { id: 'ig-portrait', name: 'Instagram แนวตั้ง', width: 1080, height: 1350 },
  { id: 'twitter', name: 'X / Twitter', width: 1600, height: 900 },
  { id: 'youtube', name: 'YouTube Thumbnail', width: 1280, height: 720 },
] as const
