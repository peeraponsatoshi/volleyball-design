<template>
  <div class="vb-templates">
    <div class="header-section">
      <div class="title-row flex justify-between items-center">
        <span class="font-bold text-sm text-gray-700">☁️ งานใน Google Drive</span>
        <el-button type="primary" size="small" text :icon="Refresh" @click="fetchDriveProjects">
          รีเฟรช
        </el-button>
      </div>
      <el-input
        v-model="keyword"
        :prefix-icon="Search"
        placeholder="ค้นหางานของคุณ..."
        clearable
        class="mt-2"
      />
    </div>

    <div class="my-drive-container" v-loading="loadingDrive">
      <div v-if="driveError" class="error-box">
        <div class="text-xs text-red-500 mb-2">{{ driveError }}</div>
        <el-button type="primary" size="small" @click="fetchDriveProjects">ลองใหม่อีกครั้ง</el-button>
      </div>

      <div v-else-if="filteredProjects.length === 0 && !loadingDrive" class="empty-box">
        <el-empty :description="keyword ? 'ไม่พบงานที่ค้นหา' : 'ยังไม่มีงานใน Google Drive'">
          <template #extra>
            <div class="text-xs text-gray-400">
              กดปุ่ม <b>☁️ Drive → บันทึก</b> ด้านบนเพื่อเก็บงานเข้าไดฟ์
            </div>
          </template>
        </el-empty>
      </div>

      <div v-else class="drive-grid">
        <div
          v-for="item in filteredProjects"
          :key="item.id"
          class="drive-card"
          @click="handleOpenDriveProject(item)"
        >
          <div class="thumb-box">
            <img v-if="item.thumbnailUrl" :src="item.thumbnailUrl" class="thumb-img" alt="Thumbnail" />
            <div v-else class="no-thumb">
              <el-icon :size="28"><Document /></el-icon>
            </div>
            <div class="overlay">
              <el-button type="primary" size="small" round>เปิดแก้ไข</el-button>
            </div>
          </div>
          <div class="card-body">
            <div class="title" :title="item.name">{{ item.name }}</div>
            <div class="sub flex justify-between items-center">
              <span>{{ item.modifiedTime }}</span>
              <el-popconfirm
                title="ลบงานนี้จาก Google Drive?"
                confirm-button-text="ลบ"
                cancel-button-text="ยกเลิก"
                confirm-button-type="danger"
                @confirm.stop="handleDeleteDriveProject(item.id)"
              >
                <template #reference>
                  <el-button
                    type="danger"
                    size="small"
                    text
                    class="delete-btn"
                    @click.stop
                  >
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
</template>

<script lang="ts" setup>
import { Search, Refresh, Document, Delete } from '@element-plus/icons-vue'
import { computed, ref, onMounted } from 'vue'
import { useTemplatesStore } from '@/store'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { nextTick } from 'vue'
import { listDriveProjects, loadDriveProject, deleteDriveProject, DriveProject } from '@/utils/googleDrive'
import useCanvasScale from '@/hooks/useCanvasScale'

const templatesStore = useTemplatesStore()
const { setCanvasTransform } = useCanvasScale()

const keyword = ref('')
const loadingDrive = ref(false)
const driveError = ref('')
const driveProjects = ref<DriveProject[]>([])

const filteredProjects = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return driveProjects.value
  return driveProjects.value.filter(p => p.name.toLowerCase().includes(q))
})

onMounted(() => {
  fetchDriveProjects()
})

const fetchDriveProjects = async () => {
  loadingDrive.value = true
  driveError.value = ''
  try {
    driveProjects.value = await listDriveProjects()
  } catch (err: any) {
    driveError.value = err.message || 'ไม่สามารถดึงรายการจาก Google Drive ได้'
  } finally {
    loadingDrive.value = false
  }
}

const handleOpenDriveProject = (item: DriveProject) => {
  ElMessageBox.confirm(`ต้องการดึงงาน「${item.name}」มาแก้ไขบนแคนวาสหรือไม่?`, 'ยืนยันเปิดงาน', {
    confirmButtonText: 'เปิดแก้ไข',
    cancelButtonText: 'ยกเลิก',
    type: 'info',
  })
    .then(async () => {
      const loadingInstance = ElLoading.service({
        fullscreen: true,
        background: 'rgba(0, 0, 0, 0.6)',
        text: 'กำลังโหลดงานจาก Google Drive...',
      })
      try {
        const templateData = await loadDriveProject(item.id)
        await templatesStore.changeTemplate(templateData)
        await nextTick()
        setCanvasTransform()
        ElMessage({ type: 'success', message: `เปิดงาน「${item.name}」สำเร็จ` })
      } catch (e: any) {
        console.error(e)
        ElMessage({ type: 'error', message: e.message || 'โหลดงานไม่สำเร็จ' })
      } finally {
        loadingInstance.close()
      }
    })
    .catch(() => {})
}

const handleDeleteDriveProject = async (fileId: string) => {
  loadingDrive.value = true
  try {
    await deleteDriveProject(fileId)
    driveProjects.value = driveProjects.value.filter(p => p.id !== fileId)
    ElMessage.success('ลบงานออกจาก Google Drive สำเร็จ')
  } catch (err: any) {
    ElMessage.error(err.message || 'ไม่สามารถลบไฟล์ได้')
  } finally {
    loadingDrive.value = false
  }
}
</script>

<style lang="scss" scoped>
.vb-templates {
  padding: 12px 10px;
}
.header-section {
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}
.my-drive-container {
  height: calc(100vh - 160px);
  overflow-y: auto;
  padding: 10px 2px 40px;
}
.error-box, .empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  text-align: center;
}
.drive-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.drive-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
}
.thumb-box {
  position: relative;
  width: 100%;
  height: 130px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  .thumb-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .no-thumb {
    color: #94a3b8;
  }
  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  &:hover .overlay {
    opacity: 1;
  }
}
.card-body {
  padding: 8px 10px;
}
.card-body .title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-body .sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
}
.delete-btn {
  padding: 2px 4px;
}
</style>
