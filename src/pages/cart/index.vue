<template>
  <view class="cart-page">
    <!-- 购物车列表 -->
    <scroll-view class="cart-list" scroll-y>
      <view v-if="cartStore.items.length === 0" class="empty-state">
        <image class="empty-image" src="/static/empty-cart.png" mode="aspectFit" />
        <text class="empty-text">购物车空空如也</text>
        <button class="btn-go-shopping" @tap="goShopping">去逛逛</button>
      </view>

      <view v-else class="cart-items">
        <view
          v-for="item in cartStore.items"
          :key="item.skuId"
          class="cart-item"
        >
          <view class="item-checkbox" @tap="cartStore.toggleSelect(item.skuId)">
            <text class="checkbox-icon">{{ item.selected ? '✓' : '' }}</text>
          </view>

          <image class="item-image" :src="item.imgUrl" mode="aspectFill" />

          <view class="item-info">
            <text class="item-title text-ellipsis-2">{{ item.title }}</text>
            <view class="item-footer">
              <text class="item-price price-color">¥{{ item.salePrice.toFixed(2) }}</text>
              <view class="item-stepper">
                <view class="stepper-btn" @tap="updateCount(item.skuId, item.count - 1)">
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
      </view>
    </scroll-view>

    <!-- 底部结算栏 -->
    <view v-if="cartStore.items.length > 0" class="bottom-bar">
      <view class="select-all" @tap="cartStore.toggleSelectAll">
        <text class="checkbox-icon">{{ cartStore.isAllSelected ? '✓' : '' }}</text>
        <text class="select-all-label">全选</text>
      </view>

      <view class="total-info">
        <text class="total-label">合计:</text>
        <text class="total-value price-color">¥{{ cartStore.selectedTotal.toFixed(2) }}</text>
      </view>

      <button
        class="btn-checkout"
        :disabled="cartStore.selectedCount === 0"
        @tap="checkout"
      >
        结算({{ cartStore.selectedCount }})
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores'

const cartStore = useCartStore()

// 更新数量
const updateCount = (skuId: number, count: number) => {
  cartStore.updateCount(skuId, count)
}

// 移除商品
const removeItem = (skuId: number) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该商品吗？',
    success: (res) => {
      if (res.confirm) {
        cartStore.removeFromCart(skuId)
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

  // TODO: 跳转到结算页面
  uni.showToast({
    title: '结算功能开发中',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.cart-list {
  flex: 1;
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

  .btn-go-shopping {
    margin-top: 48rpx;
    padding: 16rpx 48rpx;
    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    color: #fff;
    font-size: 28rpx;
    border-radius: 40rpx;
    border: none;

    &::after {
      border: none;
    }
  }
}

.cart-items {
  padding: 24rpx 32rpx;
}

.cart-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  position: relative;
}

.item-checkbox {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  margin-right: 16rpx;
  flex-shrink: 0;

  .checkbox-icon {
    font-size: 32rpx;
    color: #fff;
  }

  &.selected {
    background: #ff6b6b;
    border-color: #ff6b6b;

    .checkbox-icon {
      color: #fff;
    }
  }
}

.item-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 24rpx;
  overflow: hidden;
}

.item-title {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: auto;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.item-price {
  font-size: 32rpx;
  font-weight: bold;
}

.item-stepper {
  display: flex;
  align-items: center;
  border: 1rpx solid #ddd;
  border-radius: 6rpx;
}

.stepper-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #666;
  background: #f5f5f5;
}

.stepper-value {
  width: 80rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #333;
  border-left: 1rpx solid #ddd;
  border-right: 1rpx solid #ddd;
  background: #fff;
}

.item-delete {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 8rpx;

  .uni-icon {
    font-size: 36rpx;
    color: #999;
  }
}

.bottom-bar {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.select-all {
  display: flex;
  align-items: center;
  margin-right: 24rpx;

  .checkbox-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44rpx;
    height: 44rpx;
    border: 2rpx solid #ddd;
    border-radius: 50%;
    margin-right: 12rpx;
    font-size: 32rpx;
    color: #fff;
  }

  &.selected {
    .checkbox-icon {
      background: #ff6b6b;
      border-color: #ff6b6b;
    }
  }
}

.select-all-label {
  font-size: 26rpx;
  color: #666;
}

.total-info {
  flex: 1;
  text-align: right;
}

.total-label {
  font-size: 26rpx;
  color: #666;
  margin-right: 8rpx;
}

.total-value {
  font-size: 36rpx;
  font-weight: bold;
}

.btn-checkout {
  margin-left: 24rpx;
  padding: 16rpx 40rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;
  font-size: 28rpx;
  border-radius: 40rpx;
  border: none;

  &::after {
    border: none;
  }

  &[disabled] {
    background: #ccc;
  }
}
</style>
