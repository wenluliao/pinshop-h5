<template>
  <view class="detail-page">
    <!-- 商品图片轮播 -->
    <swiper class="product-swiper" circular :indicator-dots="true" indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#ff6b6b">
      <swiper-item v-for="(img, index) in product.images" :key="index">
        <image class="product-image" :src="img" mode="aspectFill" @tap="previewImage(index)" />
      </swiper-item>
    </swiper>

    <!-- 价格卡片 -->
    <view class="price-card">
      <view class="price-main">
        <view class="flash-price-section">
          <text class="price-symbol">¥</text>
          <text class="price-integer">{{ integerPart(displayPrice) }}</text>
          <text class="price-decimal">.{{ decimalPart(displayPrice) }}</text>
        </view>
        <view v-if="product.flashPrice" class="original-price-section">
          <text class="original-price">原价¥{{ product.salePrice?.toFixed(2) || '0.00' }}</text>
        </view>
      </view>
      <view class="stock-info">
        <text class="stock-text">库存：{{ product.stock }}件</text>
        <text v-if="product.sales" class="sales-text">已售{{ product.sales }}件</text>
      </view>
      <!-- 秒杀倒计时 -->
      <view v-if="product.flashPrice && product.flashEndTime" class="flash-countdown">
        <text class="countdown-label">秒杀结束</text>
        <Countdown :end-time="product.flashEndTime" />
      </view>
    </view>

    <!-- 商品信息卡片 -->
    <view class="info-card">
      <view class="product-header">
        <text class="product-title">{{ product.title }}</text>
        <view v-if="product.subtitle" class="product-subtitle">
          {{ product.subtitle }}
        </view>
      </view>

      <!-- 标签 -->
      <view v-if="product.tags && product.tags.length" class="product-tags">
        <text v-for="(tag, index) in product.tags" :key="index" class="product-tag">
          {{ tag }}
        </text>
      </view>

      <!-- 规格选择 -->
      <view class="spec-row" @tap="openSkuSelector('normal')">
        <text class="spec-label">规格</text>
        <view class="spec-value">
          <text>{{ product.specification || '请选择规格' }}</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 配送信息 -->
      <view class="delivery-row">
        <text class="delivery-label">配送</text>
        <view class="delivery-value">
          <text class="delivery-location">北京 至 北京朝阳区</text>
          <text class="delivery-time">预计明天送达</text>
        </view>
      </view>

      <!-- 服务保障 -->
      <view class="service-row">
        <text class="service-label">服务</text>
        <view class="service-value">
          <text class="service-item">✓ 正品保证</text>
          <text class="service-item">✓ 极速退款</text>
          <text class="service-item">✓ 运费险</text>
        </view>
      </view>
    </view>

    <!-- 拼团信息 -->
    <view v-if="groupSessions.length > 0" class="group-card">
      <view class="group-header">
        <view class="group-title-row">
          <text class="group-icon">👥</text>
          <text class="group-title">正在拼团</text>
          <text class="group-count">{{ groupSessions.length }}人在拼团</text>
        </view>
        <text class="group-more" @tap="showMoreGroups">查看更多 ›</text>
      </view>
      <view class="group-list">
        <view
          v-for="session in groupSessions.slice(0, 2)"
          :key="session.sessionId"
          class="group-item"
          @tap="joinGroup(session)"
        >
          <image class="group-avatar" :src="session.initiatorAvatar" />
          <view class="group-info">
            <text class="group-name">{{ session.initiatorName }}</text>
            <view class="group-status">
              <text class="group-missing">还差{{ session.missingNum }}人成团</text>
              <Countdown :end-time="session.expireTime" :inline="true" />
            </view>
          </view>
          <button class="group-btn">去拼团</button>
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="detail-card">
      <view class="detail-header">商品详情</view>
      <view class="detail-content">
        <rich-text :nodes="product.content"></rich-text>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area"></view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bar-icons">
        <view class="bar-icon" @tap="goHome">
          <text class="iconfont">🏠</text>
          <text>首页</text>
        </view>
        <view class="bar-icon" @tap="addToCart">
          <text class="iconfont">🛒</text>
          <text>购物车</text>
          <text v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</text>
        </view>
        <view class="bar-icon" @tap="contactService">
          <text class="iconfont">💬</text>
          <text>客服</text>
        </view>
      </view>
      <view class="bar-buttons">
        <button class="btn-cart" @tap="openSkuSelector('normal')">
          加入购物车
        </button>
        <button class="btn-buy" @tap="openSkuSelector('normal')">
          立即购买
        </button>
        <button v-if="product.flashPrice" class="btn-flash" @tap="openSkuSelector('flash')">
          秒杀抢购
        </button>
      </view>
    </view>

    <!-- SKU选择器 -->
    <SkuSelector ref="skuSelector" :product="product" @confirm="onConfirm" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { ProductDetail, GroupSession } from '@/types'
