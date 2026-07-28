<template>
  <div>
    <el-tour v-model="open" @close="closeTour()" @finish="closeTour()">
      <el-tour-step target=".left-top-tabs" title="">
        <div>{{ $t('message.tourWelcome') }}</div>
      </el-tour-step>
      <el-tour-step target="#left-tabs-editor" :title="$t('message.edit')" :description="$t('message.tourEdit')" />
      <el-tour-step target="#left-tabs-template" :title="$t('message.template')" :description="$t('message.tourTemplate')" />
      <el-tour-step target="#left-tabs-material" :title="$t('message.material')" :description="$t('message.tourMaterial')" />
      <el-tour-step target="#left-tabs-text" :title="$t('message.text')" :description="$t('message.tourText')" />
      <el-tour-step target="#left-tabs-image" :title="$t('message.image')" :description="$t('message.tourImage')" />
      <el-tour-step target="#left-tabs-toolkit" :title="$t('message.tool')" :description="$t('message.tourTool')" />
      <el-tour-step target="#left-tabs-layer" :title="$t('message.layer')" :description="$t('message.tourLayer')" />
      <el-tour-step target="#left-tabs-help" :title="$t('message.help')" :description="$t('message.tourHelp')" />
    </el-tour>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { localStorage } from "@/utils/storage";

const open = ref(localStorage.get("YFT_DESIGN_TOUR") ?? true);
const closeTour = () => {
  open.value = false;
  localStorage.set("YFT_DESIGN_TOUR", false);
};
</script>

<style lang="scss" scoped></style>
