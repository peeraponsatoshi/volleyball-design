<template>
  <el-dropdown trigger="click" @command="onDropdown">
    <span class="handler-dropdown">
      <el-button text><IconTranslate class="handler-icon"/></el-button>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="lang in langList"
          :key="lang.langType"
          :command="lang.langType"
        >{{ lang.langName }}</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script name="Lang" lang="ts" setup>
import useI18n from '@/hooks/useI18n'
import { ref } from 'vue'

const { changeLocale } = useI18n()

const LANGMAP: Record<string, string> = {
  th: 'ไทย',
  en: 'English',
  zh: '中文',
}

const langList = ref(
  Object.keys(LANGMAP).map((key) => ({ langType: key, langName: LANGMAP[key] }))
)

const onDropdown = (command: string) => {
  changeLocale(command)
}
</script>

<style lang="scss" scoped>
.handler-icon {
  font-size: 16px;
  width: 18px;
}
</style>
