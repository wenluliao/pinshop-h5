<template>
  <view class="index-page">
    <!-- 搜索栏 -->
    <view class="search-bar" @tap="goSearch">
      <view class="search-input">
        <text class="search-icon uni-icon">&#xe62c;</text>
        <text class="search-placeholder">搜索商品</text>
      </view>
    </view>

    <!-- 轮播图 -->
    <swiper class="banner-swiper" autoplay circular interval="3000">
      <swiper-item v-for="(banner, index) in banners" :key="index">
        <image class="banner-image" :src="banner" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <!-- 时间段选择 -->
    <scroll-view class="time-slots" scroll-x>
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
    <view class="product-list">
      <view class="section-header">
        <text class="section-title">秒杀商品</text>
        <Countdown :end-time="flashEndTime" label="本场结束" />
      </view>

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
        <uni-load-more :status="loadingStatus" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import type { Product } from '@/types'
import { getFlashList } from '@/api/product'
import ProductCard from '@/components/ProductCard.vue'
import Countdown from '@/components/Countdown.vue'

// 数据
const banners = ref([
  'https://picsum.photos/750/360?random=1',
  'https://picsum.photos/750/360?random=2',
  'https://picsum.photos/750/360?random=3'
])

const timeSlots = ref(['08:00', '12:00', '20:00'])
const currentTimeSlot = ref('12:00')
const flashEndTime = ref(Date.now() + 3600000) // 1小时后结束

const products = ref<Product[]>([])
const loading = ref(false)
const finished = ref(false)

const loadingStatus = ref<'more' | 'loading' | 'noMore'>('more')

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
  loadingStatus.value = 'loading'

  try {
    const list = await getFlashList(currentTimeSlot.value)

    if (reset) {
      products.value = list
    } else {
      products.value = [...products.value, ...list]
    }

    // 设置结束时间（假设1小时后）
    if (list.length > 0 && list[0].flashEndTime) {
      flashEndTime.value = list[0].flashEndTime
    }

    finished.value = true
    loadingStatus.value = 'noMore'
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

// 跳转搜索页
const goSearch = () => {
  uni.navigateTo({ url: '/pages/search/index' })
}

// 跳转详情页
const goDetail = (product: Product) => {
  uni.navigateTo({
    url: `/pages/detail/index?skuId=${product.skuId}`
  })
}

// 页面生命周期
onLoad(() => {
  loadProducts(true)
})

onPullDownRefresh(() => {
  loadProducts(true).then(() => {
    uni.stopPullDownRefresh()
  })
})

onReachBottom(() => {
  if (!finished.value && !loading.value) {
    loadProducts()
  }
})
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-bar {
  padding: 20rpx 32rpx;
  background: #fff;

  &-input {
    display: flex;
    align-items: center;
    height: 64rpx;
    padding: 0 24rpx;
    background: #f5f5f5;
    border-radius: 32rpx;
  }

  &-icon {
    margin-right: 12rpx;
    font-size: 32rpx;
    color: #999;
  }

  &-placeholder {
    font-size: 28rpx;
    color: #999;
  }
}

.banner-swiper {
  width: 100%;
  height: 360rpx;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.time-slots {
  display: flex;
  white-space: nowrap;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
}

.time-slot-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 32rpx;
  margin-right: 16rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;

  &.active {
    background: #fff;
    color: #ff6b6b;
  }

  &:last-child {
    margin-right: 0;
  }
}

.slot-time {
  font-size: 32rpx;
  font-weight: bold;
}

.slot-label {
  font-size: 22rpx;
  margin-top: 4rpx;
  opacity: 0.8;
}

.product-list {
  padding: 24rpx 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.load-more {
  margin-top: 32rpx;
}
</style>
