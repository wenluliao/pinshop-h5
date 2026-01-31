<template>
  <view class="settlement-page">
    <!-- 代收点选择 -->
    <view class="section">
      <view class="section-title">
        <text class="title">选择代收点</text>
        <text class="change-btn" @tap="goPickupPoint">
          {{ selectedPoint ? '更换' : '选择' }}
        </text>
      </view>

      <view v-if="selectedPoint" class="pickup-point-card" @tap="goPickupPoint">
        <view class="point-info">
          <text class="point-name">{{ selectedPoint.name }}</text>
          <text class="point-address">{{ selectedPoint.address }}</text>
          <text class="point-hours">营业时间: {{ selectedPoint.businessHours }}</text>
        </view>
      </view>
      <view v-else class="pickup-point-empty" @tap="goPickupPoint">
        <text class="empty-text">请选择代收点</text>
      </view>
    </view>

    <!-- 配送信息 -->
    <view class="section">
      <view class="section-title">配送信息</view>
      <view class="delivery-info-card">
        <view class="delivery-row">
          <text class="label">配送日期</text>
          <text class="value highlight">{{ deliveryDateText }}</text>
        </view>
        <view class="delivery-tip">
          <text class="tip-icon">ℹ️</text>
          <text class="tip-text">订单将在配送日送达指定代收点</text>
        </view>
      </view>
    </view>

    <!-- 订单明细 -->
    <view class="section">
      <view class="section-title">订单明细</view>
      <view class="order-items">
        <view v-for="item in cartItems" :key="item.skuId" class="order-item">
          <image class="item-image" :src="item.imgUrl" mode="aspectFill" />
          <view class="item-info">
            <text class="item-title">{{ item.title }}</text>
            <text class="item-spec">x{{ item.count }}</text>
            <text class="item-price">¥{{ (item.salePrice * item.count).toFixed(2) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 费用明细 -->
    <view class="section">
      <view class="section-title">费用明细</view>
      <view class="fee-detail">
        <view class="fee-row">
          <text class="label">商品总额</text>
          <text class="value">¥{{ totalAmount.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 提交订单栏 -->
    <view class="submit-bar">
      <view class="total-section">
        <text class="total-label">合计：</text>
        <text class="total-amount">¥{{ totalAmount.toFixed(2) }}</text>
      </view>
      <button class="submit-btn" @tap="submitOrder">
        提交订单
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useCartStore, useUserStore } from '@/stores'

const userStore = useUserStore()
const cartStore = useCartStore()

const selectedPoint = ref<any>(null)
const loading = ref(false)

// 计算属性
const cartItems = computed(() => cartStore.selectedItems)
const totalAmount = computed(() => cartStore.selectedTotal)

// 计算配送日期文本
const deliveryDateText = computed(() => {
  const now = new Date()
  const hour = now.getHours()

  if (hour < 22) {
    // 0-22点：明日达
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return `${tomorrow.getMonth() + 1}月${tomorrow.getDate()}日`
  } else {
    // 22-24点：后日达
    const dayAfter = new Date(now)
    dayAfter.setDate(dayAfter.getDate() + 2)
    return `${dayAfter.getMonth() + 1}月${dayAfter.getDate()}日`
  }
})

onLoad((options: any) => {
  // 从购物车结算
  if (options.from === 'cart') {
    // 检查用户是否选择了商品
    if (cartItems.value.length === 0) {
      uni.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  }
})

// 去选择代收点
const goPickupPoint = () => {
  uni.navigateTo({
    url: '/pages/pickup-point/select?mode=settlement'
  })
}

// 提交订单
const submitOrder = () => {
  if (!selectedPoint.value) {
    uni.showToast({
      title: '请选择代收点',
      icon: 'none'
    })
    return
  }

  try {
    loading.value = true

    // 模拟订单提交
    uni.showToast({
      title: '订单提交成功',
      icon: 'success'
    })

    // 清空购物车
    cartStore.clearSelected()

    // 延迟跳转到订单列表
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/order/index'
      })
    }, 1500)
  } catch (error: any) {
    console.error('提交订单失败:', error)
    uni.showToast({
      title: error.message || '提交失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.settlement-page {
  min-height: 100vh;
  background: #fafafa;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.section {
  background: #fff;
  margin: 24rpx;
  padding: 32rpx;
  border-radius: 16rpx;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;

  .title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1a1a1a;
  }
}

.change-btn {
  font-size: 26rpx;
  color: #ff6b6b;
}

.pickup-point-card {
  padding: 24rpx;
  background: linear-gradient(135deg, #fff5f5, #ffe8e8);
  border-radius: 12rpx;
  border: 1rpx solid #ffcece;
}

.pickup-point-empty {
  padding: 24rpx;
  background: #f7f7f7;
  border-radius: 12rpx;
  text-align: center;

  .empty-text {
    font-size: 26rpx;
    color: #999;
  }
}

.point-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.point-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.point-address {
  font-size: 24rpx;
  color: #666;
}

.point-hours {
  font-size: 22rpx;
  color: #999;
}

.delivery-info-card {
  padding: 24rpx;
  background: #f7f7f7;
  border-radius: 12rpx;
}

.delivery-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;

  .label {
    font-size: 26rpx;
    color: #666;
  }

  .value {
    font-size: 28rpx;
    color: #1a1a1a;
    font-weight: 500;

    &.highlight {
      color: #ff6b6b;
      font-weight: 600;
    }
  }
}

.delivery-tip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx;
  background: #fff9e5;
  border-radius: 8rpx;
  margin-top: 8rpx;

  .tip-icon {
    font-size: 28rpx;
  }

  .tip-text {
    font-size: 22rpx;
    color: #ff9800;
  }
}

.order-items {
  .order-item {
    display: flex;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }
  }
}

.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-title {
  font-size: 28rpx;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-spec {
  font-size: 24rpx;
  color: #999;
}

.item-price {
  font-size: 28rpx;
  color: #ff6b6b;
  font-weight: 600;
}

.fee-detail {
  .fee-row {
    display: flex;
    justify-content: space-between;
    padding: 12rpx 0;

    .label {
      font-size: 26rpx;
      color: #666;
    }

    .value {
      font-size: 28rpx;
      color: #1a1a1a;
    }
  }
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.total-section {
  margin-right: 24rpx;

  .total-label {
    font-size: 26rpx;
    color: #666;
  }

  .total-amount {
    font-size: 40rpx;
    font-weight: 700;
    color: #ff6b6b;
  }
}

.submit-btn {
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  border-radius: 40rpx;
  border: none;

  &[disabled] {
    background: #ccc;
  }
}
</style>
