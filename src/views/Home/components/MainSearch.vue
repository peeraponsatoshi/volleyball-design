<template>
  <el-row :gutter="20" class="h-[100px] flex items-center row-home">
    <el-col :span="10" :offset="7">
      <el-input class="h-[40px]" :prefix-icon="Search" placeholder="ค้นหาเทมเพลต...">
        <template #append>
          <el-select v-model="searchSelect" placeholder="เลือก">
            <el-option label="เทมเพลตแนะนำ" value="1" />
            <el-option label="พื้นที่ของฉัน" value="2" />
          </el-select>
        </template>
      </el-input>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
const searchSelect = ref<string>('1')
</script>