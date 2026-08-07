/**
 * Google Drive Sync Utility (Client-side 100%)
 * ใช้ Google Identity Services (GIS) และ Drive v3 REST API
 * สิทธิ์: https://www.googleapis.com/auth/drive.file (เข้าถึงเฉพาะไฟล์ที่แอปสร้างขึ้นเอง ปลอดภัย 100%)
 */

import { localStorage } from '@/utils/storage'
import { Template } from '@/types/canvas'

const TOKEN_KEY = 'YFT_GOOGLE_DRIVE_TOKEN'
const TOKEN_EXPIRE_KEY = 'YFT_GOOGLE_DRIVE_TOKEN_EXPIRE'
const DEFAULT_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '95584897723-00nkagcchqv4pird98q95bo9dh6ara56.apps.googleusercontent.com'
const DRIVE_FOLDER_NAME = 'Volleyball Design Projects'
const SCOPES = 'https://www.googleapis.com/auth/drive.file'

export interface DriveProject {
  id: string
  name: string
  modifiedTime: string
  thumbnailUrl?: string
  size?: string
}

let tokenClient: any = null
let gToken: string | null = localStorage.get(TOKEN_KEY) || null

/**
 * โหลดสคริปต์ Google Identity Services (gsi)
 */
export const loadGsiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }

    const existingScript = document.getElementById('gsi-script')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      return
    }

    const script = document.createElement('script')
    script.id = 'gsi-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = err => reject(err)
    document.head.appendChild(script)
  })
}

/**
 * ตรวจสอบและขอ Access Token จาก Google ( OAuth2 Pop-up )
 */
export const getAccessToken = (clientId: string = DEFAULT_CLIENT_ID): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const cachedToken = localStorage.get(TOKEN_KEY)
    const expireTime = localStorage.get(TOKEN_EXPIRE_KEY)
    if (cachedToken && expireTime && Date.now() < Number(expireTime)) {
      gToken = cachedToken
      resolve(cachedToken)
      return
    }

    try {
      await loadGsiScript()
    } catch (err) {
      reject(new Error('ไม่สามารถโหลดระบบล็อกอิน Google ได้ กรุณาเช็คอินเทอร์เน็ต'))
      return
    }

    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services SDK ไม่พร้อมใช้งาน'))
      return
    }

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error) {
          reject(new Error(`การเข้าสู่ระบบ Google ล้มเหลว: ${response.error}`))
          return
        }
        gToken = response.access_token
        const expiresInMs = (response.expires_in || 3600) * 1000
        localStorage.set(TOKEN_KEY, gToken)
        localStorage.set(TOKEN_EXPIRE_KEY, Date.now() + expiresInMs - 60000)
        resolve(gToken!)
      },
    })

    tokenClient.requestAccessToken({ prompt: '' })
  })
}

/**
 * ยกเลิกการเชื่อมต่อ / ลบแคช Token
 */
export const logoutGoogleDrive = () => {
  if (gToken && window.google?.accounts?.oauth2?.revoke) {
    try {
      window.google.accounts.oauth2.revoke(gToken, () => {})
    } catch (e) {}
  }
  gToken = null
  localStorage.remove(TOKEN_KEY)
  localStorage.remove(TOKEN_EXPIRE_KEY)
}

/**
 * ค้นหาหรือสร้างโฟลเดอร์สำหรับเก็บงานใน Google Drive
 */
const getOrCreateAppFolder = async (accessToken: string): Promise<string> => {
  const query = `name = '${DRIVE_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const searchData = await searchRes.json()

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  })
  const createData = await createRes.json()
  return createData.id
}

/**
 * แปลง Data URL เป็น Blob
 */
const dataURLtoBlob = (dataurl: string): Blob => {
  const arr = dataurl.split(',')
  const mimeMatch = arr[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

/**
 * บันทึกหรืออัปเดตรูป Thumbnail PNG แยกต่างหากใน Google Drive
 */
const saveThumbnailImage = async (
  token: string,
  folderId: string,
  baseName: string,
  thumbnailDataUrl: string,
): Promise<void> => {
  try {
    const pngName = `${baseName}.png`
    const query = `'${folderId}' in parents and name = '${pngName}' and trashed = false`
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    const searchData = await searchRes.json()
    const existingPngId = searchData.files?.[0]?.id

    const blob = dataURLtoBlob(thumbnailDataUrl)

    if (existingPngId) {
      // อัปเดตรูป PNG เดิม
      await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingPngId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'image/png',
          },
          body: blob,
        },
      )
    } else {
      // สร้างรูป PNG ใหม่พร้อม Metadata
      const metadata = {
        name: pngName,
        parents: [folderId],
        mimeType: 'image/png',
      }
      const boundary = 'png_boundary_999'
      const metaBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
      const multipartBlob = new Blob(
        [
          `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
          metaBlob,
          `\r\n--${boundary}\r\nContent-Type: image/png\r\n\r\n`,
          blob,
          `\r\n--${boundary}--`,
        ],
        { type: `multipart/related; boundary=${boundary}` },
      )

      await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: multipartBlob,
        },
      )
    }
  } catch (e) {
    console.warn('ไม่สามารถเซฟรูปพรีวิว PNG แยกได้:', e)
  }
}

/**
 * สร้าง Multipart Related Body เป็น Blob ตามมาตรฐาน Google Drive REST API
 */
