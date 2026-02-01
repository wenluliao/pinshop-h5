<template>
  <view class="service-page">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="header-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">联系客服</text>
      <view class="header-placeholder"></view>
    </view>

    <!-- 客服时间 -->
    <view class="service-time-card">
      <text class="time-icon">🕐</text>
      <view class="time-info">
        <text class="time-title">服务时间</text>
        <text class="time-desc">工作日 9:00 - 18:00</text>
        <text class="time-desc">节假日 10:00 - 17:00</text>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-actions">
      <view class="action-item" @tap="makePhoneCall">
        <view class="action-icon">📞</view>
        <text class="action-label">电话咨询</text>
        <text class="action-value">400-888-9999</text>
      </view>
      <view class="action-item" @tap="copyWechat">
        <view class="action-icon">💬</view>
        <text class="action-label">微信客服</text>
        <text class="action-value">pinshop_service</text>
      </view>
    </view>

    <!-- 常见问题 -->
    <view class="faq-section">
      <view class="section-title">常见问题</view>
      <view class="faq-list">
        <view class="faq-item" v-for="(item, index) in faqList" :key="index" @tap="toggleFaq(index)">
          <view class="faq-question">
            <text class="question-text">{{ item.question }}</text>
            <text class="faq-arrow" :class="{ expanded: expandedIndex === index }">▼</text>
          </view>
          <view class="faq-answer" v-if="expandedIndex === index">
            <text class="answer-text">{{ item.answer }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="footer-tip">
      <text class="tip-text">如需更多帮助，请拨打客服热线</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 状态栏高度
const statusBarHeight = ref(0)

// 展开的问题索引
const expandedIndex = ref(-1)

// 常见问题列表
const faqList = ref([
  {
    question: '如何下单购买商品？',
    answer: '您可以在商品详情页点击"加入购物车"或"立即购买"按钮，选择数量后即可下单。支持微信支付和支付宝支付。'
  },
  {
    question: '下单后可以修改订单吗？',
    answer: '订单提交后，在未支付前可以取消订单重新下单。支付后如需修改，请联系客服处理。'
  },
  {
    question: '商品如何配送？',
    answer: '我们采用快递配送，下单后48小时内发货。偏远地区可能需要3-5天到达，请耐心等待。'
  },
  {
    question: '收到商品不满意可以退换吗？',
    answer: '支持7天无理由退换货。商品需保持原包装完好，不影响二次销售。请在收到商品后7天内联系客服办理。'
  },
  {
    question: '如何申请退款？',
    answer: '在订单详情页点击"申请退款"，填写退款原因并提交。我们会在1-3个工作日审核，审核通过后原路退回。'
  },
  {
    question: '优惠券如何使用？',
    answer: '在结算页可以选择可用的优惠券，每个订单限用一张。优惠券不可兑换现金，不找零。'
  }
])

// 获取系统信息
const getSystemInfo = () => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 拨打电话
const makePhoneCall = () => {
  uni.makePhoneCall({
    phoneNumber: '400-888-9999'
  })
}

// 复制微信号
const copyWechat = () => {
  uni.setClipboardData({
    data: 'pinshop_service',
    success: () => {
      uni.showToast({
        title: '微信号已复制',
        icon: 'success'
      })
    }
  })
}

// 展开/收起问题
const toggleFaq = (index: number) => {
  if (expandedIndex.value === index) {
    expandedIndex.value = -1
  } else {
    expandedIndex.value = index
  }
}

// 页面加载
onLoad(() => {
  getSystemInfo()
})
</script>

<style lang="scss" scoped>
.service-page {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 状态栏占位 */
.status-bar {
  background: #fff;
}

/* 顶部标题栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.header-back {
  width: 80rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 48rpx;
  color: #333;
  font-weight: 300;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.header-placeholder {
  width: 80rpx;
}

/* 客服时间卡片 */
.service-time-card {
  display: flex;
  align-items: center;
  background: #fff;
  margin: 24rpx;
  padding: 32rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.time-icon {
  font-size: 64rpx;
  margin-right: 24rpx;
}

.time-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.time-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.time-desc {
  font-size: 24rpx;
  color: #666;
}

/* 快捷入口 */
.quick-actions {
  display: flex;
  gap: 24rpx;
  margin: 0 24rpx 24rpx;
}

.action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 32rpx 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.action-icon {
  font-size: 56rpx;
  margin-bottom: 16rpx;
}

.action-label {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.action-value {
  font-size: 22rpx;
  color: #ff6b6b;
}

/* 常见问题 */
.faq-section {
  background: #fff;
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.faq-item {
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
}

.question-text {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.faq-arrow {
  font-size: 20rpx;
  color: #999;
  transition: transform 0.3s;

  &.expanded {
    transform: rotate(180deg);
  }
}

.faq-answer {
  padding-bottom: 24rpx;
}

.answer-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}

/* 底部提示 */
.footer-tip {
  padding: 32rpx;
  text-align: center;
}

.tip-text {
  font-size: 22rpx;
  color: #999;
}
</style>
