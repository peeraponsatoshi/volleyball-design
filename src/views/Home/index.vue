<template>
  <div class="home-page min-h-screen bg-slate-50">
    <!-- Header Navigation Bar -->
    <header class="h-[64px] bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div class="flex items-center gap-3 cursor-pointer" @click="goHome">
        <img src="@/assets/logo.svg" alt="Logo" class="h-9" />
        <span class="font-extrabold text-lg text-slate-800 tracking-tight">Volleyball Design</span>
      </div>

      <!-- User Profile & Login Section -->
      <div class="flex items-center gap-3">
        <div v-if="userProfile" class="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-full">
          <img v-if="userProfile.picture" :src="userProfile.picture" class="w-7 h-7 rounded-full" alt="Avatar" />
          <div class="flex flex-col text-left">
            <span class="text-xs font-bold text-slate-800 leading-tight">{{ userProfile.name }}</span>
            <span class="text-[10px] text-slate-500 leading-tight">{{ userProfile.email }}</span>
          </div>
          <el-button type="danger" size="small" circle text @click="handleLogout" title="ออกจากระบบ">
            <el-icon><SwitchButton /></el-icon>
          </el-button>
        </div>
        <div v-else>
          <el-button type="primary" class="font-medium" round @click="handleLoginGoogle">
            ☁️ เข้าสู่ระบบด้วย Google
          </el-button>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- Hero Banner -->
      <div class="hero-card bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="space-y-3 text-center md:text-left">
          <h1 class="text-3xl font-extrabold tracking-tight">ออกแบบกราฟิกวอลเลย์บอลออนไลน์</h1>
          <p class="text-blue-100 text-sm max-w-xl">
            สร้างโปสเตอร์ ตารางแข่งขัน สกอร์แมตช์ นำเข้าไฟล์ PSD และซิงก์งานข้ามมือถือ-คอมพิวเตอร์ด้วย Google Drive ส่วนตัวของคุณ
          </p>
          <div class="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
            <el-button type="warning" size="large" class="font-bold shadow" @click="createBlankDesign">
              ➕ สร้างงานใหม่
            </el-button>
            <el-button size="large" class="font-bold" @click="importDesign">
              📂 นำเข้าไฟล์ PSD / SVG
            </el-button>
            <el-button v-if="!userProfile" type="success" size="large" class="font-bold" @click="handleLoginGoogle">
              ☁️ ซิงก์ Google Drive
            </el-button>
          </div>
        </div>
      </div>

      <!-- Recent Projects Section -->
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span>☁️</span> งานใน Google Drive ของคุณ
            </h2>
            <p class="text-xs text-slate-500">บันทึกอัตโนมัติในโฟลเดอร์ Volleyball Design Projects ใน Google Drive ส่วนตัว</p>
          </div>
          <div v-if="userProfile" class="flex items-center gap-2">
            <el-input
              v-model="searchQuery"
              placeholder="ค้นหางาน..."
              :prefix-icon="Search"
              clearable
              class="w-56"
            />
            <el-button type="primary" plain :icon="Refresh" @click="fetchDriveProjects">
              รีเฟรช
            </el-button>
          </div>
        </div>

        <!-- Not Logged In Promo Banner -->
        <div v-if="!userProfile" class="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            ☁️
          </div>
          <div class="space-y-1">
            <h3 class="text-lg font-bold text-slate-800">เชื่อมต่อ Google Drive เพื่อดูรายการงานของคุณ</h3>
            <p class="text-xs text-slate-500 max-w-md mx-auto">
              เข้าสู่ระบบด้วยบัญชี Google เพื่อเปิดแก้ไขงานเดิม ทำงานต่อข้ามมือถือและคอมพิวเตอร์ได้ทุกที่ฟรี 100%
            </p>
          </div>
          <el-button type="primary" size="large" class="font-bold" @click="handleLoginGoogle">
            เข้าสู่ระบบด้วย Google
          </el-button>
        </div>

        <!-- Logged In Projects View -->
        <div v-else v-loading="loadingDrive">
          <div v-if="driveError" class="bg-white rounded-xl border border-red-200 p-8 text-center space-y-3">
            <div class="text-sm text-red-500">{{ driveError }}</div>
            <el-button type="primary" size="small" @click="fetchDriveProjects">ลองใหม่อีกครั้ง</el-button>
          </div>

          <div v-else-if="filteredProjects.length === 0 && !loadingDrive" class="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <el-empty :description="searchQuery ? 'ไม่พบงานที่ค้นหา' : 'ยังไม่มีงานที่บันทึกใน Google Drive'">
              <template #extra>
                <el-button type="primary" @click="createBlankDesign">เริ่มสร้างงานแรกของคุณ</el-button>
              </template>
            </el-empty>
          </div>

          <!-- Grid Cards -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="item in filteredProjects"
              :key="item.id"
              class="project-card bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-500 transition-all cursor-pointer flex flex-col"
              @click="openProjectInEditor(item.id)"
            >
              <!-- Thumbnail Box -->
              <div class="relative w-full h-40 bg-slate-100 flex items-center justify-center overflow-hidden group">
                <img v-if="item.thumbnailUrl" :src="item.thumbnailUrl" class="w-full h-full object-contain" alt="Thumbnail" />
                <div v-else class="text-slate-400">
                  <el-icon :size="36"><Document /></el-icon>
                </div>
                <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <el-button type="primary" round class="font-bold">เปิดแก้ไข</el-button>
                </div>
              </div>

              <!-- Card Content -->
              <div class="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 class="font-bold text-sm text-slate-800 truncate" :title="item.name">{{ item.name }}</h4>
                  <div class="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>{{ item.modifiedTime }}</span>
                    <span>{{ item.size }}</span>
                  </div>
                </div>

                <!-- Card Actions -->
                <div class="pt-2 border-t border-slate-100 flex justify-between items-center" @click.stop>
                  <el-button type="primary" size="small" text @click="openProjectInEditor(item.id)">
                    เปิดแก้ไข
                  </el-button>
                  <el-popconfirm
                    title="ลบงานนี้จาก Google Drive?"
                    confirm-button-text="ลบ"
                    cancel-button-text="ยกเลิก"
                    confirm-button-type="danger"
                    @confirm="handleDeleteProject(item.id)"
                  >
                    <template #reference>
                      <el-button type="danger" size="small" text>
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Refresh, Document, Delete, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'
import {
  getAccessToken,
  getGoogleUserProfile,
  logoutGoogleDrive,
  listDriveProjects,
  deleteDriveProject,
  GoogleUserProfile,
  DriveProject,
} from '@/utils/googleDrive'

