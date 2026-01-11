<template>
  <view class="countdown" :class="{ 'is-inline': inline }">
    <text v-if="showLabel" class="countdown-label">{{ label }}</text>
    <view class="countdown-time">
      <text v-if="timeParts.hours > 0" class="countdown-item">{{ pad(timeParts.hours) }}</text>
      <text v-if="timeParts.hours > 0" class="countdown-separator">:</text>
      <text class="countdown-item">{{ pad(timeParts.minutes) }}</text>
      <text class="countdown-separator">:</text>
      <text class="countdown-item">{{ pad(timeParts.seconds) }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { decomposeCountdown } from '@/utils/countdown'

interface Props {
  endTime: number // 结束时间戳
  label?: string // 标签文本
  inline?: boolean // 是否内联显示
}

const props = withDefaults(defineProps<Props>(), {
  label: '距结束',
  inline: false
})

const showLabel = computed(() => !!props.label)
const timeParts = ref({ hours: 0, minutes: 0, seconds: 0 })
let timer: number | null = null

const updateTime = () => {
  const remaining = props.endTime - Date.now()
  if (remaining <= 0) {
    timeParts.value = { hours: 0, minutes: 0, seconds: 0 }
    stopTimer()
    return
  }
  timeParts.value = decomposeCountdown(remaining)
}

const startTimer = () => {
  stopTimer()
  updateTime()
  timer = setInterval(updateTime, 1000) as unknown as number
}

const stopTimer = () => {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})

const pad = (n: number) => n.toString().padStart(2, '0')
</script>

<style lang="scss" scoped>
.countdown {
  display: inline-flex;
  align-items: center;
  font-size: 24rpx;

  &.is-inline {
    display: inline-flex;
  }

  &-label {
    margin-right: 8rpx;
    color: #999;
  }

  &-time {
    display: inline-flex;
    align-items: center;
  }

  &-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36rpx;
    height: 36rpx;
    padding: 0 8rpx;
    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    color: #fff;
    font-size: 22rpx;
    font-weight: bold;
    border-radius: 6rpx;
  }

  &-separator {
    margin: 0 4rpx;
    color: #ff6b6b;
    font-weight: bold;
  }
}
</style>
