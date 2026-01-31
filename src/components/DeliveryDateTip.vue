<template>
  <view class="delivery-tip" :class="type">
    <text class="tip-icon">{{ icon }}</text>
    <text class="tip-text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  orderTime?: string
}>()

const icon = computed(() => '📅')

// 计算配送日期文本
const text = computed(() => {
  if (!props.orderTime) {
    // 使用当前时间
    const now = new Date()
    const hour = now.getHours()

    if (hour < 22) {
      // 0-22点：明日达
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return `预计${tomorrow.getMonth() + 1}月${tomorrow.getDate()}日送达`
    } else {
      // 22-24点：后日达
      const dayAfter = new Date(now)
      dayAfter.setDate(dayAfter.getDate() + 2)
      return `预计${dayAfter.getMonth() + 1}月${dayAfter.getDate()}日送达`
    }
  }

  const now = new Date(props.orderTime)
  const hour = now.getHours()

  if (hour < 22) {
    // 0-22点：明日达
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return `预计${tomorrow.getMonth() + 1}月${tomorrow.getDate()}日送达`
  } else {
    // 22-24点：后日达
    const dayAfter = new Date(now)
    dayAfter.setDate(dayAfter.getDate() + 2)
    return `预计${dayAfter.getMonth() + 1}月${dayAfter.getDate()}日送达`
  }
})

const type = computed(() => {
  const hour = new Date(props.orderTime || Date.now()).getHours()
  return hour < 22 ? 'next-day' : 'day-after'
})
</script>

<style lang="scss" scoped>
.delivery-tip {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;

  &.next-day {
    background: #fff9e5;
    color: #ff9800;
  }

  &.day-after {
    background: #f0f5ff;
    color: #4a90e2;
  }

  .tip-icon {
    font-size: 28rpx;
  }

  .tip-text {
    font-weight: 500;
  }
}
</style>
