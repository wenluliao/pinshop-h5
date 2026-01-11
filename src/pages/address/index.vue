<template>
  <view class="address-page">
    <!-- 地址列表 -->
    <scroll-view class="address-list" scroll-y>
      <view v-if="addresses.length === 0" class="empty-state">
        <image class="empty-image" src="/static/empty-address.png" mode="aspectFit" />
        <text class="empty-text">暂无收货地址</text>
      </view>

      <view
        v-for="address in addresses"
        :key="address.addressId"
        class="address-item"
      >
        <view class="address-content" @tap="editAddress(address)">
          <view class="address-header">
            <text class="receiver-name">{{ address.receiverName }}</text>
            <text class="receiver-phone">{{ address.receiverPhone }}</text>
            <text v-if="address.isDefault === 1" class="default-badge">默认</text>
          </view>
          <view class="address-detail">
            {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detailAddr }}
          </view>
        </view>

        <view class="address-actions">
          <view class="action-item" @tap="setDefault(address.addressId)">
            <text class="action-radio" :class="{ checked: address.isDefault === 1 }">
              {{ address.isDefault === 1 ? '●' : '○' }}
            </text>
            <text class="action-label">默认地址</text>
          </view>
          <view class="action-buttons">
            <text class="btn-edit" @tap="editAddress(address)">编辑</text>
            <text class="btn-delete" @tap="deleteAddress(address.addressId)">删除</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 新增地址按钮 -->
    <view class="add-button">
      <button class="btn-add" @tap="addAddress">+ 新增地址</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import type { Address } from '@/types'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

const addresses = ref<Address[]>([])
const from = ref('') // 来源：order-从订单页进入

// 加载地址列表
const loadAddresses = async () => {
  if (!userStore.isLogin) return

  try {
    addresses.value = await userStore.getAddresses()
  } catch (error) {
    console.error('加载地址失败:', error)
  }
}

// 设置默认地址
const setDefault = async (addressId: string) => {
  try {
    await userStore.setDefaultAddress(addressId)
    uni.showToast({
      title: '设置成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('设置默认地址失败:', error)
  }
}

// 编辑地址
const editAddress = (address: Address) => {
  uni.navigateTo({
    url: `/pages/address/edit?addressId=${address.addressId}`
  })
}

// 删除地址
const deleteAddress = (addressId: string) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该地址吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await userStore.deleteAddress(addressId)
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
        } catch (error) {
          console.error('删除地址失败:', error)
        }
      }
    }
  })
}

// 新增地址
const addAddress = () => {
  uni.navigateTo({
    url: '/pages/address/edit'
  })
}

onLoad((options: any) => {
  if (options.from) {
    from.value = options.from
  }
})

onShow(() => {
  loadAddresses()
})
</script>

<style lang="scss" scoped>
.address-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.address-list {
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

.address-item {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.address-content {
  padding: 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.receiver-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-right: 16rpx;
}

.receiver-phone {
  font-size: 28rpx;
  color: #666;
  margin-right: 16rpx;
}

.default-badge {
  padding: 4rpx 12rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;
  font-size: 20rpx;
  border-radius: 6rpx;
}

.address-detail {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.address-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
}

.action-item {
  display: flex;
  align-items: center;
}

.action-radio {
  font-size: 36rpx;
  color: #ddd;
  margin-right: 8rpx;

  &.checked {
    color: #ff6b6b;
  }
}

.action-label {
  font-size: 26rpx;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 24rpx;
}

.btn-edit,
.btn-delete {
  font-size: 26rpx;
  color: #666;
}

.btn-delete {
  color: #ff6b6b;
}

.add-button {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
}

.btn-add {
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
</style>
