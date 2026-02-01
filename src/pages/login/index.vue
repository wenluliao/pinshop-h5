<template>
  <view class="login-page">
    <view class="login-container">
      <!-- Logo区域 -->
      <view class="logo-section">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <text class="app-name">PinShop</text>
        <text class="app-slogan">品质生活，超值拼团</text>
      </view>

      <!-- 登录表单 -->
      <view class="login-form">
        <view class="form-item">
          <view class="input-wrapper">
            <text class="input-icon uni-icon">&#xe617;</text>
            <input
              class="input-field"
              type="text"
              placeholder="请输入账号"
              v-model="formData.username"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="form-item">
          <view class="input-wrapper">
            <text class="input-icon uni-icon">&#xe606;</text>
            <input
              class="input-field"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              v-model="formData.password"
              placeholder-class="input-placeholder"
            />
            <text class="eye-icon uni-icon" :class="{'eye-open': showPassword}" @tap="togglePassword">
              {{ showPassword ? '&#xe6bc;' : '&#xe6b9;' }}
            </text>
          </view>
        </view>

        <button
          class="btn-login"
          :class="{ 'disabled': isLoading }"
          :disabled="isLoading"
          @tap="handleLogin"
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </button>

        <view class="login-tips">
          <text class="tip-text">测试账号：test / 123456</text>
        </view>
      </view>

      <!-- 其他登录方式 -->
      <view class="other-login">
        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">其他登录方式</text>
          <view class="divider-line"></view>
        </view>

        <view class="wechat-login" @tap="handleWechatLogin">
          <view class="wechat-icon">
            <text class="uni-icon">&#xe6b8;</text>
          </view>
          <text class="wechat-text">微信登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

const formData = ref({
  username: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)

// 切换密码显示
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 账号密码登录
const handleLogin = async () => {
  const { username, password } = formData.value

  if (!username) {
    uni.showToast({
      title: '请输入账号',
      icon: 'none'
    })
    return
  }

  if (!password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return
  }

  try {
    isLoading.value = true

    // 调用账号密码登录
    await userStore.loginByPassword(username, password)

    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.switchTab({
        url: '/pages/profile/index'
      })
    }, 1500)
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 微信登录
const handleWechatLogin = async () => {
  try {
    // 获取登录凭证
    const loginRes = await uni.login({
      provider: 'weixin'
    })

    // 获取用户信息
    const profileRes = await uni.getUserProfile({
      desc: '用于完善用户资料'
    })

    // 调用微信登录
    await userStore.login(
      loginRes.code || '',
      profileRes.userInfo.nickName,
      profileRes.userInfo.avatarUrl
    )

    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.switchTab({
        url: '/pages/profile/index'
      })
    }, 1500)
  } catch (error: any) {
    console.error('微信登录失败:', error)
    uni.showToast({
      title: '登录失败',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}

.login-container {
  width: 100%;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;

  .logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 32rpx;
    border-radius: 32rpx;
    background: rgba(255, 255, 255, 0.3);
  }

  .app-name {
    font-size: 56rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 16rpx;
    letter-spacing: 4rpx;
  }

  .app-slogan {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
  }
}

.login-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 32rpx;

  &:last-of-type {
    margin-bottom: 48rpx;
  }
}

.input-wrapper {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  transition: all 0.3s ease;

  &:focus-within {
    background: #fff;
    box-shadow: 0 0 0 2rpx #ff6b6b;
  }
}

.input-icon {
  font-size: 36rpx;
  color: #999;
  margin-right: 16rpx;
}

.input-field {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  height: 44rpx;
  line-height: 44rpx;
}

.input-placeholder {
  color: #999;
}

.eye-icon {
  font-size: 36rpx;
  color: #999;
  margin-left: 16rpx;

  &.eye-open {
    color: #ff6b6b;
  }
}

.btn-login {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 44rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;

  &::after {
    border: none;
  }

  &:active:not(.disabled) {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.3);
  }

  &.disabled,
  &[disabled] {
    opacity: 0.6;
    box-shadow: none;
  }
}

.login-tips {
  margin-top: 32rpx;
  text-align: center;

  .tip-text {
    font-size: 24rpx;
    color: #999;
  }
}

.other-login {
  margin-top: 64rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 48rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: rgba(255, 255, 255, 0.3);
}

.divider-text {
  padding: 0 24rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.wechat-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);

  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
}

.wechat-icon {
  width: 96rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #07c160;
  border-radius: 50%;
  margin-bottom: 16rpx;

  .uni-icon {
    font-size: 56rpx;
    color: #fff;
  }
}

.wechat-text {
  font-size: 28rpx;
  color: #fff;
}
</style>
