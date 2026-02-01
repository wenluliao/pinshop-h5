<template>
  <uni-popup ref="popup" type="bottom" :safe-area="false">
    <view class="sku-selector" v-if="visible">
      <view class="sku-header">
        <image class="sku-image" :src="product.imgUrl" mode="aspectFill" />
        <view class="sku-info">
          <text class="sku-price price-color">¥{{ selectedPrice }}</text>
          <text class="sku-stock">库存：{{ product.stock }}件</text>
          <text class="sku-selected">已选：{{ quantity }}件</text>
        </view>
        <view class="sku-close" @tap="close">
          <text class="uni-icon">&#xe100;</text>
        </view>
      </view>

      <view class="sku-content">
        <scroll-view scroll-y class="sku-scroll">
          <!-- 数量选择 -->
          <view class="sku-section">
            <text class="sku-label">购买数量</text>
            <view class="sku-stepper">
              <view
                class="stepper-btn"
                :class="{ disabled: quantity <= 1 }"
                @tap="quantity > 1 && quantity--"
              >
                <text class="uni-icon">&#xe609;</text>
              </view>
              <view class="stepper-value">{{ quantity }}</view>
              <view
                class="stepper-btn"
                :class="{ disabled: quantity >= product.stock }"
                @tap="quantity < product.stock && quantity++"
              >
                <text class="uni-icon">&#xe61b;</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="sku-footer">
        <button class="btn-confirm" @tap="onConfirm">确认</button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Product } from '@/types'

interface Props {
  product: Product
}

const props = defineProps<Props>()

const emit = defineEmits<{
  confirm: [quantity: number]
}>()

const popup = ref()
const quantity = ref(1)
const visible = ref(false) // 控制弹窗显示

const selectedPrice = computed(() => {
  return props.product.flashPrice || props.product.salePrice
})

const open = () => {
  quantity.value = 1
  visible.value = true
  popup.value?.open()
}

const close = () => {
  visible.value = false
  popup.value?.close()
}

const onConfirm = () => {
  emit('confirm', quantity.value)
  close()
}

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
.sku-selector {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;

  &-header {
    display: flex;
    padding: 32rpx;
    position: relative;
  }

  &-image {
    width: 180rpx;
    height: 180rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
  }

  &-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    margin-left: 24rpx;
  }

  &-price {
    font-size: 40rpx;
    font-weight: bold;
  }

  &-stock {
    font-size: 24rpx;
    color: #999;
    margin-top: 8rpx;
  }

  &-selected {
    font-size: 24rpx;
    color: #666;
    margin-top: 8rpx;
  }

  &-close {
    position: absolute;
    top: 24rpx;
    right: 24rpx;
    padding: 8rpx;

    .uni-icon {
      font-size: 40rpx;
      color: #999;
    }
  }

  &-content {
    max-height: 60vh;
  }

  &-scroll {
    height: 100%;
  }

  &-section {
    padding: 32rpx;
  }

  &-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 24rpx;
  }

  &-stepper {
    display: flex;
    align-items: center;
  }

  &-footer {
    padding: 24rpx 32rpx;
    padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  }
}

.stepper {
  &-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1rpx solid #ddd;
    border-radius: 6rpx;

    .uni-icon {
      font-size: 32rpx;
      color: #333;
    }

    &.disabled {
      background: #f5f5f5;
      border-color: #eee;

      .uni-icon {
        color: #ccc;
      }
    }
  }

  &-value {
    width: 100rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    border-left: none;
    border-right: none;
  }
}

.btn-confirm {
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
