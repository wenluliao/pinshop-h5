<template>
  <view class="product-card" @tap="onTap">
    <view class="card-content">
      <!-- 左侧商品图片 -->
      <view class="product-image-wrapper">
        <image
          class="product-image"
          :src="product.imgUrl"
          mode="aspectFill"
          :lazy-load="true"
        />

        <!-- 营销角标（左上角绝对定位） -->
        <view
          v-if="marketingTags.length > 0"
          class="marketing-badge"
          :style="{ background: marketingTags[0].bgColor, color: marketingTags[0].textColor }"
        >
          {{ marketingTags[0].tagName }}
        </view>
      </view>

      <!-- 右侧商品信息 -->
      <view class="product-info">
        <text class="product-title">{{ product.title }}</text>

        <!-- 副标题/卖点 -->
        <text v-if="product.subtitle" class="product-subtitle">{{ product.subtitle }}</text>

        <!-- 商品描述标签（横向排列） -->
        <view class="product-tags" v-if="descriptionTags.length">
          <text
            v-for="tag in descriptionTags"
            :key="tag.tagId"
            class="product-tag"
            :style="{
              background: tag.bgColor || '#FFF9E6',
              color: tag.textColor || '#FF6B00',
              borderColor: tag.borderColor || '#FF6B00'
            }"
          >
            {{ tag.tagName }}
          </text>
        </view>

        <view class="product-footer">
          <view class="price-info">
            <view class="product-price">
              <!-- 秒杀价 -->
              <template v-if="product.flashPrice">
                <text class="price-symbol">¥</text>
                <text class="price-integer">{{ integerPart(product.flashPrice) }}</text>
                <text class="price-decimal">.{{ decimalPart(product.flashPrice) }}</text>
                <text class="price-original">¥{{ product.salePrice }}</text>
              </template>
              <!-- 普通价格 + 划线价 -->
              <template v-else>
                <text class="price-symbol">¥</text>
                <text class="price-integer">{{ integerPart(product.salePrice) }}</text>
                <text class="price-decimal">.{{ decimalPart(product.salePrice) }}</text>
                <text v-if="product.originalPrice" class="price-original">
                  ¥{{ product.originalPrice }}
                </text>
              </template>
            </view>

            <!-- 重量规格 -->
            <text v-if="product.weightSpec" class="weight-spec">{{ product.weightSpec }}</text>

            <view v-if="showStock" class="product-stock">
              已抢{{ ((product.sales || 0) / (product.stock + (product.sales || 0)) * 100).toFixed(0) }}%
            </view>

            <view v-if="showCountdown && product.flashEndTime" class="product-countdown">
              <Countdown :end-time="product.flashEndTime" label="距结束" />
            </view>
          </view>

          <!-- 购物车控制按钮 -->
          <view class="cart-control">
            <!-- 数量为0：只显示加号 -->
            <view v-if="cartCount === 0" class="cart-add-only" @tap.stop="addToCart">
              <text class="cart-icon">+</text>
            </view>

            <!-- 数量大于0：显示减、数量、加 -->
            <view v-else class="cart-full">
              <view class="cart-minus" @tap.stop="decreaseCart">
                <text class="cart-icon">-</text>
              </view>
              <text class="cart-count">{{ cartCount }}</text>
              <view class="cart-add" @tap.stop="increaseCart">
                <text class="cart-icon">+</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 服务承诺标签（底部小字） -->
        <view v-if="serviceTags.length" class="service-tags">
          <text
            v-for="tag in serviceTags"
            :key="tag.tagId"
            class="service-tag"
          >
            {{ tag.tagName }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Product, CategoryProduct, ProductTag } from '@/types'
import Countdown from './Countdown.vue'
import { useCartStore } from '@/stores'

interface Props {
  product: Product | CategoryProduct
  showStock?: boolean
  showCountdown?: boolean
  tags?: ProductTag[] // 商品标签列表
}

const props = withDefaults(defineProps<Props>(), {
  showStock: false,
  showCountdown: false,
  tags: () => []
})

const emit = defineEmits<{
  tap: [product: Product | CategoryProduct]
}>()

const cartStore = useCartStore()

// 获取当前商品在购物车中的数量
const cartCount = computed(() => cartStore.getItemCount(props.product.skuId))

