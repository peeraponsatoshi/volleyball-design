<template>
  <el-dialog
    v-model="dialogVisible"
    title="☁️ งานใน Google Drive ของคุณ"
    width="50%"
    class="drive-modal"
    :before-close="handleClose"
  >
    <div class="drive-container" v-loading="loading">
      <div v-if="errorMsg" class="error-box">
        <el-alert :title="errorMsg" type="error" show-icon :closable="false" />
        <el-button class="mt-3" type="primary" @click="fetchProjects">ลองใหม่อีกครั้ง</el-button>
      </div>

      <div v-else-if="projects.length === 0 && !loading" class="empty-box">
        <el-empty description="ยังไม่มีงานที่บันทึกไว้ใน Google Drive">
          <template #extra>
            <span class="text-gray-500 text-sm">เมื่อคุณกด "บันทึกไปที่ Google Drive" งานของคุณจะมาปรากฏที่นี่ทันที</span>
          </template>
        </el-empty>
      </div>

      <div v-else class="project-grid">
        <div v-for="item in projects" :key="item.id" class="project-card">
          <div class="thumb-wrapper" @click="openProject(item)">
            <img v-if="item.thumbnailUrl" :src="item.thumbnailUrl" class="thumb-img" alt="Thumbnail" />
            <div v-else class="no-thumb">
              <el-icon :size="32"><Document /></el-icon>
            </div>
            <div class="hover-overlay">
              <el-button type="primary" size="small" round>เปิดแก้ไข</el-button>
            </div>
          </div>
          <div class="card-info">
            <div class="project-title" :title="item.name">{{ item.name }}</div>
            <div class="project-meta">
              <span>{{ item.modifiedTime }}</span>
              <span v-if="item.size" class="text-xs text-gray-400">({{ item.size }})</span>
            </div>
            <div class="card-actions">
              <el-button type="primary" size="small" text @click="openProject(item)">
                เปิดแก้
              </el-button>
              <el-popconfirm
                title="ต้องการลบงานนี้ออกจาก Google Drive ใช่หรือไม่?"
                confirm-button-text="ลบ"
                cancel-button-text="ยกเลิก"
                confirm-button-type="danger"
                @confirm="removeProject(item.id)"
              >
                <template #reference>
                  <el-button type="danger" size="small" text>ลบ</el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer flex justify-between items-center">
        <div class="text-xs text-gray-400">
          * ข้อมูลบันทึกอยู่ในโฟลเดอร์ Volleyball Design Projects ใน Google Drive ส่วนตัวของคุณ
        </div>
        <div>
          <el-button @click="handleClose">ปิด</el-button>
          <el-button type="primary" :icon="Refresh" @click="fetchProjects">รีเฟรช</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Document, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { listDriveProjects, loadDriveProject, deleteDriveProject, DriveProject } from '@/utils/googleDrive'
import useHandleTemplate from '@/hooks/useHandleTemplate'
import useCanvasScale from '@/hooks/useCanvasScale'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'opened', fileId: string, fileName: string): void
}>()

const { addTemplate } = useHandleTemplate()
const { setCanvasTransform } = useCanvasScale()

const dialogVisible = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const projects = ref<DriveProject[]>([])

watch(
  () => props.visible,
  val => {
    dialogVisible.value = val
    if (val) {
      fetchProjects()
    }
  },
)

const handleClose = () => {
  emit('close')
}

const fetchProjects = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    projects.value = await listDriveProjects()
  } catch (err: any) {
    errorMsg.value = err.message || 'ไม่สามารถเชื่อมต่อกับ Google Drive ได้'
  } finally {
    loading.value = false
  }
}

const openProject = async (item: DriveProject) => {
  loading.value = true
  try {
    const template = await loadDriveProject(item.id)
    await addTemplate(template)
    setCanvasTransform()
    ElMessage.success(`เปิดงาน "${item.name}" สำเร็จ`)
    emit('opened', item.id, item.name)
    handleClose()
  } catch (err: any) {
    ElMessage.error(err.message || 'เปิดงานไม่สำเร็จ')
  } finally {
    loading.value = false
  }
}

const removeProject = async (fileId: string) => {
  loading.value = true
  try {
    await deleteDriveProject(fileId)
    projects.value = projects.value.filter(p => p.id !== fileId)
    ElMessage.success('ลบไฟล์ออกจาก Google Drive สำเร็จ')
  } catch (err: any) {
    ElMessage.error(err.message || 'ไม่สามารถลบไฟล์ได้')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.drive-container {
  min-height: 250px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px 5px;
}
.error-box, .empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.project-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: all 0.2s ease;
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: #409eff;
  }
}
.thumb-wrapper {
  position: relative;
  width: 100%;
  height: 120px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  .thumb-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .no-thumb {
    color: #909399;
  }
  .hover-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
  }
  &:hover .hover-overlay {
    opacity: 1;
  }
}
.card-info {
  padding: 10px;
}
.project-title {
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #303133;
}
.project-meta {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
}
.card-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  border-top: 1px dashed #ebeef5;
  padding-top: 6px;
}
</style>
