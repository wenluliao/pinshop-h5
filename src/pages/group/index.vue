<template>
  <view class="group-page">
    <!-- 拼团商品 -->
    <scroll-view class="group-products" scroll-y>
      <view class="product-list">
        <view
          v-for="product in products"
          :key="product.skuId"
          class="product-item"
          @tap="goDetail(product.skuId)"
        >
          <image class="product-image" :src="product.imgUrl" mode="aspectFill" />
          <view class="product-info">
            <text class="product-title text-ellipsis-2">{{ product.title }}</text>
            <view class="product-price">
              <text class="price-label">拼团价</text>
              <text class="price-value price-color">¥{{ product.salePrice.toFixed(2) }}</text>
              <text class="price-original">¥{{ product.originalPrice.toFixed(2) }}</text>
            </view>
            <view class="product-group">
              <text class="group-text">{{ product.requiredNum }}人团</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { Product } from '@/types'
import { getHotProducts } from '@/api/product'

const products = ref<Product[]>([])
const skuId = ref(0)

// 加载拼团商品
const loadProducts = async () => {
  try {
    // 这里复用热门商品接口，实际应该调用专门的拼团商品接口
    products.value = await getHotProducts(20)
  } catch (error) {
    console.error('加载商品失败:', error)
  }
}

// 跳转详情
const goDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/detail/index?skuId=${id}`
  })
}

onLoad((options: any) => {
  if (options.skuId) {
    skuId.value = Number(options.skuId)
  }
  loadProducts()
})
</script>

<style lang="scss" scoped>
.group-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.group-products {
  height: 100vh;
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
  width: 200rpx;
  height: 200rpx;
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
  display: flex;
  align-items: baseline;
  margin-top: 16rpx;
}

.price-label {
  font-size: 22rpx;
  color: #ff6b6b;
  margin-right: 8rpx;
}

.price-value {
  font-size: 36rpx;
  font-weight: bold;
  margin-right: 12rpx;
}

.price-original {
  font-size: 24rpx;
  color: #999;
  text-decoration: line-through;
}

.product-group {
  margin-top: 12rpx;
}

.group-text {
  padding: 4rpx 12rpx;
  background: linear-gradient(135deg, #ffd93d, #ffe08a);
  color: #333;
  font-size: 22rpx;
  border-radius: 6rpx;
}
</style>
