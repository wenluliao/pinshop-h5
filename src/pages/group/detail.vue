<template>
  <view class="group-detail-page">
    <!-- 拼团状态 -->
    <view class="group-status-card" :class="'status-' + groupDetail.session.status">
      <view class="status-icon">
        <text class="uni-icon">{{ statusIcon }}</text>
      </view>
      <view class="status-info">
        <text class="status-text">{{ statusText }}</text>
        <text v-if="groupDetail.session.status === 'ACTIVE'" class="status-tip">
          还差{{ groupDetail.session.missingNum }}人成团
        </text>
      </view>
    </view>

    <!-- 拼团信息 -->
    <view class="group-info-card">
      <view class="info-header">
        <text class="info-title">拼团信息</text>
        <Countdown
          v-if="groupDetail.session.status === 'ACTIVE'"
          :end-time="groupDetail.session.expireTime"
          label="剩余"
        />
      </view>

      <view class="group-progress">
        <view class="progress-text">
          <text>已拼{{ groupDetail.session.currentNum }}人</text>
          <text>还差{{ groupDetail.session.missingNum }}人</text>
        </view>
        <ProgressBar
          :current="groupDetail.session.currentNum"
          :total="groupDetail.session.requiredNum"
        />
      </view>
    </view>

    <!-- 拼团成员 -->
    <view class="group-members-card">
      <view class="members-title">拼团成员 ({{ groupDetail.members.length }}人)</view>
      <view class="members-list">
        <view
          v-for="(member, index) in groupDetail.members"
          :key="member.recordId"
          class="member-item"
        >
          <image class="member-avatar" :src="member.userAvatar" mode="aspectFill" />
          <view class="member-info">
            <text class="member-name">{{ member.userName }}</text>
            <text class="member-role">{{ member.isLeader ? '团长' : '团员' }}</text>
          </view>
          <view class="member-status">
            <text class="status-dot" :class="'status-' + member.status"></text>
            <text class="status-text">{{ getMemberStatusText(member.status) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <button
        v-if="groupDetail.session.status === 'ACTIVE' && !hasJoined"
        class="btn-join"
        @tap="joinGroup"
      >
        参与拼团
      </button>
      <button
        v-if="groupDetail.session.status === 'COMPLETED'"
        class="btn-view"
        @tap="viewOrder"
      >
        查看订单
      </button>
      <button
        v-if="groupDetail.session.status === 'FAILED'"
        class="btn-home"
        @tap="goHome"
      >
        返回首页
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { GroupDetail } from '@/types'
import { getGroupDetail, joinGroup as joinGroupApi } from '@/api/group'
import { useUserStore } from '@/stores'
import Countdown from '@/components/Countdown.vue'
import ProgressBar from '@/components/ProgressBar.vue'

const userStore = useUserStore()

const groupDetail = ref<GroupDetail>({
  session: {
    sessionId: '',
    skuId: 0,
    initiatorId: 0,
    initiatorAvatar: '',
    initiatorName: '',
    requiredNum: 0,
    currentNum: 0,
    missingNum: 0,
    expireTime: 0,
    status: 'ACTIVE',
    createTime: 0
  },
  members: []
})

const statusText = computed(() => {
  const statusMap = {
    'ACTIVE': '拼团进行中',
    'COMPLETED': '拼团成功',
    'EXPIRED': '拼团已过期',
    'CANCELLED': '拼团已取消'
  }
  return statusMap[groupDetail.value.session.status] || '未知状态'
})

const statusIcon = computed(() => {
  const iconMap = {
    'ACTIVE': '\ue629',
    'COMPLETED': '\xe64a',
    'EXPIRED': '\xe64b',
    'CANCELLED': '\xe64b'
  }
  return iconMap[groupDetail.value.session.status] || '\ue629'
})

const hasJoined = computed(() => {
  return groupDetail.value.members.some(
    m => m.userId === Number(userStore.userInfo?.userId)
  )
})

// 加载拼团详情
const loadDetail = async (sessionId: string) => {
  try {
    groupDetail.value = await getGroupDetail(sessionId)
  } catch (error) {
    console.error('加载拼团详情失败:', error)
  }
}

// 获取成员状态文本
const getMemberStatusText = (status: string) => {
  const statusMap = {
    'ACTIVE': '参与中',
    'COMPLETED': '已成功',
    'FAILED': '已失败'
  }
  return statusMap[status] || '未知'
}

// 参与拼团
const joinGroup = async () => {
  if (!userStore.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }

  try {
    await joinGroupApi(groupDetail.value.session.sessionId)
    uni.showToast({
      title: '参与成功',
      icon: 'success'
    })

    // 重新加载详情
    loadDetail(groupDetail.value.session.sessionId)
  } catch (error) {
    console.error('参与拼团失败:', error)
  }
}

// 查看订单
const viewOrder = () => {
  uni.navigateTo({
    url: '/pages/order/index'
  })
}

// 返回首页
const goHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

onLoad((options: any) => {
  if (options.sessionId) {
    loadDetail(options.sessionId)
  }
})
</script>

<style lang="scss" scoped>
.group-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.group-status-card {
  display: flex;
  align-items: center;
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, #ffd93d, #ffe08a);

  &.status-COMPLETED {
    background: linear-gradient(135deg, #4cd964, #7eeba0);
  }

  &.status-EXPIRED,
  &.status-CANCELLED {
    background: linear-gradient(135deg, #999, #bbb);
  }

  .status-icon {
    width: 96rpx;
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.3);
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

.group-info-card {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.info-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.group-progress {
  .progress-text {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
    font-size: 26rpx;
    color: #666;
  }
}

.group-members-card {
  background: #fff;
  padding: 32rpx;
}

.members-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.members-list {
  .member-item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }
  }
}

.member-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.member-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.member-role {
  font-size: 22rpx;
  color: #999;
}

.member-status {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 8rpx;

  &.status-ACTIVE {
    background: #ffd93d;
  }

  &.status-COMPLETED {
    background: #4cd964;
  }

  &.status-FAILED {
    background: #999;
  }
}

.status-text {
  font-size: 24rpx;
  color: #999;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.btn-join,
.btn-view,
.btn-home {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  border: none;

  &::after {
    border: none;
  }
}

.btn-view {
  background: linear-gradient(135deg, #4cd964, #7eeba0);
}

.btn-home {
  background: #999;
}
</style>
