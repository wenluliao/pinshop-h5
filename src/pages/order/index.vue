<template>
  <view class="order-page">
    <!-- 顶部标签栏 -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @tap="switchTab(tab.value)"
      >
        <text class="tab-label">{{ tab.label }}</text>
        <text v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view class="order-list" scroll-y @scrolltolower="loadMore">
      <view v-if="orders.length === 0 && !loading" class="empty-state">
        <image class="empty-image" src="/static/empty-order.png" mode="aspectFit" />
        <text class="empty-text">暂无订单</text>
      </view>

      <view v-for="order in orders" :key="order.orderId" class="order-item" @tap="goDetail(order.orderId)">
        <view class="order-header">
          <text class="order-no">订单号：{{ order.orderNo }}</text>
          <text class="order-status" :class="'status-' + order.status">
            {{ getStatusText(order.status) }}
          </text>
        </view>

        <view class="order-products">
          <view
            v-for="item in order.items"
            :key="item.itemId"
            class="product-item"
          >
            <image class="product-image" :src="item.productImg" mode="aspectFill" />
            <view class="product-info">
              <text class="product-title text-ellipsis">{{ item.productTitle }}</text>
              <text class="product-price">¥{{ item.salePrice.toFixed(2) }} x{{ item.count }}</text>
            </view>
          </view>
        </view>

        <view class="order-footer">
          <text class="order-total">
            共{{ getTotalCount(order) }}件 实付
            <text class="price-color">¥{{ order.payAmount.toFixed(2) }}</text>
          </text>
        </view>

        <view class="order-actions">
          <button
            v-if="order.status === 10"
            class="btn-cancel"
            size="mini"
            @tap.stop="cancelOrder(order.orderId)"
          >
            取消订单
          </button>
          <button
            v-if="order.status === 10"
            class="btn-pay"
            size="mini"
            @tap.stop="payOrder(order)"
          >
            去支付
          </button>
          <button
            v-if="order.status === 30"
            class="btn-confirm"
            size="mini"
            @tap.stop="confirmOrder(order.orderId)"
          >
            确认收货
          </button>
        </view>
      </view>

      <view class="load-more" v-if="!finished">
        <uni-load-more :status="loadingStatus" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import type { Order, OrderStatus } from '@/types'
import { getOrderList, cancelOrder as cancelOrderApi, getOrderCount } from '@/api/order'
import { createPayment } from '@/api/payment'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

const tabs = ref([
  { label: '全部', value: 0, count: 0 },
  { label: '待支付', value: 10, count: 0 },
  { label: '待发货', value: 20, count: 0 },
  { label: '已发货', value: 30, count: 0 },
  { label: '已完成', value: 40, count: 0 }
])

const currentTab = ref(0)
const orders = ref<Order[]>([])
const loading = ref(false)
const finished = ref(false)
const pageNum = ref(1)

const loadingStatus = ref<'more' | 'loading' | 'noMore'>('more')

// 切换标签
const switchTab = (value: number) => {
  currentTab.value = value
  pageNum.value = 1
  orders.value = []
  finished.value = false
  loadOrders()
}

// 加载订单列表
const loadOrders = async () => {
  if (!userStore.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }

  if (loading.value || finished.value) return

  loading.value = true
  loadingStatus.value = 'loading'

  try {
    const res = await getOrderList({
      userId: userStore.userInfo!.userId,
      status: currentTab.value === 0 ? undefined : currentTab.value,
      pageNum: pageNum.value,
      pageSize: 10
    })

    if (pageNum.value === 1) {
      orders.value = res.list
    } else {
      orders.value = [...orders.value, ...res.list]
    }

    if (res.list.length < 10) {
      finished.value = true
      loadingStatus.value = 'noMore'
    } else {
      loadingStatus.value = 'more'
    }
  } catch (error) {
    console.error('加载订单失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!finished.value && !loading.value) {
    pageNum.value++
    loadOrders()
  }
}

// 获取订单状态文本
const getStatusText = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, string> = {
    10: '待支付',
    20: '待发货',
    30: '已发货',
    40: '已完成',
    50: '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取商品总数
const getTotalCount = (order: Order) => {
  return order.items.reduce((sum, item) => sum + item.count, 0)
}

// 跳转详情
const goDetail = (orderId: string) => {
  uni.navigateTo({
    url: `/pages/order/detail?orderId=${orderId}`
  })
}

// 取消订单
const cancelOrder = async (orderId: string) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrderApi(orderId)
          uni.showToast({
            title: '订单已取消',
            icon: 'success'
          })
          pageNum.value = 1
          orders.value = []
          loadOrders()
        } catch (error) {
          console.error('取消订单失败:', error)
        }
      }
    }
  })
}

