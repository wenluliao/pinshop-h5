<template>
  <view class="address-edit-page">
    <view class="form-item">
      <text class="label">收货人</text>
      <input class="input" v-model="form.receiverName" placeholder="请输入收货人姓名" />
    </view>
    <view class="form-item">
      <text class="label">联系电话</text>
      <input class="input" v-model="form.receiverPhone" type="tel" placeholder="请输入手机号" />
    </view>
    <view class="form-item">
      <text class="label">所在地区</text>
      <input class="input" v-model="form.region" placeholder="请选择地区" />
    </view>
    <view class="form-item">
      <text class="label">详细地址</text>
      <textarea class="textarea" v-model="form.detailAddress" placeholder="请输入详细地址" />
    </view>
    <view class="form-item">
      <text class="label">默认地址</text>
      <switch :checked="form.isDefault" @change="onDefaultChange" />
    </view>
    <button class="save-btn" @tap="onSave">保存地址</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { addAddress, updateAddress } from '@/api/user'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const form = ref({
  receiverName: '',
  receiverPhone: '',
  region: '',
  detailAddress: '',
  isDefault: 0  // 0: 非默认, 1: 默认
})

const onDefaultChange = (e: any) => {
  form.value.isDefault = e.detail.value ? 1 : 0
}

const onSave = async () => {
  // 表单验证
  if (!form.value.receiverName) {
    return uni.showToast({ title: '请输入收货人', icon: 'none' })
  }
  if (!form.value.receiverPhone) {
    return uni.showToast({ title: '请输入手机号', icon: 'none' })
  }
  if (!form.value.region) {
    return uni.showToast({ title: '请选择地区', icon: 'none' })
  }
  if (!form.value.detailAddress) {
    return uni.showToast({ title: '请输入详细地址', icon: 'none' })
  }

  try {
    const userId = userStore.userInfo?.userId
    if (!userId) {
      return uni.showToast({ title: '请先登录', icon: 'none' })
    }

    const addressData = {
      ...form.value,
      userId
    }

    await addAddress(addressData)

    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error: any) {
    console.error('保存地址失败:', error)
    uni.showToast({
      title: error.message || '保存失败',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.address-edit-page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f5f5;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 24rpx;
  background: #fff;
  border-radius: 12rpx;

  .label {
    width: 160rpx;
    font-size: 28rpx;
    color: #333;
  }

  .input {
    flex: 1;
    font-size: 28rpx;
  }

  .textarea {
    flex: 1;
    height: 120rpx;
    font-size: 28rpx;
  }
}

.save-btn {
  margin-top: 48rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;
  border-radius: 48rpx;
}
</style>
