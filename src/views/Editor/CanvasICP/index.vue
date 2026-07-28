<template>
  <div class="absolute bottom-[5px] text-[12px] icp">
    {{ t('message.projectFooter') }}
  </div>
</template>

<script lang="ts" setup>
import useI18n from '@/hooks/useI18n'
const { t } = useI18n()
</script>

<style lang="scss" scoped>
.icp {
  width: calc(100% - 260px - 50px - 160px);
  display: flex;
  justify-content: center;
  opacity: 0.75;
  a:hover {
    text-decoration: underline;
  }
}
</style>