import { getProductDetail } from '@/api/product'
import { getGroupSessions } from '@/api/group'
import { handleSeckill } from '@/utils/seckill-helper'
import { useUserStore, useCartStore } from '@/stores'
import SkuSelector from '@/components/SkuSelector.vue'
import Countdown from '@/components/Countdown.vue'

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

const groupSessions = ref<GroupSession[]>([])
const skuSelector = ref()
const buyType = ref<'normal' | 'flash'>('normal')

const cartCount = computed(() => cartStore.totalCount)

// 显示价格（优先显示秒杀价）
const displayPrice = computed(() => {
  return product.value.flashPrice || product.value.salePrice || 0
})

// 加载商品详情
const loadDetail = async (skuId: number) => {
  try {
    uni.showLoading({ title: '加载中...' })
    product.value = await getProductDetail(skuId)

    // 加载拼团会话
    if (product.value.skuId) {
      try {
        groupSessions.value = await getGroupSessions(product.value.skuId)
      } catch (e) {
        console.log('拼团信息加载失败:', e)
      }
    }
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
const openSkuSelector = (type: 'normal' | 'flash') => {
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

  buyType.value = type
  skuSelector.value?.open()
}

// 确认购买
const onConfirm = async (quantity: number) => {
  if (buyType.value === 'flash') {
    // 秒杀购买
    try {
      const orderId = await handleSeckill({
        eventId: 0,
        skuId: product.value.skuId,
        count: quantity,
        userId: Number(userStore.userInfo!.userId)
      })

      uni.showToast({
        title: '抢购成功！',
        icon: 'success'
      })

      setTimeout(() => {
        uni.navigateTo({
          url: `/pages/order/detail?orderId=${orderId}`
        })
      }, 1500)
    } catch (error: any) {
      uni.showToast({
        title: error.message || '抢购失败',
        icon: 'none'
      })
    }
  } else {
    // 普通购买 - 加入购物车或直接购买
    cartStore.addToCart(product.value, quantity)
    uni.showToast({
      title: '已加入购物车',
      icon: 'success'
    })
  }
}

// 加入购物车
const addToCart = () => {
  if (!userStore.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }

  cartStore.addToCart(product.value, 1)
  uni.showToast({
    title: '已加入购物车',
    icon: 'success'
  })
}

// 联系客服
const contactService = () => {
  uni.showToast({
    title: '客服功能开发中',
    icon: 'none'
  })
}

// 参与拼团
const joinGroup = (session: GroupSession) => {
  if (!userStore.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }

  uni.navigateTo({
    url: `/pages/group/detail?sessionId=${session.sessionId}`
  })
}

// 显示更多拼团
const showMoreGroups = () => {
  uni.navigateTo({
    url: `/pages/group/index?skuId=${product.value.skuId}`
  })
}

// 返回首页
const goHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
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
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.safe-area {
  height: 20rpx;
}

/* 商品图片 */
.product-swiper {
  width: 100%;
  height: 750rpx;
  background: #fff;
}

.product-image {
  width: 100%;
  height: 100%;
}

/* 价格卡片 */
.price-card {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  padding: 32rpx;
  color: #fff;
}

.price-main {
  display: flex;
  align-items: baseline;
  margin-bottom: 16rpx;
}

.flash-price-section {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 32rpx;
  font-weight: bold;
}

.price-integer {
  font-size: 64rpx;
  font-weight: bold;
  margin-left: 4rpx;
}

.price-decimal {
  font-size: 36rpx;
  font-weight: bold;
}

.original-price-section {
  margin-left: 24rpx;
}

.original-price {
  font-size: 24rpx;
  opacity: 0.9;
  text-decoration: line-through;
}

.stock-info {
  display: flex;
  gap: 32rpx;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  opacity: 0.95;
}

.flash-countdown {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.3);
}

.countdown-label {
  font-size: 24rpx;
  opacity: 0.95;
}

/* 信息卡片 */
.info-card {
  background: #fff;
  margin: 16rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.product-header {
  margin-bottom: 24rpx;
}

.product-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.5;
  display: block;
}

.product-subtitle {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.product-tag {
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, #fff4f4, #ffe8e8);
  color: #ff6b6b;
  font-size: 22rpx;
  border-radius: 20rpx;
  border: 1rpx solid #ffcece;
}

.spec-row,
.delivery-row,
.service-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.spec-label,
.delivery-label,
.service-label {
  font-size: 28rpx;
  color: #666;
  width: 100rpx;
}

.spec-value,
.delivery-value,
.service-value {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 26rpx;
  color: #333;
}

.spec-value text,
.delivery-location,
.delivery-time {
  margin-right: 8rpx;
}

.arrow {
  color: #999;
  font-size: 32rpx;
}

.delivery-value {
  flex-direction: column;
  align-items: flex-end;
}

.delivery-time {
  font-size: 22rpx;
  color: #ff6b6b;
  margin-top: 4rpx;
}

.service-value {
  gap: 24rpx;
}

.service-item {
  color: #52c41a;
  font-size: 24rpx;
}

/* 拼团卡片 */
.group-card {
  background: #fff;
  margin: 16rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.group-title-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.group-icon {
  font-size: 32rpx;
}

.group-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.group-count {
  font-size: 22rpx;
  color: #999;
  margin-left: 8rpx;
}

.group-more {
  font-size: 24rpx;
  color: #ff6b6b;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.group-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff9f9;
  border-radius: 12rpx;
  border: 1rpx solid #ffe8e8;
}

.group-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  background: #f0f0f0;
}

.group-info {
  flex: 1;
}

.group-name {
  font-size: 26rpx;
  color: #333;
  display: block;
  margin-bottom: 6rpx;
}

.group-status {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.group-missing {
  font-size: 22rpx;
  color: #ff6b6b;
}

.group-btn {
  padding: 12rpx 28rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;
  font-size: 24rpx;
  border-radius: 32rpx;
  border: none;
}

/* 详情卡片 */
.detail-card {
  background: #fff;
  margin: 16rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.detail-header {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  text-align: center;
}

.detail-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.8;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.bar-icons {
  display: flex;
  gap: 24rpx;
  margin-right: 24rpx;
}

.bar-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  .iconfont {
    font-size: 40rpx;
    margin-bottom: 2rpx;
  }

  text {
    font-size: 20rpx;
    color: #666;
  }

  .cart-badge {
    position: absolute;
    top: -8rpx;
    right: -8rpx;
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

.bar-buttons {
  flex: 1;
  display: flex;
  gap: 16rpx;
}

.bar-buttons button {
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
  flex: 0.8;
}

.btn-buy {
  background: linear-gradient(135deg, #ffa940, #ffc53d);
  color: #fff;
}

.btn-flash {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;
  flex: 1.2;
}
</style>
