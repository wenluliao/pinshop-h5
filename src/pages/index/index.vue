<template>
  <view class="index-page">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 顶部：一级分类Tab -->
    <view class="top-tabs">
      <scroll-view class="tabs-scroll" scroll-x>
        <view
          v-for="tab in level1Categories"
          :key="tab.categoryId"
          class="tab-item"
          :class="{ active: selectedLevel1Id === tab.categoryId }"
          @tap="selectLevel1(tab.categoryId)"
        >
          <text class="tab-icon">{{ tab.icon }}</text>
          <text class="tab-name">{{ tab.categoryName }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar-section">
      <view class="search-bar" @tap="goSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索商品</text>
      </view>
    </view>

    <!-- 主内容区：左右分栏 -->
    <view class="main-content">
      <!-- 左侧二级分类列表 -->
      <scroll-view class="category-sidebar" scroll-y>
        <view
          v-for="category in level2Categories"
          :key="category.categoryId"
          class="category-item"
          :class="{ active: selectedCategoryId === category.categoryId }"
          @tap="selectCategory(category.categoryId)"
        >
          <text class="category-icon">{{ category.icon }}</text>
          <text class="category-name">{{ category.categoryName }}</text>
        </view>
      </scroll-view>

      <!-- 右侧商品列表 -->
      <scroll-view class="product-content" scroll-y @scrolltolower="loadMore">
        <!-- 加载状态 -->
        <view v-if="loading" class="loading-container">
          <text class="loading-text">加载中...</text>
        </view>

        <!-- 商品列表 -->
        <view v-else-if="products.length > 0" class="product-list">
          <ProductCard
            v-for="product in products"
            :key="product.skuId"
            :product="product"
            :tags="getProductTags(product.skuId)"
            @tap="goDetail(product)"
          />
        </view>

        <!-- 无更多数据 -->
        <view v-if="finished && products.length > 0" class="no-more">
          <text class="no-more-text">没有更多了</text>
        </view>

        <!-- 空状态 -->
        <view v-if="!loading && products.length === 0" class="empty-state">
          <text class="empty-text">暂无商品</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { CategoryTree, CategoryProduct, ProductTag } from '@/types'
import { getProductsByCategory } from '@/api/product'
import { getCategoryTree } from '@/api/category'
import { getAllTags } from '@/api/tag'
import ProductCard from '@/components/ProductCard.vue'

// 状态栏高度
const statusBarHeight = ref(0)

// 分类树数据
const categoryTree = ref<CategoryTree[]>([])
const selectedLevel1Id = ref<number>(1)
const selectedCategoryId = ref<number>(0)

// 商品数据
const products = ref<CategoryProduct[]>([])
const loading = ref(false)
const finished = ref(false)
const currentPage = ref(1)
const pageSize = 20

// 商品标签映射
const productTagsMap = ref<Map<number, ProductTag[]>>(new Map())
const allTags = ref<ProductTag[]>([])

// 一级分类（顶部Tab）
const level1Categories = computed(() => {
  if (!categoryTree.value || categoryTree.value.length === 0) return []
  return categoryTree.value.map(cat => ({
    categoryId: cat.categoryId,
    categoryName: cat.categoryName,
    icon: cat.icon || ''
  }))
})

// 二级分类（左侧列表）
const level2Categories = computed(() => {
  const level1 = categoryTree.value.find(c => c.categoryId === selectedLevel1Id.value)
  if (!level1 || !level1.children) return []
  return level1.children
})

// 获取系统信息
const getSystemInfo = () => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
}

// 选择一级分类
const selectLevel1 = (categoryId: number) => {
  console.log('选择一级分类:', categoryId)
  selectedLevel1Id.value = categoryId
  // 默认选中该一级分类下的第一个二级分类
  const level2 = level2Categories.value[0]
  if (level2) {
    selectCategory(level2.categoryId)
  }
}

// 选择二级分类
const selectCategory = (categoryId: number) => {
  console.log('选择二级分类:', categoryId)
  selectedCategoryId.value = categoryId
  loadProducts(true)
}

