<template>
  <view class="progress-bar">
    <view class="progress-track">
      <view class="progress-fill" :style="{ width: `${percentage}%` }"></view>
    </view>
    <view v-if="showText" class="progress-text">
      <text>{{ text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  current: number // 当前值
  total: number // 总值
  showText?: boolean // 是否显示文字
  text?: string // 显示文本
}

const props = withDefaults(defineProps<Props>(), {
  showText: false,
  text: ''
})

const percentage = computed(() => {
  if (props.total <= 0) return 0
  return Math.min(100, Math.max(0, (props.current / props.total) * 100))
})

const displayText = computed(() => {
  return props.text || `${props.current}/${props.total}`
})
</script>

<style lang="scss" scoped>
.progress-bar {
  width: 100%;

  &-track {
    position: relative;
    width: 100%;
    height: 12rpx;
    background: #f0f0f0;
    border-radius: 6rpx;
    overflow: hidden;
  }

  &-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, #ff6b6b, #ff8e8e);
    border-radius: 6rpx;
    transition: width 0.3s ease;
  }

  &-text {
    margin-top: 8rpx;
    font-size: 24rpx;
    color: #999;
    text-align: right;
  }
}
</style>
