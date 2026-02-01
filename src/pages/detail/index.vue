<template>
  <view class="detail-page">
    <!-- 商品图片轮播 - 横图 -->
    <swiper class="product-swiper" circular :indicator-dots="true" indicator-color="rgba(0,0,0,0.2)" indicator-active-color="#ff6b6b">
      <swiper-item v-for="(img, index) in product.images" :key="index">
        <image class="product-image" :src="img" mode="aspectFill" @tap="previewImage(index)" />
      </swiper-item>
    </swiper>

    <!-- 价格信息 -->
    <view class="price-section">
      <view class="price-row">
        <text class="price-symbol">¥</text>
        <text class="price-integer">{{ integerPart(displayPrice) }}</text>
        <text class="price-decimal">.{{ decimalPart(displayPrice) }}</text>
        <text v-if="product.originalPrice && product.originalPrice > displayPrice" class="original-price">
          ¥{{ product.originalPrice.toFixed(2) }}
        </text>
      </view>
      <view class="stock-row">
        <text class="stock-text">库存 {{ product.stock }} 件</text>
      </view>
    </view>

    <!-- 商品基本信息 -->
    <view class="product-section">
      <text class="product-title">{{ product.title }}</text>
      <text v-if="product.subtitle" class="product-subtitle">{{ product.subtitle }}</text>

      <!-- 规格选择 -->
      <view class="spec-section" @tap="openSkuSelector">
        <view class="spec-header">
          <text class="spec-label">规格</text>
          <view class="spec-value">
            <text>{{ formatSpec(product.specification) }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="detail-section">
      <view class="detail-title">— 商品详情 —</view>
      <view class="detail-images">
        <image
          v-for="(img, index) in detailImages"
          :key="'detail-' + index"
          class="detail-img"
          :src="img"
          mode="widthFix"
        />
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder"></view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bar-left">
        <view class="bar-icon" @tap="goHome">
          <text class="icon">🏠</text>
          <text class="icon-text">首页</text>
        </view>
        <view class="bar-icon" @tap="goCart">
          <text class="icon">🛒</text>
          <text class="icon-text">购物车</text>
          <text v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</text>
        </view>
      </view>
      <view class="bar-right">
        <button class="btn-cart" @tap="addToCart">加入购物车</button>
        <button class="btn-buy" @tap="buyNow">立即购买</button>
      </view>
    </view>

    <!-- SKU选择器 -->
    <SkuSelector ref="skuSelector" :product="product" @confirm="onConfirm" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { ProductDetail } from '@/types'
import { getProductDetail } from '@/api/product'
import { useUserStore, useCartStore } from '@/stores'
import SkuSelector from '@/components/SkuSelector.vue'

const userStore = useUserStore()
const cartStore = useCartStore()

const product = ref<ProductDetail>({
  skuId: 0,
  title: '',
  imgUrl: '',
  originalPrice: 0,
  salePrice: 0,
  stock: 0,
  images: [],
  content: ''
})

const skuSelector = ref()

const cartCount = computed(() => cartStore.totalCount)

// 显示价格（只用salePrice，不使用flashPrice）
const displayPrice = computed(() => {
  return product.value.salePrice || 0
})

// 详情图片列表（只使用主图，避免不相关的图片）
const detailImages = computed(() => {
  if (!product.value.imgUrl) {
    return []
  }
  // 只返回主图，避免混入测试图片
  return [product.value.imgUrl]
})

// 解析规格JSON字符串，返回可读文本
const formatSpec = (specStr: string | undefined): string => {
  if (!specStr) return '请选择规格'

  try {
    // 尝试解析JSON
    const specObj = JSON.parse(specStr)

    // 提取所有值并拼接
    if (typeof specObj === 'object') {
      const values = Object.values(specObj)
      if (values.length > 0) {
        return values.join(' / ')
      }
    }

    // 如果是字符串，直接返回
    if (typeof specObj === 'string') {
      return specObj
    }

    return '请选择规格'
  } catch (e) {
    // JSON解析失败，可能是纯文本
    return specStr || '请选择规格'
  }
}

// 加载商品详情
const loadDetail = async (skuId: number) => {
  try {
    uni.showLoading({ title: '加载中...' })
    const data = await getProductDetail(skuId)

    // 只使用salePrice，清除flashPrice（如果有）
    product.value = {
      ...data,
      flashPrice: undefined,
      // 将随机图片URL替换为固定URL
      imgUrl: data.imgUrl || '',
      images: data.images ? data.images.map((img: string) => {
        // 如果是picsum随机图片，替换为固定占位图
        if (img.includes('picsum.photos')) {
          // 使用固定种子确保图片一致
          const id = data.skuId || 1
          return `https://picsum.photos/id/${id}/800/600`
        }
        return img
      }) : []
    }

    console.log('商品详情加载完成:', product.value)
  } catch (error) {
    console.error('加载详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 预览图片
const previewImage = (index: number) => {
  uni.previewImage({
    urls: product.value.images,
    current: index
  })
}

// 打开SKU选择器
const openSkuSelector = () => {
  skuSelector.value?.open()
}

// 确认选择
const onConfirm = (quantity: number) => {
  // 加入购物车
  cartStore.addToCart(product.value, quantity)
  uni.showToast({
    title: '已加入购物车',
    icon: 'success'
  })
}

// 加入购物车
const addToCart = () => {
  if (!userStore.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/index'
      })
    }, 1500)
    return
  }

  cartStore.addToCart(product.value, 1)
  uni.showToast({
    title: '已加入购物车',
    icon: 'success'
  })
}

