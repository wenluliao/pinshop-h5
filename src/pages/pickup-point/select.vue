<template>
  <view class="pickup-point-page">
    <!-- 顶部栏 -->
    <view class="header">
      <text class="title">选择代收点</text>
    </view>

    <!-- 当前位置 -->
    <view class="current-location" @tap="refreshLocation">
      <text class="location-icon">📍</text>
      <text class="location-text">{{ locationText }}</text>
      <text class="refresh-btn">刷新</text>
    </view>

    <!-- 代收点列表 -->
    <scroll-view class="point-list" scroll-y>
      <view
        v-for="point in pickupPoints"
        :key="point.id"
        class="point-card"
        :class="{ selected: selectedPoint?.id === point.id }"
        @tap="selectPoint(point)"
      >
        <view class="point-main">
          <view class="point-name">{{ point.name }}</view>
          <view class="point-address">{{ point.address }}</view>
          <view class="point-meta">
            <text class="point-hours">{{ point.businessHours }}</text>
          </view>
        </view>

        <view class="point-tag" v-if="selectedPoint?.id === point.id">
          <text class="tag-icon">✓</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部确认按钮 -->
    <view class="footer" v-if="selectedPoint">
      <button class="confirm-btn" @tap="confirm">
        确认选择
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const pickupPoints = ref<any[]>([])
const selectedPoint = ref<any>(null)
const locationText = ref('获取位置中...')

onLoad((options: any) => {
  // 加载代收点列表
  loadPickupPoints()

  // 获取位置
  getLocation()
})

const loadPickupPoints = async () => {
  try {
    // 模拟代收点数据
    pickupPoints.value = [
      {
        id: 1,
        name: '小区便利店',
        address: 'XX小区1号楼底商',
        phone: '138****1234',
        businessHours: '08:00-22:00',
        latitude: 39.9042,
        longitude: 116.4074,
        deliveryRange: 1000
      },
      {
        id: 2,
        name: '社区服务站',
        address: 'XX社区服务中心',
        phone: '139****5678',
        businessHours: '08:00-22:00',
        latitude: 39.9142,
        longitude: 116.4174,
        deliveryRange: 1000
      }
    ]
  } catch (error) {
    console.error('加载代收点失败:', error)
  }
}

const getLocation = () => {
  uni.getLocation({
    type: 'wgs84',
    success: (res: any) => {
      locationText.value = '当前位置'
      // 可以根据位置加载附近代收点
    },
    fail: () => {
      locationText.value = '无法获取位置'
    }
  })
}

const refreshLocation = () => {
  getLocation()
}

const selectPoint = (point: any) => {
  selectedPoint.value = point
}

const confirm = () => {
  if (!selectedPoint.value) return

  // 保存选择的代收点到本地存储
  uni.setStorageSync('selectedPickupPoint', selectedPoint.value)

  uni.showToast({
    title: '已选择代收点',
    icon: 'success'
  })

  setTimeout(() => {
    uni.navigateBack()
  }, 500)
}
</script>

<style lang="scss" scoped>
.pickup-point-page {
  min-height: 100vh;
  background: #fafafa;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.current-location {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #fff;
  margin-top: 2rpx;

  .location-icon {
    font-size: 32rpx;
    margin-right: 8rpx;
  }

  .location-text {
    flex: 1;
    font-size: 26rpx;
    color: #1a1a1a;
  }

  .refresh-btn {
    font-size: 24rpx;
    color: #ff6b6b;
  }
}

.point-list {
  padding: 24rpx;
}

.point-card {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;

  &.selected {
    border-color: #ff6b6b;
    background: linear-gradient(135deg, #fff5f5, #ffe8e8);
  }

  &:active {
    opacity: 0.8;
  }
}

.point-main {
  flex: 1;
}

.point-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.point-address {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.point-meta {
  display: flex;
  gap: 16rpx;
  font-size: 22rpx;
  color: #999;
}

.point-tag {
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16rpx;

  .tag-icon {
    color: #fff;
    font-size: 32rpx;
  }
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  border-radius: 44rpx;
  border: none;
  text-align: center;
}
</style>
