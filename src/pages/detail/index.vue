<template>
  <view class="detail-page">
    <!-- 商品图片 -->
    <swiper class="product-swiper" circular :indicator-dots="true">
      <swiper-item v-for="(img, index) in product.images" :key="index">
        <image class="product-image" :src="img" mode="aspectFill" @tap="previewImage(index)" />
      </swiper-item>
    </swiper>

    <!-- 秒杀信息 -->
    <view v-if="product.flashPrice" class="flash-info">
      <view class="flash-price">
        <text class="price-symbol">¥</text>
        <text class="price-integer">{{ integerPart(product.flashPrice) }}</text>
        <text class="price-decimal">.{{ decimalPart(product.flashPrice) }}</text>
        <text class="price-original">¥{{ product.salePrice }}</text>
      </view>
      <Countdown :end-time="product.flashEndTime!" label="距结束" />
      <ProgressBar :current="product.sales || 0" :total="product.stock + (product.sales || 0)" />
    </view>

    <!-- 商品信息 -->
    <view class="product-info">
      <text class="product-title">{{ product.title }}</text>
      <view v-if="product.subtitle" class="product-subtitle">
        {{ product.subtitle }}
      </view>

      <view v-if="product.tags && product.tags.length" class="product-tags">
        <text v-for="(tag, index) in product.tags" :key="index" class="product-tag">
          {{ tag }}
        </text>
      </view>

      <view class="product-footer">
        <text class="product-price price-color">
          ¥{{ (product.flashPrice || product.salePrice).toFixed(2) }}
        </text>
        <text class="product-stock">库存{{ product.stock }}件</text>
      </view>
    </view>

    <!-- 拼团信息 -->
    <view v-if="groupSessions.length > 0" class="group-sessions">
      <view class="group-header">
        <text class="group-title">正在拼团</text>
        <text class="group-more" @tap="showMoreGroups">查看更多 ></text>
      </view>
      <view class="group-list">
        <view
          v-for="session in groupSessions.slice(0, 3)"
          :key="session.sessionId"
          class="group-item"
          @tap="joinGroup(session)"
        >
          <image class="group-avatar" :src="session.initiatorAvatar" />
          <view class="group-info">
            <text class="group-name">{{ session.initiatorName }}</text>
            <text class="group-missing">还差{{ session.missingNum }}人成团</text>
          </view>
          <button class="group-btn" size="mini">去拼团</button>
          <Countdown :end-time="session.expireTime" :inline="true" />
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="product-detail">
      <view class="detail-title">商品详情</view>
      <view class="detail-content">
        <rich-text :nodes="product.content"></rich-text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bar-icons">
        <view class="bar-icon" @tap="goHome">
          <text class="uni-icon">&#xe61d;</text>
          <text>首页</text>
        </view>
        <view class="bar-icon" @tap="addToCart">
          <text class="uni-icon">&#xe607;</text>
          <text>购物车</text>
          <text v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</text>
        </view>
      </view>
      <button class="btn-buy" @tap="openSkuSelector('normal')">
        {{ product.flashPrice ? '单独购买' : '立即购买' }}
      </button>
      <button v-if="product.flashPrice" class="btn-flash" @tap="openSkuSelector('flash')">
        秒杀抢购
      </button>
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
import ProgressBar from '@/components/ProgressBar.vue'

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

// 加载商品详情
const loadDetail = async (skuId: number) => {
  try {
    product.value = await getProductDetail(skuId)

    // 加载拼团会话
    if (product.value.skuId) {
      groupSessions.value = await getGroupSessions(product.value.skuId)
    }
  } catch (error) {
    console.error('加载详情失败:', error)
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
        eventId: 0, // TODO: 从后端获取
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
    // 普通购买 - 加入购物车
    cartStore.addToCart(product.value, quantity)
    uni.showToast({
      title: '已加入购物车',
      icon: 'success'
    })
  }
}

// 加入购物车
const addToCart = () => {
  cartStore.addToCart(product.value, 1)
  uni.showToast({
    title: '已加入购物车',
    icon: 'success'
  })
}

// 参与拼团
const joinGroup = (session: GroupSession) => {
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
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.product-swiper {
  width: 100%;
  height: 750rpx;
}

.product-image {
  width: 100%;
  height: 100%;
}

.flash-info {
  padding: 32rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);

  &-price {
    display: flex;
    align-items: baseline;
    margin-bottom: 16rpx;

    .price-symbol {
      font-size: 32rpx;
      color: #fff;
    }

    .price-integer {
      font-size: 56rpx;
      font-weight: bold;
      color: #fff;
    }

    .price-decimal {
      font-size: 32rpx;
      color: #fff;
    }

    .price-original {
      margin-left: 16rpx;
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: line-through;
    }
  }
}

.product-info {
  padding: 32rpx;
  background: #fff;
  margin-bottom: 16rpx;

  &-title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.5;
  }

  &-subtitle {
    margin-top: 16rpx;
    font-size: 28rpx;
    color: #666;
  }

  &-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-top: 16rpx;
  }

  &-tag {
    padding: 6rpx 16rpx;
    background: #fff4f4;
    color: #ff6b6b;
    font-size: 22rpx;
    border-radius: 6rpx;
    border: 1rpx solid #ffcece;
  }

  &-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 24rpx;
  }

  &-price {
    font-size: 48rpx;
    font-weight: bold;
  }

  &-stock {
    font-size: 24rpx;
    color: #999;
  }
}

.group-sessions {
  padding: 32rpx;
  background: #fff;
  margin-bottom: 16rpx;

  .group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;
  }

  .group-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .group-more {
    font-size: 24rpx;
    color: #999;
  }

  .group-item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }
  }

  .group-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 16rpx;
  }

  .group-info {
    flex: 1;
    display: flex;
    flex-direction: column;

    .group-name {
      font-size: 28rpx;
      color: #333;
    }

    .group-missing {
      font-size: 24rpx;
      color: #ff6b6b;
      margin-top: 4rpx;
    }
  }

  .group-btn {
    margin-left: 16rpx;
    padding: 8rpx 24rpx;
    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    color: #fff;
    font-size: 24rpx;
    border-radius: 32rpx;
    border: none;
  }
}

.product-detail {
  padding: 32rpx;
  background: #fff;

  .detail-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
  }

  .detail-content {
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.06);

  .bar-icons {
    display: flex;
    flex: 1;
  }

  .bar-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 32rpx;
    position: relative;

    .uni-icon {
      font-size: 44rpx;
      color: #666;
    }

    text {
      font-size: 20rpx;
      color: #666;
      margin-top: 4rpx;
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

  button {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 28rpx;
    border-radius: 40rpx;
    border: none;

    &::after {
      border: none;
    }
  }

  .btn-buy {
    margin-right: 16rpx;
    background: #ffd93d;
    color: #333;
  }

  .btn-flash {
    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    color: #fff;
  }
}
</style>
