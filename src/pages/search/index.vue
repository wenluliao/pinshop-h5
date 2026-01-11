<template>
  <view class="search-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <text class="search-icon uni-icon">&#xe62c;</text>
        <input
          class="search-input"
          type="text"
          :value="keyword"
          placeholder="搜索商品"
          confirm-type="search"
          @input="onInput"
          @confirm="onSearch"
        />
        <text v-if="keyword" class="clear-icon uni-icon" @tap="clear">&#xe627;</text>
      </view>
      <text class="cancel-btn" @tap="goBack">取消</text>
    </view>

    <!-- 搜索结果 -->
    <scroll-view class="search-results" scroll-y>
      <view v-if="hasSearched && results.length === 0" class="empty-state">
        <text class="empty-text">未找到相关商品</text>
      </view>

      <view v-if="hasSearched && results.length > 0" class="product-list">
        <view
          v-for="product in results"
          :key="product.skuId"
          class="product-item"
          @tap="goDetail(product.skuId)"
        >
          <image class="product-image" :src="product.imgUrl" mode="aspectFill" />
          <view class="product-info">
            <text class="product-title text-ellipsis-2">{{ product.title }}</text>
            <text class="product-price price-color">¥{{ product.salePrice.toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <!-- 搜索历史 -->
      <view v-if="!hasSearched" class="search-history">
        <view class="history-header">
          <text class="history-title">搜索历史</text>
          <text class="history-clear" @tap="clearHistory">清空</text>
        </view>
        <view class="history-list">
          <text
            v-for="(item, index) in history"
            :key="index"
            class="history-item"
            @tap="searchHistoryItem(item)"
          >
            {{ item }}
          </text>
        </view>
      </view>

      <!-- 热门搜索 -->
      <view v-if="!hasSearched" class="hot-search">
        <view class="hot-title">热门搜索</view>
        <view class="hot-list">
          <text
            v-for="(item, index) in hotKeywords"
            :key="index"
            class="hot-item"
            @tap="searchHotItem(item)"
          >
            {{ item }}
          </text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Product } from '@/types'
import { searchProducts } from '@/api/product'

const keyword = ref('')
const results = ref<Product[]>([])
const hasSearched = ref(false)
const history = ref<string[]>([])
const hotKeywords = ref(['iPhone', '华为', '小米', '耳机', '充电器', '数据线', '手机壳'])

// 输入事件
const onInput = (e: any) => {
  keyword.value = e.detail.value
}

// 搜索
const onSearch = async () => {
  if (!keyword.value.trim()) return

  hasSearched.value = true

  // 添加到历史记录
  addToHistory(keyword.value)

  try {
    const res = await searchProducts({
      keyword: keyword.value,
      pageNum: 1,
      pageSize: 50
    })
    results.value = res.list
  } catch (error) {
    console.error('搜索失败:', error)
  }
}

// 清空
const clear = () => {
  keyword.value = ''
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 添加到历史记录
const addToHistory = (item: string) => {
  const index = history.value.indexOf(item)
  if (index > -1) {
    history.value.splice(index, 1)
  }
  history.value.unshift(item)

  // 最多保存10条
  if (history.value.length > 10) {
    history.value = history.value.slice(0, 10)
  }

  // 保存到本地
  uni.setStorageSync('searchHistory', history.value)
}

// 清空历史
const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空搜索历史吗？',
    success: (res) => {
      if (res.confirm) {
        history.value = []
        uni.removeStorageSync('searchHistory')
      }
    }
  })
}

// 搜索历史项
const searchHistoryItem = (item: string) => {
  keyword.value = item
  onSearch()
}

// 搜索热门项
const searchHotItem = (item: string) => {
  keyword.value = item
  onSearch()
}

// 跳转详情
const goDetail = (skuId: number) => {
  uni.navigateTo({
    url: `/pages/detail/index?skuId=${skuId}`
  })
}

// 加载历史记录
const loadHistory = () => {
  const saved = uni.getStorageSync('searchHistory')
  if (saved) {
    history.value = saved
  }
}

loadHistory()
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 32rpx;
  background: #fff;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  height: 64rpx;
  padding: 0 24rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
}

.search-icon {
  font-size: 32rpx;
  color: #999;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.clear-icon {
  font-size: 32rpx;
  color: #999;
  padding: 8rpx;
}

.cancel-btn {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #666;
}

.search-results {
  height: calc(100vh - 96rpx);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.product-list {
  padding: 24rpx 32rpx;
}

.product-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.product-image {
  width: 180rpx;
  height: 180rpx;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24rpx;
}

.product-title {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: auto;
}

.product-price {
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 16rpx;
}

.search-history,
.hot-search {
  padding: 32rpx;
  background: #fff;
  margin-bottom: 16rpx;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.history-title,
.hot-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.history-clear {
  font-size: 24rpx;
  color: #999;
}

.history-list,
.hot-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.history-item,
.hot-item {
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  color: #666;
  font-size: 26rpx;
  border-radius: 32rpx;
}

.hot-item {
  background: #fff4f4;
  color: #ff6b6b;
}
</style>