// 支付订单
const payOrder = async (order: Order) => {
  try {
    const payRes = await createPayment({
      userId: Number(userStore.userInfo!.userId),
      orderId: Number(order.orderId),
      payType: 'WECHAT'
    })

    // 调起微信支付
    uni.requestPayment({
      provider: 'wxpay',
      ...payRes.payParams,
      success: () => {
        uni.showToast({
          title: '支付成功',
          icon: 'success'
        })
        pageNum.value = 1
        orders.value = []
        loadOrders()
      },
      fail: (error) => {
        console.error('支付失败:', error)
        uni.showToast({
          title: '支付失败',
          icon: 'none'
        })
      }
    })
  } catch (error) {
    console.error('创建支付失败:', error)
  }
}

// 确认收货
const confirmOrder = (orderId: string) => {
  uni.showModal({
    title: '提示',
    content: '确认已收到货吗？',
    success: async (res) => {
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

// 加载订单统计
const loadOrderCount = async () => {
  if (!userStore.isLogin) return

  try {
    const count = await getOrderCount(userStore.userInfo!.userId)
    tabs.value[1].count = count.unpaid
    tabs.value[2].count = count.pending
    tabs.value[3].count = count.shipped
    tabs.value[4].count = count.completed
  } catch (error) {
    console.error('加载订单统计失败:', error)
  }
}

onLoad(() => {
  loadOrders()
  loadOrderCount()
})

onShow(() => {
  // 从详情页返回时刷新列表
  if (orders.value.length > 0) {
    pageNum.value = 1
    orders.value = []
    loadOrders()
  }
})
</script>

<style lang="scss" scoped>
.order-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  position: relative;
  flex: 1;
  height: 88rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &.active {
    .tab-label {
      color: #ff6b6b;
      font-weight: bold;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 6rpx;
      background: #ff6b6b;
      border-radius: 3rpx;
    }
  }
}

.tab-label {
  font-size: 28rpx;
  color: #333;
}

.tab-badge {
  position: absolute;
  top: 8rpx;
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

.order-list {
  flex: 1;
  padding: 24rpx 32rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;

  .empty-image {
    width: 400rpx;
    height: 400rpx;
  }

  .empty-text {
    margin-top: 32rpx;
    font-size: 28rpx;
    color: #999;
  }
}

.order-item {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;

  .order-no {
    font-size: 26rpx;
    color: #666;
  }

  .order-status {
    font-size: 26rpx;
    font-weight: bold;

    &.status-10 {
      color: #ff6b6b;
    }

    &.status-20 {
      color: #ffd93d;
    }

    &.status-30 {
      color: #4cd964;
    }

    &.status-40 {
      color: #999;
    }
  }
}

.order-products {
  padding: 24rpx 32rpx;
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

.product-price {
  font-size: 26rpx;
  color: #666;
}

.order-footer {
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f5f5f5;
  text-align: right;

  .order-total {
    font-size: 26rpx;
    color: #666;
  }
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  padding: 16rpx 32rpx;
  border-top: 1rpx solid #f5f5f5;
  gap: 16rpx;
}

.btn-cancel,
.btn-confirm {
  padding: 12rpx 32rpx;
  background: #fff;
  color: #333;
  font-size: 26rpx;
  border: 1rpx solid #ddd;
  border-radius: 32rpx;

  &::after {
    border: none;
  }
}

.btn-pay {
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;
  font-size: 26rpx;
  border-radius: 32rpx;
  border: none;

  &::after {
    border: none;
  }
}

.load-more {
  padding: 32rpx 0;
}
</style>
