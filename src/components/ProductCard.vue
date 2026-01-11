<template>
  <view class="product-card" @tap="onTap">
    <view class="product-image-wrapper">
      <image
        class="product-image"
        :src="product.imgUrl"
        mode="aspectFill"
        :lazy-load="true"
      />
      <view v-if="product.flashPrice" class="flash-badge">秒杀</view>
    </view>

    <view class="product-info">
      <text class="product-title text-ellipsis-2">{{ product.title }}</text>

      <view class="product-tags" v-if="product.tags && product.tags.length">
        <text
          v-for="(tag, index) in product.tags"
          :key="index"
          class="product-tag"
        >
          {{ tag }}
        </text>
      </view>

      <view class="product-footer">
        <view class="product-price">
          <template v-if="product.flashPrice">
            <text class="price-symbol">¥</text>
            <text class="price-integer">{{ integerPart(product.flashPrice) }}</text>
            <text class="price-decimal">.{{ decimalPart(product.flashPrice) }}</text>
            <text class="price-original">¥{{ product.salePrice }}</text>
          </template>
          <template v-else>
            <text class="price-symbol">¥</text>
            <text class="price-integer">{{ integerPart(product.salePrice) }}</text>
            <text class="price-decimal">.{{ decimalPart(product.salePrice) }}</text>
          </template>
        </view>

        <view v-if="showStock" class="product-stock">
          已抢{{ ((product.sales || 0) / (product.stock + (product.sales || 0)) * 100).toFixed(0) }}%
        </view>
      </view>

      <view v-if="showCountdown && product.flashEndTime" class="product-countdown">
        <Countdown :end-time="product.flashEndTime" label="距结束" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Product } from '@/types'
import Countdown from './Countdown.vue'

interface Props {
  product: Product
  showStock?: boolean
  showCountdown?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStock: false,
  showCountdown: false
})

const emit = defineEmits<{
  tap: [product: Product]
}>()

const onTap = () => {
  emit('tap', props.product)
}

const integerPart = (price: number) => Math.floor(price).toString()
const decimalPart = (price: number) => (price % 1).toFixed(2).substring(2)
</script>

<style lang="scss" scoped>
.product-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }

  &-image-wrapper {
    position: relative;
    width: 100%;
    padding-top: 100%; // 1:1 比例
  }

  &-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &-badge {
    &.flash-badge {
      position: absolute;
      top: 0;
      left: 0;
      padding: 4rpx 12rpx;
      background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
      color: #fff;
      font-size: 20rpx;
      font-weight: bold;
      border-radius: 16rpx 0 16rpx 0;
    }
  }

  &-info {
    padding: 20rpx;
  }

  &-title {
    display: block;
    height: 76rpx;
    line-height: 38rpx;
    font-size: 28rpx;
    color: #333;
    overflow: hidden;
  }

  &-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-top: 12rpx;
  }

  &-tag {
    padding: 4rpx 12rpx;
    background: #fff4f4;
    color: #ff6b6b;
    font-size: 20rpx;
    border-radius: 4rpx;
    border: 1rpx solid #ffcece;
  }

  &-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16rpx;
  }

  &-price {
    display: flex;
    align-items: baseline;

    .price-symbol {
      font-size: 24rpx;
      color: #ff6b6b;
    }

    .price-integer {
      font-size: 36rpx;
      font-weight: bold;
      color: #ff6b6b;
    }

    .price-decimal {
      font-size: 24rpx;
      color: #ff6b6b;
    }

    .price-original {
      margin-left: 8rpx;
      font-size: 24rpx;
      color: #999;
      text-decoration: line-through;
    }
  }

  &-stock {
    font-size: 24rpx;
    color: #999;
  }

  &-countdown {
    margin-top: 12rpx;
  }
}
</style>
