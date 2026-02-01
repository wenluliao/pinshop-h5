<template>
  <view class="tab-bar">
    <view
      v-for="item in tabList"
      :key="item.pagePath"
      class="tab-item"
      :class="{ active: currentPage === item.pagePath }"
      @tap="switchTab(item.pagePath)"
    >
      <text class="tab-icon">{{ item.activeIcon }}</text>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

interface TabItem {
  pagePath: string
  icon: string
  activeIcon: string
  text: string
}

const tabList: TabItem[] = [
  {
    pagePath: 'pages/index/index',
    icon: '🏠',
    activeIcon: '🏠',
    text: '首页'
  },
  {
    pagePath: 'pages/seckill/index',
    icon: '⚡',
    activeIcon: '⚡',
    text: '秒杀'
  },
  {
    pagePath: 'pages/cart/index',
    icon: '🛒',
    activeIcon: '🛒',
    text: '购物车'
  },
  {
    pagePath: 'pages/profile/index',
    icon: '👤',
    activeIcon: '👤',
    text: '我的'
  }
]

const currentPage = ref('pages/index/index')

onShow(() => {
  // 获取当前页面路径
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPagePath = pages[pages.length - 1].route || ''
    currentPage.value = currentPagePath
  }
})

const switchTab = (pagePath: string) => {
  if (currentPage.value === pagePath) return

  uni.switchTab({
    url: `/${pagePath}`
  })
}
</script>

<style lang="scss" scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  border-top: 1rpx solid #eee;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 0;
  transition: all 0.2s;

  &.active {
    .tab-icon {
      transform: scale(1.1);
    }

    .tab-text {
      color: #ff6b6b;
      font-weight: 600;
    }
  }
}

.tab-icon {
  font-size: 44rpx;
  margin-bottom: 4rpx;
  transition: transform 0.2s;
}

.tab-text {
  font-size: 20rpx;
  color: #7A7E83;
}
</style>
