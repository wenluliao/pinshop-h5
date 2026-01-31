<template>
  <view class="index-page">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 顶部搜索栏 -->
    <view class="search-bar-section">
      <view class="search-bar" @tap="goSearch">
        <view class="search-input">
          <text class="search-icon">🔍</text>
          <text class="search-placeholder">搜索商品</text>
        </view>
      </view>
    </view>

    <!-- 主内容区：左右分栏 -->
    <view class="main-content">
      <!-- 左侧分类列表 -->
      <scroll-view class="category-sidebar" scroll-y>
        <view
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          :class="{ active: selectedCategoryId === category.id }"
          @tap="selectCategory(category.id)"
        >
          <text class="category-icon">{{ category.icon }}</text>
          <text class="category-name">{{ category.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧商品列表 -->
      <scroll-view class="product-content" scroll-y @scrolltolower="loadMore">
        <!-- 商品网格 -->
        <view class="product-grid">
          <ProductCard
            v-for="product in products"
            :key="product.skuId"
            :product="product"
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
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import type { Product } from '@/types'
import { getFlashList } from '@/api/product'
import { getCategoryList } from '@/api/category'
import ProductCard from '@/components/ProductCard.vue'

// 状态栏高度
const statusBarHeight = ref(0)

// 分类数据（包含推广分类）
const categories = ref([
  { id: 0, name: '全部商品', icon: '🏠' },
  { id: -1, name: '每日特惠', icon: '🔥' },
  { id: -2, name: '新品上市', icon: '✨' },
  { id: 1, name: '叶菜类', icon: '🥬' },
  { id: 2, name: '根茎类', icon: '🥕' },
  { id: 3, name: '葱姜蒜', icon: '🧅' },
  { id: 4, name: '辣椒类', icon: '🌶️' },
  { id: 5, name: '茄果类', icon: '🍆' },
  { id: 6, name: '瓜果类', icon: '🥒' },
  { id: 7, name: '豆类', icon: '🫘' },
  { id: 8, name: '菌菇类', icon: '🍄' }
])

const selectedCategoryId = ref(0)
const products = ref<Product[]>([])
const loading = ref(false)
const finished = ref(false)

// 获取系统信息
const getSystemInfo = () => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
}

// 选择分类
const selectCategory = (categoryId: number) => {
  selectedCategoryId.value = categoryId
  loadProducts(true)
}

// 加载商品列表
const loadProducts = async (reset: boolean = false) => {
  if (loading.value) return

  loading.value = true

  try {
    // 这里使用秒杀接口作为示例，实际应该调用分类商品接口
    const list = await getFlashList('12:00')

    if (reset) {
      products.value = list
    } else {
      products.value = [...products.value, ...list]
    }

    // 模拟没有更多数据
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
  getSystemInfo()
  loadProducts(true)
})

onReachBottom(() => {
  loadMore()
})
</script>

<style lang="scss" scoped>
.index-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* 状态栏占位 */
.status-bar {
  background: #fff;
}

/* 搜索栏 */
.search-bar-section {
  padding: 16rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.search-bar {
  display: flex;
  align-items: center;
}

.search-input {
  display: flex;
  align-items: center;
  flex: 1;
  height: 64rpx;
  padding: 0 24rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.search-placeholder {
  font-size: 28rpx;
  color: #999;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧分类栏 */
.category-sidebar {
  width: 160rpx;
  background: #fff;
  border-right: 1rpx solid #eee;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;
  border-left: 6rpx solid transparent;
  transition: all 0.2s;
}

.category-item.active {
  background: #fff5f5;
  border-left-color: #ff6b6b;
}

.category-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.category-name {
  font-size: 24rpx;
  color: #333;
}

.category-item.active .category-name {
  color: #ff6b6b;
  font-weight: 600;
}

/* 右侧商品区 */
.product-content {
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