// 立即购买
const buyNow = () => {
  if (!userStore.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/index'
      })
    }, 1500)
    return
  }

  // 直接加入购物车并跳转
  cartStore.addToCart(product.value, 1)
  uni.switchTab({
    url: '/pages/cart/index'
  })
}

// 返回首页
const goHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

// 去购物车
const goCart = () => {
  uni.switchTab({
    url: '/pages/cart/index'
  })
}

const integerPart = (price: number) => Math.floor(price).toString()
const decimalPart = (price: number) => (price % 1).toFixed(2).substring(2)

// 页面加载
onLoad((options: any) => {
  const { skuId } = options
  if (skuId) {
    loadDetail(Number(skuId))
  }
})
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* 轮播图 - 横图 */
.product-swiper {
  width: 100%;
  height: 600rpx;
  background: #fff;
}

.product-image {
  width: 100%;
  height: 100%;
  display: block;
}

/* 价格区域 */
.price-section {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 2rpx;
}

.price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 16rpx;
}

.price-symbol {
  font-size: 32rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.price-integer {
  font-size: 56rpx;
  color: #ff6b6b;
  font-weight: bold;
  margin-left: 4rpx;
}

.price-decimal {
  font-size: 32rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.original-price {
  font-size: 24rpx;
  color: #999;
  text-decoration: line-through;
  margin-left: 16rpx;
}

.stock-row {
  display: flex;
  align-items: center;
}

.stock-text {
  font-size: 24rpx;
  color: #999;
}

/* 商品信息区域 */
.product-section {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.product-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.5;
  display: block;
  margin-bottom: 16rpx;
}

.product-subtitle {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
  display: block;
  margin-bottom: 24rpx;
}

.spec-section {
  border-top: 1rpx solid #f5f5f5;
  padding-top: 24rpx;
}

.spec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.spec-label {
  font-size: 28rpx;
  color: #666;
  width: 80rpx;
}

.spec-value {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 28rpx;
  color: #333;

  text {
    margin-right: 8rpx;
  }
}

.arrow {
  color: #999;
  font-size: 32rpx;
}

/* 商品详情 */
.detail-section {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.detail-title {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  margin-bottom: 32rpx;
}

.detail-images {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.detail-img {
  width: 100%;
  display: block;
  margin-bottom: 0;
}

/* 底部占位 */
.bottom-placeholder {
  height: 20rpx;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.bar-left {
  display: flex;
  gap: 32rpx;
}

.bar-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  .icon {
    font-size: 44rpx;
    margin-bottom: 4rpx;
  }

  .icon-text {
    font-size: 20rpx;
    color: #666;
  }

  .cart-badge {
    position: absolute;
    top: -6rpx;
    right: -6rpx;
    min-width: 32rpx;
    height: 32rpx;
    line-height: 32rpx;
    padding: 0 8rpx;
    background: #ff6b6b;
    color: #fff;
    font-size: 20rpx;
    text-align: center;
    border-radius: 16rpx;
  }
}

.bar-right {
  display: flex;
  gap: 16rpx;
  flex: 1;
  margin-left: 24rpx;
}

.bar-right button {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 40rpx;
  border: none;
  padding: 0;

  &::after {
    border: none;
  }
}

.btn-cart {
  background: #ffd93d;
  color: #333;
}

.btn-buy {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;
}
</style>
