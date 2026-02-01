<template>
  <view class="cart-page">
    <!-- 购物车列表 -->
    <scroll-view class="cart-list" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <view v-if="cartStore.items.length === 0" class="empty-state">
        <view class="empty-icon">
          <text class="uni-icon">&#xe607;</text>
        </view>
        <text class="empty-title">购物车还是空的</text>
        <text class="empty-subtitle">快去挑选心仪的商品吧</text>
        <button class="btn-go-shopping" @tap="goShopping">去逛逛</button>
      </view>

      <view v-else class="cart-items">
        <transition-group name="cart-item">
          <view
            v-for="item in cartStore.itemsWithInfo"
            :key="item.skuId"
            class="cart-item"
            :class="{ 'item-selected': item.selected }"
            @touchstart="touchStart($event, item.skuId)"
            @touchmove="touchMove($event, item.skuId)"
            @touchend="touchEnd($event, item.skuId)"
          >
            <view class="item-checkbox" :class="{ 'checked': item.selected }" @tap="cartStore.toggleSelect(item.skuId)">
              <text class="checkbox-icon">{{ item.selected ? '✓' : '' }}</text>
            </view>

            <image class="item-image" :src="item.imgUrl" mode="aspectFill" lazy-load />

            <view class="item-info">
              <text class="item-title text-ellipsis-2">{{ item.title }}</text>
              <text v-if="formatSpec(item)" class="item-spec">{{ formatSpec(item) }}</text>
              <view class="item-footer">
                <view class="price-wrapper">
                  <text class="item-price price-color">¥{{ item.salePrice.toFixed(2) }}</text>
                  <text v-if="item.originalPrice && item.originalPrice > item.salePrice" class="item-original">¥{{ item.originalPrice.toFixed(2) }}</text>
                </view>
                <view class="item-stepper">
                  <view
                    class="stepper-btn"
                    :class="{ 'disabled': item.count <= 1 }"
                    @tap="updateCount(item.skuId, item.count - 1)"
                  >
                    <text>-</text>
                  </view>
                  <view class="stepper-value">{{ item.count }}</view>
                  <view class="stepper-btn" @tap="updateCount(item.skuId, item.count + 1)">
                    <text>+</text>
                  </view>
                </view>
              </view>
            </view>

            <view class="item-delete" @tap="removeItem(item.skuId)">
              <text class="uni-icon">&#xe627;</text>
            </view>
          </view>
        </transition-group>
      </view>
    </scroll-view>

    <!-- 底部结算栏 -->
    <view v-if="cartStore.itemsWithInfo.length > 0" class="bottom-bar">
      <view class="select-all" :class="{ 'checked': cartStore.isAllSelected }" @tap="cartStore.toggleSelectAll">
        <text class="checkbox-icon">{{ cartStore.isAllSelected ? '✓' : '' }}</text>
        <text class="select-all-label">全选</text>
      </view>

      <view class="total-info">
        <text class="total-label">合计:</text>
        <text class="total-value price-color">¥{{ cartStore.selectedTotal.toFixed(2) }}</text>
      </view>

      <button
        class="btn-checkout"
        :class="{ 'disabled': cartStore.selectedCount === 0 }"
        :disabled="cartStore.selectedCount === 0"
        @tap="checkout"
      >
        结算({{ cartStore.selectedCount }})
      </button>
    </view>

    <!-- 底部导航栏 -->
    <TabBar />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useCartStore } from '@/stores'
import TabBar from '@/components/TabBar.vue'

const cartStore = useCartStore()

// 下拉刷新状态
const refreshing = ref(false)

// 页面显示时加载购物车商品详情
onShow(() => {
  cartStore.loadCart()
})

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  try {
    await cartStore.refreshCart()
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('刷新购物车失败:', error)
    uni.showToast({
      title: '刷新失败',
      icon: 'none'
    })
  } finally {
    refreshing.value = false
  }
}

// 解析规格JSON字符串，返回可读文本
const formatSpec = (item: any): string => {
  // 优先使用 weightSpec
  if (item.weightSpec) {
    return item.weightSpec
  }

  // 其次使用 specification
  if (item.specification) {
    try {
      const specObj = JSON.parse(item.specification)
      if (typeof specObj === 'object') {
        const values = Object.values(specObj)
        if (values.length > 0) {
          return values.join(' / ')
        }
      }
      if (typeof specObj === 'string') {
        return specObj
      }
    } catch (e) {
      return item.specification
    }
  }

  return ''
}

// 左滑删除相关状态
const touchStartX = ref(0)
const touchStartY = ref(0)
const itemTranslateX = ref<Record<number, number>>({})

// 触摸开始
const touchStart = (e: any, skuId: number) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
}

// 触摸移动
const touchMove = (e: any, skuId: number) => {
  const deltaX = e.touches[0].clientX - touchStartX.value
  const deltaY = e.touches[0].clientY - touchStartY.value

  // 只响应水平滑动
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    itemTranslateX.value[skuId] = Math.max(-180, Math.min(0, deltaX))
  }
}

// 触摸结束
const touchEnd = (e: any, skuId: number) => {
  const translateX = itemTranslateX.value[skuId] || 0

  // 滑动超过一半则展开，否则收回
  if (translateX < -90) {
    itemTranslateX.value[skuId] = -180
  } else {
    itemTranslateX.value[skuId] = 0
  }
}

