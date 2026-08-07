<template>
  <div class="vb-templates">
    <el-row class="layout-search">
      <el-input
        v-model="keyword"
        :prefix-icon="Search"
        :placeholder="$t('message.searchTemp')"
        clearable
      />
    </el-row>
    <el-tabs v-model="activeTab" class="layout-tabs" @tab-change="handleTabChange">
      <el-tab-pane :label="$t('message.recommendTemp')" name="data">
        <div class="layout-templates">
          <div
            v-for="item in filtered"
            :key="item.id"
            class="thumbnail"
            @click="handleChangeTemplate(item)"
          >
            <div class="card" :style="{ background: item.color }">
              <div class="card-name">{{ item.name }}</div>
              <div class="card-desc">{{ item.desc }}</div>
              <div class="card-size">{{ item.size }}</div>
            </div>
          </div>
          <div v-if="!filtered.length" class="empty">{{ $t('message.endOfContent') }}</div>
        </div>
      </el-tab-pane>

      <!-- แท็บงานของฉัน (ซิงก์กับ Google Drive) -->
      <el-tab-pane :label="$t('message.myTemp') + ' (Drive)'" name="self">
        <div class="my-drive-container" v-loading="loadingDrive">
          <div class="flex justify-between items-center mb-2 px-1">
            <span class="text-xs text-gray-500">งานที่คุณบันทึกไว้ใน Google Drive</span>
            <el-button type="primary" size="small" text :icon="Refresh" @click="fetchDriveProjects">
              รีเฟรช
            </el-button>
          </div>

          <div v-if="driveError" class="error-box">
            <div class="text-xs text-red-500 mb-2">{{ driveError }}</div>
            <el-button type="primary" size="small" @click="fetchDriveProjects">ลองใหม่อีกครั้ง</el-button>
          </div>

          <div v-else-if="driveProjects.length === 0 && !loadingDrive" class="empty-box">
            <el-empty description="ยังไม่มีงานใน Google Drive">
              <template #extra>
                <div class="text-xs text-gray-400">
                  กดปุ่ม <b>☁️ Drive → บันทึก</b> ด้านบนเพื่อเก็บงานเข้าไดฟ์
                </div>
              </template>
            </el-empty>
          </div>

          <div v-else class="drive-grid">
            <div
              v-for="item in driveProjects"
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
      </el-tab-pane>

      <el-tab-pane :label="$t('message.teamTemp')" name="team">
        <div class="hint">เทมเพลตทีม: ใช้ชุดแนะนำด้านบน หรือ export JSON แชร์ในทีม</div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { Search, Refresh, Document, Delete } from '@element-plus/icons-vue'
import { computed, ref, onMounted } from 'vue'
import { useTemplatesStore } from '@/store'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { VolleyballTemplateCatalog } from '@/mocks/volleyballTemplates'
import { nextTick } from 'vue'
import { listDriveProjects, loadDriveProject, deleteDriveProject, DriveProject } from '@/utils/googleDrive'
import useCanvasScale from '@/hooks/useCanvasScale'

const templatesStore = useTemplatesStore()
const { setCanvasTransform } = useCanvasScale()

const activeTab = ref('data')
const keyword = ref('')
const loadingDrive = ref(false)
const driveError = ref('')
const driveProjects = ref<DriveProject[]>([])

const filtered = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return VolleyballTemplateCatalog
  return VolleyballTemplateCatalog.filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      i.desc.toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q)
  )
})

const handleTabChange = (tabName: any) => {
  if (tabName === 'self') {
    fetchDriveProjects()
  }
}

onMounted(() => {
  if (activeTab.value === 'self') {
    fetchDriveProjects()
  }
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

const handleChangeTemplate = (item: (typeof VolleyballTemplateCatalog)[0]) => {
  ElMessageBox.confirm('ต้องการใช้เทมเพลตนี้แทนงานปัจจุบันหรือไม่?', 'ยืนยัน', {
    confirmButtonText: 'ใช้เทมเพลต',
    cancelButtonText: 'ยกเลิก',
    type: 'warning',
  })
    .then(async () => {
      const loadingInstance = ElLoading.service({
        fullscreen: true,
        background: 'rgba(122, 122, 122, 0.5)',
        text: 'กำลังโหลดเทมเพลต...',
      })
      try {
        const data = JSON.parse(JSON.stringify(item.template))
        await templatesStore.changeTemplate(data)
        await nextTick()
        ElMessage({ type: 'success', message: `ใช้เทมเพลต「${item.name}」แล้ว` })
      } catch (e) {
        console.error(e)
        ElMessage({ type: 'error', message: 'โหลดเทมเพลตไม่สำเร็จ' })
      } finally {
        loadingInstance.close()
      }
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
.layout-search {
  margin: 0 auto;
  width: 90%;
  padding: 16px 8px 8px;
}
.layout-tabs {
  width: 94%;
  margin: 0 auto;
}
.layout-templates {
  overflow: auto;
  height: calc(100vh - 200px);
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 4px 2px 40px;
}
.thumbnail {
  cursor: pointer;
}
.card {
  border-radius: 10px;
  padding: 14px 16px;
  color: #fff;
  min-height: 88px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  }
}
.card-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}
.card-desc {
  font-size: 12px;
  opacity: 0.92;
}
.card-size {
  margin-top: 8px;
  font-size: 11px;
  opacity: 0.8;
}
.hint {
  padding: 16px 8px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
}
.empty {
  text-align: center;
  color: #94a3b8;
  padding: 24px;
}

// Google Drive Tab Styles
.my-drive-container {
  height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 4px 2px 40px;
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
