<template>
  <view class="profile-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view v-if="userStore.isLogin" class="user-info">
        <image class="user-avatar" :src="userStore.userInfo?.avatarUrl" mode="aspectFill" />
        <view class="user-detail">
          <text class="user-name">{{ userStore.userInfo?.nickname }}</text>
          <text class="user-phone">{{ userStore.userInfo?.phone || '未绑定手机' }}</text>
        </view>
        <view class="user-actions">
          <text class="btn-logout" @tap="handleLogout">退出</text>
        </view>
      </view>
      <view v-else class="login-tip" @tap="handleLogin">
        <image class="default-avatar" src="/static/default-avatar.png" mode="aspectFill" />
        <text class="login-text">点击登录</text>
      </view>
    </view>

    <!-- 订单入口 -->
    <view class="order-entry">
      <view class="entry-header" @tap="goOrderList">
        <text class="entry-title">我的订单</text>
        <text class="entry-more">查看全部 ></text>
      </view>
      <view class="order-types">
        <view class="order-type" @tap="goOrderList(10)">
          <view class="type-icon-wrapper">
            <text class="type-icon">💰</text>
            <text v-if="orderCount.unpaid > 0" class="type-badge">{{ orderCount.unpaid }}</text>
          </view>
          <text class="type-label">待支付</text>
        </view>
        <view class="order-type" @tap="goOrderList(20)">
          <view class="type-icon-wrapper">
            <text class="type-icon">📦</text>
            <text v-if="orderCount.pending > 0" class="type-badge">{{ orderCount.pending }}</text>
          </view>
          <text class="type-label">待发货</text>
        </view>
        <view class="order-type" @tap="goOrderList(30)">
          <view class="type-icon-wrapper">
            <text class="type-icon">🚚</text>
            <text v-if="orderCount.shipped > 0" class="type-badge">{{ orderCount.shipped }}</text>
          </view>
          <text class="type-label">待收货</text>
        </view>
        <view class="order-type" @tap="goOrderList(0)">
          <view class="type-icon-wrapper">
            <text class="type-icon">✅</text>
          </view>
          <text class="type-label">已完成</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-list">
      <view class="menu-item" @tap="goAddress">
        <view class="menu-left">
          <text class="menu-icon">📍</text>
          <text class="menu-label">收货地址</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goCart">
        <view class="menu-left">
          <text class="menu-icon">🛒</text>
          <text class="menu-label">购物车</text>
        </view>
        <view class="menu-right">
          <text v-if="cartCount > 0" class="menu-badge">{{ cartCount }}</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
      <view class="menu-item" @tap="contactService">
        <view class="menu-left">
          <text class="menu-icon">💬</text>
          <text class="menu-label">联系客服</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="showAbout">
        <view class="menu-left">
          <text class="menu-icon">ℹ️</text>
          <text class="menu-label">关于我们</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <TabBar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore, useCartStore } from '@/stores'
import { getOrderCount } from '@/api/order'
import TabBar from '@/components/TabBar.vue'

const userStore = useUserStore()
const cartStore = useCartStore()

const orderCount = ref({
  unpaid: 0,
  pending: 0,
  shipped: 0,
  completed: 0
})

const cartCount = computed(() => cartStore.totalCount)

// 登录
const handleLogin = () => {
  uni.navigateTo({
    url: '/pages/login/index'
  })
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        orderCount.value = {
          unpaid: 0,
          pending: 0,
          shipped: 0,
          completed: 0
        }
      }
    }
  })
}

// 跳转订单列表
const goOrderList = (status?: number) => {
  if (!userStore.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }

  if (status !== undefined) {
    uni.navigateTo({
      url: `/pages/order/index?status=${status}`
    })
  } else {
    uni.navigateTo({
      url: '/pages/order/index'
    })
  }
}

// 跳转地址管理
const goAddress = () => {
  if (!userStore.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  uni.navigateTo({
    url: '/pages/address/index'
  })
}

// 跳转购物车
const goCart = () => {
  uni.switchTab({
    url: '/pages/cart/index'
  })
}

// 联系客服
const contactService = () => {
  uni.navigateTo({
    url: '/pages/customer-service/index'
  })
}

// 关于我们
const showAbout = () => {
  uni.showModal({
    title: '关于我们',
    content: 'PinShop 拼团秒杀小程序\n版本 v1.0.0',
    showCancel: false
  })
}

// 加载订单统计
const loadOrderCount = async () => {
  if (!userStore.isLogin) return

  try {
    orderCount.value = await getOrderCount(userStore.userInfo!.userId)
  } catch (error) {
    console.error('加载订单统计失败:', error)
  }
}

onMounted(() => {
  if (userStore.isLogin) {
    loadOrderCount()
  }
})

onShow(() => {
  // 页面显示时刷新订单统计
  if (userStore.isLogin) {
    loadOrderCount()
  }
})
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

.user-card {
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  margin-bottom: 16rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.user-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 24rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}

.user-phone {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.user-actions {
  .btn-logout {
    padding: 8rpx 24rpx;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 24rpx;
    border-radius: 24rpx;
  }
}

.login-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.default-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  margin-bottom: 16rpx;
}

.login-text {
  font-size: 32rpx;
  color: #fff;
}

.order-entry {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.entry-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.entry-more {
  font-size: 24rpx;
  color: #999;
}

.order-types {
  display: flex;
}

.order-type {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.type-icon-wrapper {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
  margin-bottom: 12rpx;
}

.type-icon {
  font-size: 44rpx;
  color: #666;
}

.type-badge {
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

.type-label {
  font-size: 24rpx;
  color: #666;
}

.menu-list {
  background: #fff;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 40rpx;
  color: #ff6b6b;
  margin-right: 16rpx;
}

.menu-label {
  font-size: 28rpx;
  color: #333;
}

.menu-right {
  display: flex;
  align-items: center;
}

.menu-badge {
  min-width: 32rpx;
  height: 32rpx;
  line-height: 32rpx;
  padding: 0 8rpx;
  background: #ff6b6b;
  color: #fff;
  font-size: 20rpx;
  text-align: center;
  border-radius: 16rpx;
  margin-right: 8rpx;
}

.menu-arrow {
  font-size: 32rpx;
  color: #999;
}
</style>