const createMultipartBlob = (metadata: object, jsonContent: string): Blob => {
  const boundary = 'v_design_boundary_888'
  const delimiter = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const metaString = JSON.stringify(metadata)
  const contentString = jsonContent

  return new Blob(
    [
      delimiter,
      metaString,
      `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
      contentString,
      closeDelimiter,
    ],
    { type: `multipart/related; boundary=${boundary}` },
  )
}

/**
 * บันทึกโปรเจกต์ไปยัง Google Drive
 */
export const saveProjectToDrive = async (
  template: Template,
  projectName: string,
  thumbnailDataUrl?: string,
  existingFileId?: string,
  clientId?: string,
): Promise<{ fileId: string; name: string }> => {
  const token = await getAccessToken(clientId)
  const folderId = await getOrCreateAppFolder(token)

  const cleanName = projectName || 'งานออกแบบที่ไม่ระบุชื่อ'
  const fileName = `${cleanName}.json`
  const fileContent = JSON.stringify(template)

  const metadata: any = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Volleyball Design Editor Project File',
  }

  let resultFileId = existingFileId

  // อัปเดตไฟล์เดิม
  if (existingFileId) {
    const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
    const bodyBlob = createMultipartBlob(metadata, fileContent)

    const res = await fetch(updateUrl, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: bodyBlob,
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || 'ไม่สามารถอัปเดตไฟล์บน Google Drive ได้')
    }

    const data = await res.json()
    resultFileId = data.id
  } else {
    // สร้างไฟล์ใหม่
    metadata.parents = [folderId]
    const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'
    const bodyBlob = createMultipartBlob(metadata, fileContent)

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: bodyBlob,
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || 'ไม่สามารถบันทึกไฟล์ไปที่ Google Drive ได้')
    }

    const data = await res.json()
    resultFileId = data.id
  }

  // เซฟรูป PNG พรีวิวแยกไว้คู่กับไฟล์ JSON เพื่อการแสดงผลที่เร็วและแน่นอน 100%
  if (thumbnailDataUrl) {
    await saveThumbnailImage(token, folderId, cleanName, thumbnailDataUrl)
  }

  return { fileId: resultFileId, name: cleanName }
}

/**
 * ดึงรายการไฟล์โปรเจกต์ทั้งหมดที่เก็บไว้ใน Google Drive พร้อมอ่านรูปพรีวิวตัวอย่างงาน
 */
export const listDriveProjects = async (clientId?: string): Promise<DriveProject[]> => {
  const token = await getAccessToken(clientId)
  const folderId = await getOrCreateAppFolder(token)

  // ดึงทั้งไฟล์ .json และไฟล์ .png ในโฟลเดอร์เดียวกัน
  const query = `'${folderId}' in parents and trashed = false`
  const fields = 'files(id, name, modifiedTime, size, mimeType)'
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=modifiedTime desc`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'ไม่สามารถดึงรายการไฟล์จาก Google Drive ได้')
  }

  const data = await res.json()
  const allFiles: any[] = data.files || []

  const jsonFiles = allFiles.filter(
    f => f.name.endsWith('.json') || f.mimeType === 'application/json',
  )
  const pngFiles = allFiles.filter(
    f => f.name.endsWith('.png') || f.mimeType === 'image/png',
  )

  // จับคู่ไฟล์ .json กับ .png ที่ชื่อเดียวกัน
  const projects = await Promise.all(
    jsonFiles.map(async file => {
      const baseName = file.name.replace(/\.json$/, '')
      const matchingPng = pngFiles.find(p => p.name === `${baseName}.png`)

      let thumbnailUrl = ''

      if (matchingPng) {
        try {
          const imgRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${matchingPng.id}?alt=media`,
            { headers: { Authorization: `Bearer ${token}` } },
          )
          if (imgRes.ok) {
            const blob = await imgRes.blob()
            thumbnailUrl = URL.createObjectURL(blob)
          }
        } catch (e) {}
      }

      return {
        id: file.id,
        name: baseName,
        modifiedTime: new Date(file.modifiedTime).toLocaleString('th-TH'),
        thumbnailUrl,
        size: file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A',
      }
    }),
  )

  return projects
}

/**
 * ดาวน์โหลดและเปิดโปรเจกต์จาก Google Drive
 */
export const loadDriveProject = async (fileId: string, clientId?: string): Promise<Template> => {
  const token = await getAccessToken(clientId)
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'ไม่สามารถดาวน์โหลดไฟล์จาก Google Drive ได้')
  }

  const templateData = await res.json()
  if (templateData._previewThumbnail) {
    delete templateData._previewThumbnail
  }
  return templateData as Template
}

/**
 * ลบไฟล์โปรเจกต์ออกจาก Google Drive (ลบทั้ง .json และ .png คู่กัน)
 */
export const deleteDriveProject = async (fileId: string, clientId?: string): Promise<void> => {
  const token = await getAccessToken(clientId)

  // อ่านชื่อไฟล์เดิมก่อนลบ เพื่อหาไฟล์ .png ที่คู่กัน
  let baseName = ''
  try {
    const getRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,parents`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (getRes.ok) {
      const info = await getRes.json()
      baseName = info.name.replace(/\.json$/, '')
      const folderId = info.parents?.[0]

      if (folderId && baseName) {
        // ค้นหาไฟล์ .png
        const pngQuery = `'${folderId}' in parents and name = '${baseName}.png' and trashed = false`
        const pngRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(pngQuery)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (pngRes.ok) {
          const pngData = await pngRes.json()
          if (pngData.files?.[0]?.id) {
            await fetch(`https://www.googleapis.com/drive/v3/files/${pngData.files[0].id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            })
          }
        }
      }
    }
  } catch (e) {}

  // ลบไฟล์ .json หลัก
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok && res.status !== 404) {
    const err = await res.json()
    throw new Error(err.error?.message || 'ไม่สามารถลบไฟล์ออกจาก Google Drive ได้')
  }
}
