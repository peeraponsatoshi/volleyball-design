<template>
  <el-dialog v-model="dialogVisible" width="35%" class="export-dialog" :before-close="closeExport">
    <div class="export-dialog">
      <div class="tabs">
        <div 
          class="tab" 
          :class="{ 'active': tab.key === exportType }"
          v-for="tab in tabs" 
          :key="tab.key"
          @click="setExportType(tab.key)"
        >{{ tab.label }}</div>
      </div>
      <div class="content">
        <component :is="currentDialogComponent" @close="closeExport"></component>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store'
import { ExportTypes } from '@/types/common'
import useI18n from '@/hooks/useI18n'

import ExportImage from './ExportImage.vue'
import ExportSVG from './ExportSVG.vue'
import ExportPDF from './ExportPDF.vue'
import ExportPSD from './ExportPSD.vue'
import ExportJSON from './ExportJSON.vue'

const mainStore = useMainStore()
const { exportType } = storeToRefs(mainStore)
const dialogVisible = ref(false)
const setExportType = mainStore.setExportType
const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits<{
  (event: 'close'): void
}>()

watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

interface TabItem {
  key: ExportTypes
  label: string
}

const tabs = computed<TabItem[]>(() => [
  { key: 'image', label: t('message.exportImages') },
  { key: 'svg', label: t('message.exportSVG') },
  { key: 'pdf', label: t('message.exportPDF') },
  { key: 'json', label: t('message.exportJSON') },
])

const currentDialogComponent = computed(() => {
  const dialogMap = {
    'image': ExportImage,
    'svg': ExportSVG,
    'pdf': ExportPDF,
    'psd': ExportPSD,
    'json': ExportJSON,
    '': '',
  }
  return dialogMap[exportType.value] || null
})

const closeExport = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
.tabs {
  height: 50px;
  font-size: 12px;
  flex-shrink: 0;
  display: flex;
  user-select: none;
  border-top-left-radius: $borderRadius;
  border-top-right-radius: $borderRadius;
  overflow: hidden;
}
.tab {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $lightGray;
  border-bottom: 1px solid $borderColor;
  cursor: pointer;
  &:not(:last-child) {
    border-right: 1px solid $borderColor;
  }
  &.active {
    background-color: #fff;
    border-bottom-color: transparent;
    font-weight: 600;
  }
}
.content {
  height: 420px;
  padding: 20px;
  overflow: auto;
}
</style>
