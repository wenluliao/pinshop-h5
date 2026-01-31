<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useCartStore } from '@/stores'
import { useUserStore } from '@/stores'

const cartStore = useCartStore()
const userStore = useUserStore()

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')

  // 如果用户已登录，加载购物车数据
  if (userStore.token && !cartStore.loaded) {
    cartStore.loadCart()
  }
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
/* 全局样式 */
@import '@/styles/common.scss';

page {
  background-color: #f5f5f5;
  font-size: 28rpx;
  color: #333;
}

/* 重置样式 */
* {
  box-sizing: border-box;
}

/* 通用工具类 */
.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* 价格颜色 */
.price-color {
  color: #ff6b6b;
}
</style>
