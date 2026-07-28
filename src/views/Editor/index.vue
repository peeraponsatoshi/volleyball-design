<template>
  <el-config-provider :locale="elementLocale">
    <Computer v-if="!isMobile()" />
    <Mobile v-else />
  </el-config-provider>
</template>

<script lang="ts" setup>

import Computer from '@/views/Editor/computer.vue'
import Mobile from '@/views/Editor/mobile.vue'
import useI18n from '@/hooks/useI18n'
import { useMainStore, useSnapshotStore } from '@/store'
import { storeToRefs } from 'pinia'
import { isMobile } from '@/utils/common'
import { LocalStorageDiscardedKey } from '@/configs/canvas'
import { deleteDiscardedDB } from '@/utils/database'
import { computed, unref } from 'vue'
import el_th from 'element-plus/dist/locale/th.mjs'
import el_en from 'element-plus/dist/locale/en.mjs'
import el_zh from 'element-plus/dist/locale/zh-cn.mjs'

const { locale: lang } = useI18n()
const { databaseId } = storeToRefs(useMainStore())
const elementLocaleMap: Record<string, any> = { th: el_th, en: el_en, zh: el_zh }
const elementLocale = computed(() => elementLocaleMap[String(unref(lang) || 'th')] || el_th)
if (import.meta.env.MODE === 'production') {
  window.onbeforeunload = () => false
}

const snapshotStore = useSnapshotStore()
// const mainStore = useMainStore()

onMounted(async () => {
  await deleteDiscardedDB()
  // await snapshotStore.initSnapshotDatabase()
  // mainStore.getFonts()
})

// 应用注销时向 localStorage 中记录下本次 indexedDB 的数据库ID，用于之后清除数据库
window.addEventListener('unload', () => {
  const discardedDB = localStorage.getItem(LocalStorageDiscardedKey)
  const discardedDBList: string[] = discardedDB ? JSON.parse(discardedDB) : []
  discardedDBList.push(databaseId.value)
  const newDiscardedDB = JSON.stringify(discardedDBList)
  localStorage.setItem(LocalStorageDiscardedKey, newDiscardedDB)
})
</script>
