<template>
  <view class="seckill-page">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 标题栏 -->
    <view class="header">
      <view class="title-wrapper">
        <text class="title">⚡ 限时秒杀</text>
        <Countdown :end-time="flashEndTime" />
      </view>
    </view>

    <!-- 时间段选择 -->
    <scroll-view class="time-slots" scroll-x show-scrollbar="false">
      <view
        v-for="(slot, index) in timeSlots"
        :key="index"
        class="time-slot-item"
        :class="{ active: currentTimeSlot === slot }"
        @tap="selectTimeSlot(slot)"
      >
        <text class="slot-time">{{ slot }}</text>
        <text class="slot-label">{{ getSlotLabel(slot) }}</text>
      </view>
    </scroll-view>

    <!-- 商品列表 -->
    <scroll-view class="product-list" scroll-y @scrolltolower="loadMore">
      <view class="product-grid">
        <ProductCard
          v-for="product in products"
          :key="product.skuId"
          :product="product"
          :show-stock="true"
          :show-countdown="true"
          @tap="goDetail"
        />
      </view>

      <!-- 加载状态 -->
      <view class="load-more" v-if="!finished">
        <text class="loading-text">{{ loading ? '加载中...' : '下拉加载更多' }}</text>
      </view>
      <view class="no-more" v-else>
        <text class="no-more-text">没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import type { Product } from '@/types'
import { getFlashList } from '@/api/product'
import ProductCard from '@/components/ProductCard.vue'
import Countdown from '@/components/Countdown.vue'

// 状态栏高度
const statusBarHeight = ref(0)

// 时间段
const timeSlots = ref(['08:00', '12:00', '20:00'])
const currentTimeSlot = ref('12:00')
const flashEndTime = ref(Date.now() + 3600000) // 1小时后结束

const products = ref<Product[]>([])
const loading = ref(false)
const finished = ref(false)

// 获取时间段标签
const getSlotLabel = (slot: string) => {
  const now = new Date()
  const [hour] = slot.split(':').map(Number)
  const currentHour = now.getHours()

  if (hour > currentHour) {
    return '即将开始'
  } else if (hour === currentHour || currentHour - hour < 2) {
    return '抢购中'
  } else {
    return '已结束'
  }
}

// 选择时间段
const selectTimeSlot = (slot: string) => {
  currentTimeSlot.value = slot
  loadProducts(true)
}

// 加载商品列表
const loadProducts = async (reset: boolean = false) => {
  if (loading.value) return

  loading.value = true

  try {
    const list = await getFlashList(currentTimeSlot.value)

    if (reset) {
      products.value = list
    } else {
      products.value = [...products.value, ...list]
    }

    // 设置结束时间
    if (list.length > 0 && list[0].flashEndTime) {
      flashEndTime.value = list[0].flashEndTime
    }

    finished.value = true
  } catch (error) {
    console.error('加载商品失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!finished.value && !loading.value) {
    loadProducts()
  }
}

// 跳转详情页
const goDetail = (product: Product) => {
  uni.navigateTo({
    url: `/pages/detail/index?skuId=${product.skuId}`
  })
}

// 页面生命周期
onLoad(() => {
  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0

  loadProducts(true)
})

onReachBottom(() => {
  loadMore()
})
</script>

<style lang="scss" scoped>
.seckill-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* 状态栏占位 */
.status-bar {
  background: #fff;
}

/* 标题栏 */
.header {
  padding: 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 40rpx;
  font-weight: 600;
  color: #1a1a1a;
}

/* 时间段选择 */
.time-slots {
  display: flex;
  white-space: nowrap;
  padding: 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.time-slot-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 140rpx;
  height: 120rpx;
  margin-right: 16rpx;
  border-radius: 12rpx;
  background: #f7f7f7;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.time-slot-item.active {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  border-color: #ff6b6b;

  .slot-time,
  .slot-label {
    color: #fff;
  }
}

.time-slot-item:last-child {
  margin-right: 0;
}

.slot-time {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1;
  margin-bottom: 8rpx;
}

.slot-label {
  font-size: 22rpx;
  color: #999;
}

/* 商品列表 */
.product-list {
  flex: 1;
  padding: 16rpx;
}

.product-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.load-more,
.no-more {
  padding: 40rpx 0;
  text-align: center;
}

.loading-text,
.no-more-text {
  font-size: 24rpx;
  color: #999;
}
</style>
