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
    <el-tabs v-model="activeTab" class="layout-tabs">
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
      <el-tab-pane :label="$t('message.myTemp')" name="self">
        <div class="hint">
          บันทึกงานด้วยเมนู <b>ดาวน์โหลด → JSON</b> แล้วอัปโหลดกลับเมื่อต้องการ
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('message.teamTemp')" name="team">
        <div class="hint">เทมเพลตทีม: ใช้ชุดแนะนำด้านบน หรือ export JSON แชร์ในทีม</div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { Search } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useTemplatesStore } from '@/store'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { VolleyballTemplateCatalog } from '@/mocks/volleyballTemplates'
import { nextTick } from 'vue'

const templatesStore = useTemplatesStore()
const activeTab = ref('data')
const keyword = ref('')

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
        // Deep clone so edits don't mutate catalog
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
</style>