const router = useRouter()

const userProfile = ref<GoogleUserProfile | null>(null)
const loadingDrive = ref(false)
const driveError = ref('')
const searchQuery = ref('')
const driveProjects = ref<DriveProject[]>([])

const filteredProjects = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return driveProjects.value
  return driveProjects.value.filter(p => p.name.toLowerCase().includes(q))
})

onMounted(async () => {
  userProfile.value = getGoogleUserProfile()
  if (userProfile.value) {
    await fetchDriveProjects()
  } else {
    // ลองขอ silent token ในกรณีที่เคยล็อกอินไว้
    try {
      const token = await getAccessToken(undefined, 'none')
      if (token) {
        userProfile.value = getGoogleUserProfile()
        await fetchDriveProjects()
      }
    } catch (e) {}
  }
})

const goHome = () => {
  router.push('/home')
}

const handleLoginGoogle = async () => {
  try {
    const token = await getAccessToken(undefined, '')
    if (token) {
      userProfile.value = getGoogleUserProfile()
      ElMessage.success('เข้าสู่ระบบด้วย Google สำเร็จ')
      await fetchDriveProjects()
    }
  } catch (err: any) {
    ElMessage.error(err.message || 'การเข้าสู่ระบบล้มเหลว')
  }
}

const handleLogout = () => {
  logoutGoogleDrive()
  userProfile.value = null
  driveProjects.value = []
  ElMessage.info('ออกจากระบบเรียบร้อยแล้ว')
}

const fetchDriveProjects = async () => {
  loadingDrive.value = true
  driveError.value = ''
  try {
    driveProjects.value = await listDriveProjects()
  } catch (err: any) {
    driveError.value = err.message || 'ไม่สามารถดึงรายการงานจาก Google Drive ได้'
  } finally {
    loadingDrive.value = false
  }
}

const createBlankDesign = () => {
  router.push('/')
}

const importDesign = () => {
  router.push('/?import=1')
}

const openProjectInEditor = (fileId: string) => {
  router.push(`/?driveFileId=${fileId}`)
}

const handleDeleteProject = async (fileId: string) => {
  loadingDrive.value = true
  try {
    await deleteDriveProject(fileId)
    driveProjects.value = driveProjects.value.filter(p => p.id !== fileId)
    ElMessage.success('ลบไฟล์จาก Google Drive เรียบร้อยแล้ว')
  } catch (err: any) {
    ElMessage.error(err.message || 'ไม่สามารถลบไฟล์ได้')
  } finally {
    loadingDrive.value = false
  }
}
</script>

<style lang="scss" scoped>
.home-page {
  font-family: inherit;
}
</style>
