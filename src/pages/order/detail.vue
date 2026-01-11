<template>
  <view class="order-detail-page">
    <!-- 订单状态 -->
    <view class="order-status-card">
      <view class="status-icon">
        <text class="uni-icon">{{ statusIcon }}</text>
      </view>
      <view class="status-info">
        <text class="status-text">{{ statusText }}</text>
        <text v-if="order.status === 10" class="status-tip">请尽快支付，超时将自动取消</text>
        <text v-if="order.status === 30" class="status-tip">请注意查收快递</text>
      </view>
    </view>

    <!-- 收货地址 -->
    <view class="address-card">
      <view class="address-icon">
        <text class="uni-icon">&#xe611;</text>
      </view>
      <view class="address-info">
        <text class="receiver-name">{{ order.receiverName }}</text>
        <text class="receiver-phone">{{ order.receiverPhone }}</text>
        <text class="receiver-address">{{ order.receiverAddress }}</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="products-card">
      <view class="card-title">商品信息</view>
      <view class="product-list">
        <view
          v-for="item in order.items"
          :key="item.itemId"
          class="product-item"
        >
          <image class="product-image" :src="item.productImg" mode="aspectFill" />
          <view class="product-info">
            <text class="product-title">{{ item.productTitle }}</text>
            <text class="product-spec">规格：默认</text>
            <view class="product-footer">
              <text class="product-price">¥{{ item.salePrice.toFixed(2) }}</text>
              <text class="product-count">x{{ item.count }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="price-detail">
        <view class="price-row">
          <text class="price-label">商品总额</text>
          <text class="price-value">¥{{ order.totalAmount.toFixed(2) }}</text>
        </view>
        <view class="price-row">
          <text class="price-label">运费</text>
          <text class="price-value">¥0.00</text>
        </view>
        <view class="price-row total">
          <text class="price-label">实付款</text>
          <text class="price-value price-color">¥{{ order.payAmount.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="info-card">
      <view class="card-title">订单信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ order.orderNo }}</text>
          <text class="btn-copy" @tap="copyOrderNo">复制</text>
        </view>
        <view class="info-item">
          <text class="info-label">创建时间</text>
          <text class="info-value">{{ formatTime(order.createTime) }}</text>
        </view>
        <view v-if="order.payTime" class="info-item">
          <text class="info-label">支付时间</text>
          <text class="info-value">{{ formatTime(order.payTime) }}</text>
        </view>
        <view v-if="order.shipTime" class="info-item">
          <text class="info-label">发货时间</text>
          <text class="info-value">{{ formatTime(order.shipTime) }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <button
        v-if="order.status === 10"
        class="btn-cancel"
        @tap="cancelOrder"
      >
        取消订单
      </button>
      <button
        v-if="order.status === 10"
        class="btn-pay"
        @tap="payOrder"
      >
        去支付
      </button>
      <button
        v-if="order.status === 30"
        class="btn-confirm"
        @tap="confirmOrder"
      >
        确认收货
      </button>
      <button
        v-if="order.status === 40 || order.status === 50"
        class="btn-delete"
        @tap="deleteOrder"
      >
        删除订单
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { Order, OrderStatus } from '@/types'
import { getOrderDetail, cancelOrder as cancelOrderApi } from '@/api/order'
import { createPayment } from '@/api/payment'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

const order = ref<Order>({
  orderId: '',
  orderNo: '',
  userId: '',
  status: 10,
  totalAmount: 0,
  payAmount: 0,
  items: [],
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  createTime: ''
})

const statusText = computed(() => {
  const statusMap: Record<OrderStatus, string> = {
    10: '待支付',
    20: '待发货',
    30: '已发货',
    40: '已完成',
    50: '已取消'
  }
  return statusMap[order.value.status] || '未知状态'
})

const statusIcon = computed(() => {
  const iconMap: Record<OrderStatus, string> = {
    10: '\ue688', // 待支付
    20: '\ue69a', // 待发货
    30: '\ue695', // 已发货
    40: '\xe64a', // 已完成
    50: '\xe64b'  // 已取消
  }
  return iconMap[order.value.status] || '\ue688'
})

// 加载订单详情
const loadDetail = async (orderId: string) => {
  try {
    order.value = await getOrderDetail(orderId, userStore.userInfo!.userId)
  } catch (error) {
    console.error('加载订单详情失败:', error)
  }
}

// 格式化时间
const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 复制订单号
const copyOrderNo = () => {
  uni.setClipboardData({
    data: order.value.orderNo,
    success: () => {
      uni.showToast({
        title: '已复制',
        icon: 'success'
      })
    }
  })
}

// 取消订单
const cancelOrder = () => {
  uni.showModal({
    title: '提示',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrderApi(order.value.orderId)
          uni.showToast({
            title: '订单已取消',
            icon: 'success'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (error) {
          console.error('取消订单失败:', error)
        }
      }
    }
  })
}

// 支付订单
const payOrder = async () => {
  try {
    const payRes = await createPayment({
      userId: Number(userStore.userInfo!.userId),
      orderId: Number(order.value.orderId),
      payType: 'WECHAT'
    })

    uni.requestPayment({
      provider: 'wxpay',
      ...payRes.payParams,
      success: () => {
        uni.showToast({
          title: '支付成功',
          icon: 'success'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    })
  } catch (error) {
    console.error('支付失败:', error)
  }
}

// 确认收货
const confirmOrder = () => {
  uni.showModal({
    title: '提示',
    content: '确认已收到货吗？',
    success: (res) => {
      if (res.confirm) {
        // TODO: 调用确认收货接口
        uni.showToast({
          title: '确认成功',
          icon: 'success'
        })
      }
    }
  })
}

// 删除订单
const deleteOrder = () => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该订单吗？',
    success: (res) => {
      if (res.confirm) {
        // TODO: 调用删除订单接口
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}

onLoad((options: any) => {
  if (options.orderId) {
    loadDetail(options.orderId)
  }
})
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.order-status-card {
  display: flex;
  align-items: center;
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);

  .status-icon {
    width: 96rpx;
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    margin-right: 24rpx;

    .uni-icon {
      font-size: 56rpx;
      color: #fff;
    }
  }

  .status-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .status-text {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8rpx;
  }

  .status-tip {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.address-card {
  display: flex;
  align-items: flex-start;
  padding: 32rpx;
  background: #fff;
  margin-bottom: 16rpx;

  .address-icon {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 50%;
    margin-right: 24rpx;

    .uni-icon {
      font-size: 36rpx;
      color: #999;
    }
  }

  .address-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .receiver-name {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rpx;
  }

  .receiver-phone {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 8rpx;
  }

  .receiver-address {
    font-size: 26rpx;
    color: #666;
  }
}

.products-card,
.info-card {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.product-item {
  display: flex;
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.product-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 24rpx;
}

.product-title {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.product-spec {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8rpx;
}

.product-price {
  font-size: 28rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.product-count {
  font-size: 26rpx;
  color: #666;
}

.price-detail {
  margin-top: 32rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #f5f5f5;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }

  &.total {
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f5f5f5;
  }
}

.price-label {
  font-size: 26rpx;
  color: #666;
}

.price-value {
  font-size: 26rpx;
  color: #333;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  width: 160rpx;
  font-size: 26rpx;
  color: #999;
}

.info-value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.btn-copy {
  padding: 4rpx 16rpx;
  background: #f5f5f5;
  color: #666;
  font-size: 24rpx;
  border-radius: 6rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.06);
  gap: 16rpx;
}

.btn-cancel,
.btn-delete {
  padding: 16rpx 40rpx;
  background: #fff;
  color: #333;
  font-size: 28rpx;
  border: 1rpx solid #ddd;
  border-radius: 40rpx;

  &::after {
    border: none;
  }
}

.btn-pay,
.btn-confirm {
  padding: 16rpx 40rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;
  font-size: 28rpx;
  border-radius: 40rpx;
  border: none;

  &::after {
    border: none;
  }
}
</style>