// 更新数量
const updateCount = (skuId: number, count: number) => {
  if (count < 1) return
  cartStore.updateCount(skuId, count)
}

// 移除商品
const removeItem = (skuId: number) => {
  uni.showModal({
    title: '确定删除该商品？',
    content: '删除后可以从商品详情页重新添加',
    confirmColor: '#ff6b6b',
    success: (res) => {
      if (res.confirm) {
        cartStore.removeFromCart(skuId)
        // 清理该商品的滑动状态
        delete itemTranslateX.value[skuId]
      }
    }
  })
}

// 去购物
const goShopping = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

// 结算
const checkout = () => {
  if (cartStore.selectedCount === 0) {
    uni.showToast({
      title: '请选择商品',
      icon: 'none'
    })
    return
  }

  // 跳转到结算页面
  uni.navigateTo({
    url: '/pages/settlement/index?from=cart'
  })
}
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(240rpx + env(safe-area-inset-bottom));
}

.cart-list {
  flex: 1;
}

// 空状态优化
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 240rpx;

  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fff5f5, #ffe8e8);
    border-radius: 50%;
    margin-bottom: 48rpx;
    animation: float 3s ease-in-out infinite;

    .uni-icon {
      font-size: 100rpx;
      color: #ff6b6b;
    }
  }

  .empty-title {
    font-size: 32rpx;
    color: #333;
    font-weight: 600;
    margin-bottom: 16rpx;
  }

  .empty-subtitle {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 64rpx;
  }

  .btn-go-shopping {
    padding: 24rpx 64rpx;
    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    color: #fff;
    font-size: 30rpx;
    font-weight: 600;
    border-radius: 48rpx;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.4);

    &::after {
      border: none;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
}

.cart-items {
  padding: 16rpx 24rpx;
}

// 商品卡片动画
.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cart-item-enter-from {
  opacity: 0;
  transform: translateX(-100rpx);
}

.cart-item-leave-to {
  opacity: 0;
  transform: translateX(100rpx);
}

.cart-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  position: relative;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  overflow: hidden;

  // 选中状态
  &.item-selected {
    border: 2rpx solid #ff6b6b;
    box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.15);
  }

  &:active {
    transform: scale(0.98);
  }
}

// 复选框优化 - 圆角方形
.item-checkbox {
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  background: #fff;

  .checkbox-icon {
    font-size: 24rpx;
    color: #fff;
    opacity: 0;
    transform: scale(0);
    transition: all 0.2s ease;
  }

  &.checked {
    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    border-color: #ff6b6b;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);

    .checkbox-icon {
      opacity: 1;
      transform: scale(1);
    }
  }
}

.item-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 20rpx;
  overflow: hidden;
  min-height: 160rpx;
}

.item-title {
  font-size: 28rpx;
  color: #1a1a1a;
  line-height: 1.4;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.item-spec {
  font-size: 22rpx;
  color: #999;
  margin-bottom: auto;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.price-wrapper {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.item-price {
  font-size: 36rpx;
  font-weight: 700;
  letter-spacing: -0.5rpx;
}

.item-original {
  font-size: 22rpx;
  color: #999;
  text-decoration: line-through;
}

// 数量选择器优化
.item-stepper {
  display: flex;
  align-items: center;
  border-radius: 36rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.stepper-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #666;
  background: #f7f7f7;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.9);
  }

  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

.stepper-value {
  width: 80rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  background: #fff;
  border-left: 1rpx solid #eee;
  border-right: 1rpx solid #eee;
}

.item-delete {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  padding: 12rpx;
  opacity: 0;
  transition: opacity 0.2s ease;

  .uni-icon {
    font-size: 40rpx;
    color: #999;
  }

  &:active {
    .uni-icon {
      color: #ff6b6b;
    }
  }
}

.cart-item:hover .item-delete {
  opacity: 1;
}

// 悬浮结算栏 - 参考美团设计
.bottom-bar {
  position: fixed;
  bottom: calc(100rpx + env(safe-area-inset-bottom)); // 在底部导航栏上方
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
  z-index: 999; // 确保在导航栏下方但在其他元素上方
}

.select-all {
  display: flex;
  align-items: center;
  margin-right: 24rpx;

  .checkbox-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36rpx;
    height: 36rpx;
    border: 2rpx solid #ddd;
    border-radius: 8rpx;
    margin-right: 12rpx;
    font-size: 24rpx;
    color: #fff;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    background: #fff;
  }

  &.checked {
    .checkbox-icon {
      background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
      border-color: #ff6b6b;
      box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
      opacity: 1;
    }
  }
}

.select-all-label {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.total-info {
  flex: 1;
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  padding-right: 24rpx;
}

.total-label {
  font-size: 24rpx;
  color: #999;
  margin-right: 8rpx;
}

.total-value {
  font-size: 40rpx;
  font-weight: 700;
  letter-spacing: -0.5rpx;
}

.btn-checkout {
  padding: 0 48rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: 36rpx;
  border: none;
  box-shadow: 0 6rpx 20rpx rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
  }

  &.disabled,
  &[disabled] {
    background: #e5e5e5;
    box-shadow: none;
    opacity: 0.6;
  }
}

// 价格颜色
.price-color {
  color: #ff4444;
}
</style>
