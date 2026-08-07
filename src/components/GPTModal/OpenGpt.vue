<!--
 * @Author: June 1601745371@qq.com
 * @Date: 2024-05-18 14:34:26
 * @LastEditors: June 1601745371@qq.com
 * @LastEditTime: 2024-05-18 15:28:58
 * @FilePath: \yft-design\src\components\GPTModal\OpenGpt.vue
 * @Description: 开通GPT弹窗
-->
<template>
   <el-dialog v-model="dialogVisible" :width="500" :title="$t('gpt.openGPTTitle')"  class="upload-dialog"  :before-close="handleClose" :close-on-click-modal="false">
    <div>
      <div class="mb-[20px] text-center">ฟีเจอร์ AI กำลังพัฒนาสำหรับคอนเทนต์วอลเลย์</div>
      <div class="mb-[20px] text-center">ใช้เทมเพลตและเครื่องมือที่มีอยู่ได้ทันที</div>
      <div class="cursor-pointer text-center text-[18px] font-bold" @click="handleCopy">
        <div>
          <IconCopyOne /> คลิกเพื่อคัดลอก <IconWechat /> WeChat ID <el-tag>15972699417</el-tag> 
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ $t('default.cancel') }}</el-button>
        <el-button type="primary" @click="handleClose">
          {{ $t('default.ok') }}
        </el-button>
      </div>
    </template>
   </el-dialog>
</template>

<script lang="ts" setup>
import { debounce } from 'lodash-es'
import { copyText } from '@/utils/clipboard'
import { ElMessage } from 'element-plus'

const emits = defineEmits(['close'])
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
})
const dialogVisible = ref(false)

const handleClose = debounce(function() {
  dialogVisible.value = false
  emits('close')
}, 250)

const handleCopy = debounce(async function() {
  const result = await copyText('15972699417')
  result && ElMessage.success('คัดลอกแล้ว')
}, 250)

watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

</script>