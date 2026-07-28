<template>
  <el-config-provider :locale="elementLocale">
    <router-view />
  </el-config-provider>
</template>

<script lang="ts" setup>
import { computed, unref } from 'vue'
import useI18n from '@/hooks/useI18n'
import el_th from 'element-plus/dist/locale/th.mjs'
import el_en from 'element-plus/dist/locale/en.mjs'
import el_zh from 'element-plus/dist/locale/zh-cn.mjs'

const { locale: lang } = useI18n()

const elementLocaleMap: Record<string, any> = {
  th: el_th,
  en: el_en,
  zh: el_zh,
}

const elementLocale = computed(() => {
  const key = String(unref(lang) || 'th')
  return elementLocaleMap[key] || el_th
})

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  ;(window as any).deferredPrompt = e
})
</script>

<style lang="scss">
#app {
  height: 100%;
}
</style>
<style scoped>
:deep(#app .el-divider .el-divider--horizontal) {
  margin: 12px 0;
}
</style>
