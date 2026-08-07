<template>
  <div class="vb-pool">
    <div class="section-title">ทีมตัวอย่าง</div>
    <div class="team-list">
      <div
        v-for="team in teams"
        :key="team.id"
        class="team-item"
        :style="{ borderLeftColor: team.color }"
        @click="insertTeamName(team.name)"
      >
        <span class="dot" :style="{ background: team.color }" />
        <div>
          <div class="name">{{ team.name }}</div>
          <div class="short">{{ team.shortName }} · คลิกเพื่อใส่ข้อความ</div>
        </div>
      </div>
    </div>

    <div class="section-title mt">นักกีฬาตัวอย่าง</div>
    <div class="player-list">
      <div
        v-for="p in players"
        :key="p.id"
        class="player-item"
        @click="insertPlayer(p)"
      >
        <span class="num">{{ String(p.number).padStart(2, '0') }}</span>
        <div>
          <div class="name">{{ p.name }}</div>
          <div class="short">{{ p.position }}</div>
        </div>
      </div>
    </div>

    <div class="tip">
      แก้ข้อมูลจริงได้ที่
      <code>public/assets/volleyball/</code>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import useHandleCreate from '@/hooks/useHandleCreate'
import { ElMessage } from 'element-plus'

type Team = { id: string; name: string; shortName: string; color: string }
type Player = { id: string; name: string; number: number; position: string; teamId: string }

const teams = ref<Team[]>([])
const players = ref<Player[]>([])
const { createTextElement } = useHandleCreate()

onMounted(async () => {
  try {
    const [tRes, pRes] = await Promise.all([
      fetch('/assets/volleyball/teams.json'),
      fetch('/assets/volleyball/players.json'),
    ])
    teams.value = await tRes.json()
    players.value = await pRes.json()
  } catch (e) {
    console.warn('volleyball assets load failed', e)
  }
})

const insertTeamName = (name: string) => {
  createTextElement(36, 'transverse', false, name)
  ElMessage.success(`เพิ่มข้อความ: ${name}`)
}

const insertPlayer = (p: Player) => {
  createTextElement(32, 'transverse', false, `${p.number} ${p.name} · ${p.position}`)
  ElMessage.success(`เพิ่ม: ${p.name}`)
}
</script>

<style lang="scss" scoped>
.vb-pool {
  padding: 12px 10px 40px;
  height: 100%;
  overflow-y: auto;
}
.section-title {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #0f172a;
  &.mt {
    margin-top: 18px;
  }
}
.team-item,
.player-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  border-left-width: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  background: #fff;
  &:hover {
    background: #f8fafc;
  }
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}
.num {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #0f172a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}
.name {
  font-size: 13px;
  font-weight: 600;
}
.short {
  font-size: 11px;
  color: #64748b;
}
.tip {
  margin-top: 16px;
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.5;
  code {
    font-size: 10px;
  }
}
</style>
