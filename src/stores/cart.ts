import { defineStore } from 'pinia'
import type { Product } from '@/types'

interface CartItem extends Product {
  count: number
  selected: boolean
}

interface CartState {
  items: CartItem[]
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: uni.getStorageSync('cart') || []
  }),

  getters: {
    // 选中的商品
    selectedItems: (state) => state.items.filter(item => item.selected),

    // 选中数量
    selectedCount: (state) => state.items.filter(item => item.selected).length,

    // 选中总价
    selectedTotal: (state) =>
      state.items
        .filter(item => item.selected)
        .reduce((total, item) => total + item.salePrice * item.count, 0),

    // 总数量
    totalCount: (state) => state.items.reduce((sum, item) => sum + item.count, 0),

    // 是否全选
    isAllSelected: (state) =>
      state.items.length > 0 && state.items.every(item => item.selected)
  },

  actions: {
    /**
     * 添加到购物车
     */
    addToCart(product: Product, count: number = 1) {
      const existingItem = this.items.find(item => item.skuId === product.skuId)

      if (existingItem) {
        existingItem.count += count
      } else {
        this.items.push({
          ...product,
          count,
          selected: false
        })
      }

      this.saveCart()
    },

    /**
     * 从购物车移除
     */
    removeFromCart(skuId: number) {
      this.items = this.items.filter(item => item.skuId !== skuId)
      this.saveCart()
    },

    /**
     * 更新数量
     */
    updateCount(skuId: number, count: number) {
      const item = this.items.find(item => item.skuId === skuId)
      if (item) {
        if (count <= 0) {
          this.removeFromCart(skuId)
        } else {
          item.count = count
          this.saveCart()
        }
      }
    },

    /**
     * 切换选中状态
     */
    toggleSelect(skuId: number) {
      const item = this.items.find(item => item.skuId === skuId)
      if (item) {
        item.selected = !item.selected
        this.saveCart()
      }
    },

    /**
     * 全选/取消全选
     */
    toggleSelectAll() {
      const selected = !this.isAllSelected
      this.items.forEach(item => {
        item.selected = selected
      })
      this.saveCart()
    },

    /**
     * 清空购物车
     */
    clearCart() {
      this.items = []
      this.saveCart()
    },

    /**
     * 清空选中的商品
     */
    clearSelected() {
      this.items = this.items.filter(item => !item.selected)
      this.saveCart()
    },

    /**
     * 保存到本地存储
     */
    saveCart() {
      uni.setStorageSync('cart', this.items)
    }
  }
})
