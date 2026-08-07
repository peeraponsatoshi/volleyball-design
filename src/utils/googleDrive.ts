/**
 * Google Drive Sync Utility (Client-side 100%)
 * ใช้ Google Identity Services (GIS) และ Drive v3 REST API
 * สิทธิ์: https://www.googleapis.com/auth/drive.file (เข้าถึงเฉพาะไฟล์ที่แอปสร้างขึ้นเอง ปลอดภัย 100%)
 */

import { localStorage } from '@/utils/storage'
import { Template } from '@/types/canvas'

const TOKEN_KEY = 'YFT_GOOGLE_DRIVE_TOKEN'
const TOKEN_EXPIRE_KEY = 'YFT_GOOGLE_DRIVE_TOKEN_EXPIRE'
const DEFAULT_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1048682855141-8qhk3p5u8psh7l3e67m2k5i3l1d8g7e9.apps.googleusercontent.com'
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
 * โหลดสคริปต์ Google Identity Services (gsi) ถ้ายังไม่ได้โหลด
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
    // เช็คว่ามี token ในแคชและยังไม่หมดอายุหรือไม่
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
        localStorage.set(TOKEN_EXPIRE_KEY, Date.now() + expiresInMs - 60000) // หักลบ 1 นาทีเพื่อความชัวร์
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
  // ค้นหาโฟลเดอร์ที่มีชื่อ DRIVE_FOLDER_NAME
  const query = `name = '${DRIVE_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const searchData = await searchRes.json()

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id
  }

  // ถ้ายังไม่มีโฟลเดอร์ ให้สร้างขึ้นใหม่
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

  const fileName = `${projectName || 'งานออกแบบที่ไม่ระบุชื่อ'}.json`
  const fileContent = JSON.stringify(template)

  const metadata: any = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Volleyball Design Editor Project File',
  }

  if (thumbnailDataUrl) {
    metadata.appProperties = {
      thumbnail: thumbnailDataUrl.length < 100000 ? thumbnailDataUrl : '', // เก็บรูปพรีวิวเล็ก ๆ
    }
  }

  // ถ้าเป็นการบันทึกทับไฟล์เดิม (Existing File)
  if (existingFileId) {
    const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`

    const boundary = '-------314159265358979323846'
    const delimiter = `\r\n--${boundary}\r\n`
    const closeDelimiter = `\r\n--${boundary}--`

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter

    const res = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || 'ไม่สามารถอัปเดตไฟล์บน Google Drive ได้')
    }

    const data = await res.json()
    return { fileId: data.id, name: data.name }
  }

  // ถ้าเป็นการสร้างไฟล์ใหม่ (New File)
  metadata.parents = [folderId]

  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'
  const boundary = '-------314159265358979323846'
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'ไม่สามารถบันทึกไฟล์ไปที่ Google Drive ได้')
  }

  const data = await res.json()
  return { fileId: data.id, name: data.name }
}

/**
 * ดึงรายการไฟล์โปรเจกต์ทั้งหมดที่เก็บไว้ใน Google Drive
 */
export const listDriveProjects = async (clientId?: string): Promise<DriveProject[]> => {
  const token = await getAccessToken(clientId)
  const folderId = await getOrCreateAppFolder(token)

  const query = `'${folderId}' in parents and trashed = false and (name contains '.json' or mimeType = 'application/json')`
  const fields = 'files(id, name, modifiedTime, size, appProperties, thumbnailLink)'
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=modifiedTime desc`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'ไม่สามารถดึงรายการไฟล์จาก Google Drive ได้')
  }

  const data = await res.json()
  return (data.files || []).map((file: any) => ({
    id: file.id,
    name: file.name.replace(/\.json$/, ''),
    modifiedTime: new Date(file.modifiedTime).toLocaleString('th-TH'),
    thumbnailUrl: file.appProperties?.thumbnail || file.thumbnailLink || '',
    size: file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A',
  }))
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
  return templateData as Template
}

/**
 * ลบไฟล์โปรเจกต์ออกจาก Google Drive
 */
export const deleteDriveProject = async (fileId: string, clientId?: string): Promise<void> => {
  const token = await getAccessToken(clientId)
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