// 分类标签：营销角标(tagType=1)
const marketingTags = computed(() => {
  return props.tags.filter(t => t.tagType === 1).slice(0, 1) // 只显示第一个
})

// 分类标签：商品描述(tagType=2)
const descriptionTags = computed(() => {
  return props.tags.filter(t => t.tagType === 2).slice(0, 3) // 最多显示3个
})

// 分类标签：服务承诺(tagType=3)
const serviceTags = computed(() => {
  return props.tags.filter(t => t.tagType === 3).slice(0, 2) // 最多显示2个
})

const onTap = () => {
  emit('tap', props.product)
}

// 加入购物车
const addToCart = async () => {
  try {
    await cartStore.addToCart(props.product, 1)
    uni.showToast({
      title: '已加入购物车',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '添加失败',
      icon: 'none'
    })
  }
}

// 增加数量
const increaseCart = async () => {
  try {
    await cartStore.addToCart(props.product, 1)
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

// 减少数量
const decreaseCart = async () => {
  try {
    await cartStore.updateCount(props.product.skuId, cartCount.value - 1)
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

const integerPart = (price: number) => Math.floor(price).toString()
const decimalPart = (price: number) => (price % 1).toFixed(2).substring(2)
</script>

<style lang="scss" scoped>
.product-card {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  border: 1rpx solid #f0f0f0;

  &:active {
    transform: translateY(-1rpx);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  }
}

.card-content {
  display: flex;
  padding: 16rpx;
}

.product-image-wrapper {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  flex-shrink: 0;
  margin-right: 16rpx;
  background: #f7f7f7;
  border-radius: 8rpx;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
}

/* 营销角标：红底白字、大字体、左上角 */
.marketing-badge {
  position: absolute;
  top: 0;
  left: 0;
  padding: 6rpx 12rpx;
  font-size: 22rpx;
  font-weight: bold;
  border-radius: 0 0 8rpx 0;
  z-index: 10;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180rpx;
}

.product-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-subtitle {
  font-size: 22rpx;
  color: #666;
  margin-top: 4rpx;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 商品描述标签：黄底红字、边框、横向排列 */
.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx;
  margin-top: 8rpx;
}

.product-tag {
  padding: 4rpx 10rpx;
  font-size: 20rpx;
  border-radius: 4rpx;
  border: 1rpx solid;
  font-weight: 500;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  gap: 16rpx;
}

.price-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.product-price {
  display: flex;
  align-items: baseline;

  .price-symbol {
    font-size: 20rpx;
    font-weight: 600;
    color: #ff4444;
  }

  .price-integer {
    font-size: 36rpx;
    font-weight: 700;
    color: #ff4444;
    line-height: 1;
  }

  .price-decimal {
    font-size: 22rpx;
    font-weight: 600;
    color: #ff4444;
  }

  /* 划线价：灰色删除线 */
  .price-original {
    margin-left: 6rpx;
    font-size: 22rpx;
    color: #999;
    text-decoration: line-through;
  }
}

/* 重量规格 */
.weight-spec {
  font-size: 20rpx;
  color: #666;
  margin-left: 8rpx;
}

.product-stock {
  font-size: 20rpx;
  color: #999;
  font-weight: 500;
}

.product-countdown {
  margin-top: 4rpx;
}

/* 服务承诺标签：底部小字 */
.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 6rpx;
}

.service-tag {
  font-size: 18rpx;
  color: #666;
  display: flex;
  align-items: center;

  &:not(:last-child)::after {
    content: '|';
    margin-left: 12rpx;
    color: #ddd;
  }
}

/* 购物车控制按钮 */
.cart-control {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

// 只有加号的状态
.cart-add-only {
  width: 64rpx;
  height: 64rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
  transition: all 0.2s;

  &:active {
    transform: scale(0.9);
  }
}

// 完整的减-数量-加状态
.cart-full {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
  padding: 4rpx;
}

.cart-minus,
.cart-add {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.cart-minus {
  background: #fff;
  border: 2rpx solid #e0e0e0;

  &:active {
    background: #f0f0f0;
  }
}

.cart-add {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;

  &:active {
    transform: scale(0.9);
  }
}

.cart-count {
  min-width: 48rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.cart-icon {
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1;
  color: #fff;
}

.cart-minus .cart-icon {
  color: #666;
}
</style>
