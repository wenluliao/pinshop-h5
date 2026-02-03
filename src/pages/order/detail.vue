<template>
  <view class="order-detail-page">
    <!-- 订单状态 -->
    <view v-if="order" class="order-status-card">
      <view class="status-icon">
        <text class="status-emoji">{{ statusIcon }}</text>
      </view>
      <view class="status-info">
        <text class="status-text">{{ statusText }}</text>
        <text v-if="order.status === 0" class="status-tip">请尽快支付，超时将自动取消</text>
      </view>
    </view>

    <!-- 收货地址 -->
    <view v-if="order" class="address-card">
      <view class="address-icon">📍</view>
      <view class="address-info">
        <text class="receiver-name">{{ order.receiverName || '' }}</text>
        <text class="receiver-phone">{{ order.receiverPhone || '' }}</text>
        <text class="receiver-address">{{ order.receiverAddress || '' }}</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view v-if="order && order.items" class="products-card">
      <view class="card-title">商品信息</view>
      <view class="product-list">
        <view
          v-for="item in order.items"
          :key="item.itemId"
          class="product-item"
        >
          <image class="product-image" :src="item.productImg || '/static/placeholder.png'" mode="aspectFill" />
          <view class="product-info">
            <text class="product-title">{{ item.productTitle }}</text>
            <text v-if="item.specs" class="product-spec">规格：{{ item.specs }}</text>
            <text v-else class="product-spec">规格：默认</text>
            <view class="product-footer">
              <text class="product-price">¥{{ (item.salePrice || 0).toFixed(2) }}</text>
              <text class="product-count">x{{ item.count || 0 }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="price-detail">
        <view class="price-row">
          <text class="price-label">商品总额</text>
          <text class="price-value">¥{{ (order.totalAmount || 0).toFixed(2) }}</text>
        </view>
        <view class="price-row">
          <text class="price-label">运费</text>
          <text class="price-value">¥0.00</text>
        </view>
        <view class="price-row total">
          <text class="price-label">实付款</text>
          <text class="price-value price-color">¥{{ (order.payAmount || 0).toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view v-if="order" class="info-card">
      <view class="card-title">订单信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ order.orderNo || '' }}</text>
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
        <view v-if="currentPaymentId" class="info-item">
          <text class="info-label">交易单号</text>
          <text class="info-value">{{ currentPaymentId }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view v-if="order" class="bottom-bar">
      <!-- 待支付状态 -->
      <template v-if="order.status === 0">
        <button
          class="btn-cancel"
          @tap="cancelOrder"
        >
          取消订单
        </button>
        <!-- 测试按钮（仅Mock模式） -->
        <button
          v-if="payConfig.showTestButton && currentPaymentId"
          class="btn-test"
          @tap="testPaySuccess"
        >
          🧪 测试：模拟支付成功
        </button>
        <button
          class="btn-pay"
          @tap="payOrder"
        >
          立即支付
        </button>
      </template>

      <!-- 已支付/待发货 -->
      <template v-if="order.status === 1">
        <text class="status-tip-inline">等待商家发货</text>
      </template>

      <!-- 已取消 -->
      <template v-if="order.status === 50">
        <button class="btn-delete" @tap="deleteOrder">
          删除订单
        </button>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import type { Order, OrderStatus, PayConfig } from '@/types'
import { getOrderDetail, cancelOrder as cancelOrderApi, getOrderStatus } from '@/api/order'
import { createPayment, getPaymentConfig, testPaymentSuccess as testPaymentSuccessApi } from '@/api/payment'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

// 添加标志，防止onShow在初始加载时重复请求
let isInitialLoad = true

const order = ref<Order>({
  orderId: '',
  orderNo: '',
  userId: '',
  status: 0,
  totalAmount: 0,
  payAmount: 0,
  items: [],
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  createTime: ''
})

const payConfig = ref<PayConfig>({
  mode: 'mock',
  showTestButton: false,
  autoPayTimeout: 0
})

const currentPaymentId = ref<string>('')
let pollingTimer: number | null = null

const statusText = computed(() => {
  if (!order.value) return '加载中...'
  const statusMap: Record<number, string> = {
    0: '待支付',
    1: '已支付',
    20: '待发货',
    30: '已发货',
    40: '已完成',
    50: '已取消'
  }
  return statusMap[order.value.status] || '未知状态'
})

const statusIcon = computed(() => {
  if (!order.value) return '⏳'
  const iconMap: Record<number, string> = {
    0: '💰',  // 待支付
    1: '✅',  // 已支付
    20: '📦', // 待发货
    30: '🚚', // 已发货
    40: '✨', // 已完成
    50: '❌'  // 已取消
  }
  return iconMap[order.value.status] || '💰'
})

// 加载订单详情
const loadDetail = async (orderId: string) => {
  try {
    if (!userStore.userInfo || !userStore.userInfo.userId) {
      console.error('用户未登录')
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

    order.value = await getOrderDetail(orderId, userStore.userInfo.userId)
  } catch (error) {
    console.error('加载订单详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

// 加载支付配置
const loadPayConfig = async () => {
  try {
    payConfig.value = await getPaymentConfig()
  } catch (error) {
    console.error('加载支付配置失败:', error)
  }
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
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
          // 停止轮询
          stopPolling()
          // 刷新订单详情
          await loadDetail(order.value.orderId)
        } catch (error) {
          console.error('取消订单失败:', error)
          uni.showToast({
            title: '取消失败',
            icon: 'none'
          })
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

    // 保存支付ID用于测试
    currentPaymentId.value = payRes.paymentId

    if (payConfig.value.mode === 'mock') {
      // Mock模式：直接提示成功
      uni.showToast({
        title: '支付请求已创建（Mock模式）',
        icon: 'success',
        duration: 2000
      })

      // 开始轮询支付状态
      startPolling()

      // 如果显示测试按钮，提示用户
      if (payConfig.value.showTestButton) {
        setTimeout(() => {
          uni.showModal({
            title: '测试提示',
            content: '这是Mock模式，请点击"测试：模拟支付成功"按钮完成支付',
            showCancel: false
          })
        }, 500)
      }
    } else {
      // 生产模式：唤起微信支付
      uni.requestPayment({
        provider: 'wxpay',
        timeStamp: payRes.timeStamp!,
        nonceStr: payRes.nonceStr!,
        package: payRes.packageValue!,
        signType: payRes.signType!,
        paySign: payRes.paySign!,
        success: () => {
          uni.showToast({
            title: '支付成功',
            icon: 'success'
          })
          // 开始轮询订单状态
          startPolling()
        },
        fail: (error) => {
          console.error('支付失败:', error)
          uni.showToast({
            title: '支付失败',
            icon: 'none'
          })
        }
      })
    }
  } catch (error) {
    console.error('支付失败:', error)
    uni.showToast({
      title: '支付失败',
      icon: 'none'
    })
  }
}

// 测试：模拟支付成功
const testPaySuccess = async () => {
  if (!currentPaymentId.value) {
    uni.showToast({
      title: '请先发起支付',
      icon: 'none'
    })
    return
  }

  try {
    await testPaymentSuccessApi(currentPaymentId.value)

    uni.showToast({
      title: '模拟支付成功',
      icon: 'success'
    })

    // 刷新订单详情
    await loadDetail(order.value.orderId)
  } catch (error) {
    console.error('测试支付失败:', error)
    uni.showToast({
      title: '测试支付失败',
      icon: 'none'
    })
  }
}

// 开始轮询订单状态
const startPolling = () => {
  if (pollingTimer) {
    return
  }

  const maxAttempts = 60  // 最多轮询60次（5分钟）
  let attempts = 0

  pollingTimer = setInterval(async () => {
    attempts++

    try {
      const status = await getOrderStatus(order.value.orderId, userStore.userInfo!.userId)

      // 如果订单已支付或取消，停止轮询
      if (status === 1 || status === 50) {
        stopPolling()
        await loadDetail(order.value.orderId)

        if (status === 1) {
          uni.showToast({
            title: '支付成功',
            icon: 'success'
          })
        }
      } else if (attempts >= maxAttempts) {
        // 超时
        stopPolling()
        uni.showToast({
          title: '查询超时，请刷新页面',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('查询订单状态失败:', error)
      if (attempts >= maxAttempts) {
        stopPolling()
        uni.showToast({
          title: '查询失败，请刷新页面',
          icon: 'none'
        })
      }
    }
  }, 5000)  // 每5秒轮询一次
}

// 停止轮询
const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
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
  if (options && options.orderId) {
    loadDetail(options.orderId)
    loadPayConfig()
  } else {
    console.error('缺少orderId参数')
    uni.showToast({
      title: '订单ID不存在',
      icon: 'none'
    })
  }
})

onShow(() => {
  // 跳过初始加载时的onShow
  if (isInitialLoad) {
    isInitialLoad = false
    return
  }

  // 页面显示时刷新订单详情
  if (order.value && order.value.orderId) {
    loadDetail(order.value.orderId)
  }
})

// 组件卸载时停止轮询
onUnload(() => {
  stopPolling()
})
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
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

    .status-emoji {
      font-size: 56rpx;
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
    font-size: 36rpx;
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

  &.price-color {
    color: #ff6b6b;
    font-weight: bold;
    font-size: 32rpx;
  }
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
  word-break: break-all;
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

.btn-test {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #ffa94d, #ffc078);
  color: #fff;
  font-size: 26rpx;
  border-radius: 40rpx;
  border: none;

  &::after {
    border: none;
  }
}

.btn-pay {
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

.status-tip-inline {
  font-size: 26rpx;
  color: #999;
}
</style>
