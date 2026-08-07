<template>
  <div class="h-full flex flex-col w-full">
    <div class="right-top">
      <div class="flex align-middle px-[8px]">
        <Lang />
      </div>
      <div class="flex items-center">
        <el-dropdown trigger="click" class="mr-1">
          <el-button type="success" plain size="small">
            ☁️ Drive <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleSaveToDrive">
                💾 บันทึกไปที่ Google Drive
              </el-dropdown-item>
              <el-dropdown-item @click="openDriveModal">
                📂 เปิดงานจาก Google Drive
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button text>{{ t('message.share') }}</el-button>
        <el-button type="primary" @click="exportFile">{{ t('message.download') }}</el-button>
        <el-button text href="https://github.com/dromara/yft-design" tag="a" target="_blank" rel="noopener noreferrer">
          <!-- <a href="https://github.com/dromara/yft-design" target="_blank" rel="noopener noreferrer"> -->
            <!-- <el-tooltip placement="top" :hide-after="0" :content="t('message.github')"> -->
            <IconGithub class="footer-button"></IconGithub>
            <!-- </el-tooltip> -->
          <!-- </a> -->
        </el-button>
      </div>
    </div>
    <div class="right-bottom">
      <div class="right-tabs">
        <div
          class="tab"
          :class="[ tab.value === rightState && currentTabs.length > 1 ? 'active' : 'no-active' ]"
          v-for="tab in currentTabs"
          :key="tab.value"
          @click="setRightState(tab.value)"
        >
          {{ tab.label }}
        </div>
      </div>
      <div class="right-content">
        <component :is="currentPanelComponent"></component>
      </div>
    </div>
    <FileExport v-model:visible="exportFileDialog" @close="exportFileHide" @save="exportFileHandle" />
    <GoogleDriveModal :visible="driveModalVisible" @close="driveModalVisible = false" @opened="handleDriveOpened" />
  </div>
</template>
<script lang="ts" setup>
import { computed, watch } from "vue";
import { RightStates, ElementNames } from "@/types/elements";
import { storeToRefs } from "pinia";
import { useMainStore } from "@/store/modules/main";
import Lang from "@/components/Lang/index.vue";
import CanvasStylePanel from "./CanvasStylePanel/index.vue";
import ElemnetStylePanel from "./ElementStylePanel/index.vue";
import EffectStylePanel from "./EffectStylePanel/index.vue";
import LayerStylePanel from "./LayerStylePanel/index.vue";
import { ArrowDown } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import GoogleDriveModal from "@/components/GoogleDriveModal/index.vue";
import { saveProjectToDrive } from "@/utils/googleDrive";
import { useTemplatesStore } from "@/store";
import useCanvas from "@/views/Canvas/useCanvas";

const { t } = useI18n();

const mainStore = useMainStore();
const templatesStore = useTemplatesStore();
const { canvasObject, rightState } = storeToRefs(mainStore);
const exportFileDialog = ref(false);
const driveModalVisible = ref(false);
const currentDriveFileId = ref<string | undefined>(undefined);
const currentProjectName = ref<string>("งานวอลเลย์บอล");

const openDriveModal = () => {
  driveModalVisible.value = true;
};

const handleDriveOpened = (fileId: string, fileName: string) => {
  currentDriveFileId.value = fileId;
  currentProjectName.value = fileName;
};

const handleSaveToDrive = async () => {
  const [canvas] = useCanvas();
  
  try {
    const { value: inputName } = await ElMessageBox.prompt(
      'กรุณาตั้งชื่อไฟล์สำหรับบันทึกไปที่ Google Drive',
      'บันทึกไปที่ Google Drive',
      {
        confirmButtonText: 'บันทึก',
        cancelButtonText: 'ยกเลิก',
        inputValue: currentProjectName.value,
        inputPattern: /\S+/,
        inputErrorMessage: 'กรุณาใส่ชื่อไฟล์',
      }
    );

    const name = inputName.trim();
    currentProjectName.value = name;

    const loadingInstance = ElLoading.service({
      fullscreen: true,
      text: 'กำลังบันทึกงานไปที่ Google Drive...',
      background: 'rgba(0, 0, 0, 0.6)',
    });

    try {
      const thumbnailDataUrl = canvas.toDataURL({ format: 'png', quality: 0.5, multiplier: 0.25 });
      const currentTemplate = JSON.parse(JSON.stringify(templatesStore.currentTemplate));
      
      const res = await saveProjectToDrive(
        currentTemplate,
        name,
        thumbnailDataUrl,
        currentDriveFileId.value
      );

      currentDriveFileId.value = res.fileId;
      ElMessage.success(`บันทึกงาน "${res.name}" ไปที่ Google Drive สำเร็จ!`);
    } finally {
      loadingInstance.close();
    }
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(err.message || 'ไม่สามารถบันทึกไปที่ Google Drive ได้');
    }
  }
};


const exportFileHide = () => {
  exportFileDialog.value = false
}

const exportFileHandle = () => {
  exportFileDialog.value = false
}

const exportFile = () => {
  exportFileDialog.value = true
}

const canvasTabs = [
  { label: t("style.canvas"), value: RightStates.ELEMENT_CANVAS },
  { label: t("style.layer"), value: RightStates.ELEMENT_LAYER },
];
const styleTabs = [
  { label: t("style.style"), value: RightStates.ELEMENT_STYLE },
  { label: t("style.layer"), value: RightStates.ELEMENT_LAYER },
];

const setRightState = (value: RightStates) => {
  mainStore.setRightState(value);
};

const currentTabs = computed(() => {
  if (!canvasObject.value) return canvasTabs;
  if (canvasObject.value.type.toLowerCase() === ElementNames.REFERENCELINE) return canvasTabs;
  return styleTabs;
});

watch(currentTabs, () => {
  const currentTabsValue: RightStates[] = currentTabs.value.map(
    (tab) => tab.value
  );
  if (!currentTabsValue.includes(rightState.value)) {
    mainStore.setRightState(currentTabsValue[0]);
  }
});

const currentPanelComponent = computed(() => {
  const panelMap = {
    [RightStates.ELEMENT_CANVAS]: CanvasStylePanel,
    [RightStates.ELEMENT_STYLE]: ElemnetStylePanel,
    [RightStates.ELEMENT_EFFECT]: EffectStylePanel,
    [RightStates.ELEMENT_LAYER]: LayerStylePanel,
  };
  return panelMap[rightState.value as RightStates.ELEMENT_STYLE];
});
</script>


<style lang="scss" scoped>
.right-top {
  height: 40px;
  width: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  border-bottom: 1px solid $borderColor;
}
.right-top .el-button {
  height: 32px;
  margin: 0;
}
.right-bottom {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.right-tabs {
  height: 32px;
  font-size: 12px;
  flex-shrink: 0;
  display: flex;
  user-select: none;
}
.tab {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $lightGray;
  border-bottom: 1px solid $borderColor;
  cursor: pointer;

  &.active {
    background-color: #fff;
    border-bottom-color: #fff;
  }

  & + .tab {
    border-left: 1px solid $borderColor;
  }
}
.right-content {
  padding: 10px 5px 10px 10px;
  font-size: 13px;
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
  min-height: 0;
  // @include overflow-overlay();
}
</style>