// 加载商品列表
const loadProducts = async (reset: boolean = false) => {
  if (loading.value) return

  if (reset) {
    currentPage.value = 1
    finished.value = false
    products.value = []
  }

  loading.value = true

  try {
    console.log('加载商品, categoryId:', selectedCategoryId.value)

    const response = await getProductsByCategory({
      categoryId: selectedCategoryId.value,
      relationType: 2, // 2-营销分类（如今日特价）
      sortBy: 'price_asc', // 价格升序
      pageNum: currentPage.value,
      pageSize: pageSize
    })

    console.log('商品数据:', response)

    products.value = response.products

    // 判断是否还有更多数据
    if (products.value.length >= response.total) {
      finished.value = true
    } else {
      currentPage.value++
    }
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
  if (!loading.value && !finished.value) {
    loadProducts(false)
  }
}

// 跳转搜索
const goSearch = () => {
  uni.navigateTo({
    url: '/pages/search/index'
  })
}

// 跳转商品详情
const goDetail = (product: CategoryProduct) => {
  if (!product.skuId) {
    uni.showToast({
      title: '商品数据错误',
      icon: 'none'
    })
    return
  }

  uni.navigateTo({
    url: `/pages/detail/index?skuId=${product.skuId}`
  })
}

// 获取商品标签
const getProductTags = (skuId: number): ProductTag[] => {
  return productTagsMap.value.get(skuId) || []
}

// 初始化
onLoad(() => {
  console.log('页面加载')
  getSystemInfo()
  loadData()
})

const loadData = async () => {
  try {
    console.log('开始加载数据')

    // 加载分类树
    categoryTree.value = await getCategoryTree()
    console.log('分类树加载完成:', categoryTree.value)

    // 加载所有标签
    try {
      const tagsData = await getAllTags()
      allTags.value = Object.values(tagsData).flat()
      console.log('标签加载完成:', allTags.value.length)
    } catch (e) {
      console.log('加载标签失败，可能后端还未实现:', e)
    }

    // 默认选中第一个一级分类的第一个二级分类
    const level1 = categoryTree.value[0]
    if (level1) {
      selectedLevel1Id.value = level1.categoryId

      const level2 = level1.children?.[0]
      if (level2) {
        selectCategory(level2.categoryId)
      }
    }
  } catch (error) {
    console.error('初始化失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.index-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.status-bar {
  background: #fff;
}

/* 顶部一级分类Tab */
.top-tabs {
  background: #fff;
  border-bottom: 1rpx solid #eee;
  padding: 10rpx 0;
}

.tabs-scroll {
  white-space: nowrap;
  padding: 0 20rpx;
}

.tab-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 40rpx;
  padding: 10rpx 20rpx;
  border-radius: 12rpx;
  transition: all 0.2s;

  &.active {
    background: #ff4444;

    .tab-name {
      color: #fff;
    }
  }
}

.tab-icon {
  font-size: 36rpx;
  margin-bottom: 4rpx;
}

.tab-name {
  font-size: 22rpx;
  color: #333;
  font-weight: 500;
}

/* 搜索栏 */
.search-bar-section {
  background: #fff;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #eee;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 12rpx 24rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.search-placeholder {
  font-size: 26rpx;
  color: #999;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧分类列表 */
.category-sidebar {
  width: 180rpx;
  background: #f8f8f8;
  border-right: 1rpx solid #eee;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 12rpx;
  border-left: 4rpx solid transparent;
  transition: all 0.2s;

  &.active {
    background: #fff;
    border-left-color: #ff4444;

    .category-name {
      color: #ff4444;
      font-weight: 600;
    }
  }
}

.category-icon {
  font-size: 32rpx;
  margin-bottom: 6rpx;
}

.category-name {
  font-size: 22rpx;
  color: #333;
  text-align: center;
  line-height: 1.3;
}

/* 右侧商品列表 */
.product-content {
  flex: 1;
  padding: 16rpx;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.no-more {
  padding: 30rpx 0;
  text-align: center;
}

.no-more-text {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  padding: 100rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
