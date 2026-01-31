import { defineStore } from 'pinia'
import type { Product } from '@/types'
import * as CartApi from '@/api/cart'

interface CartItem {
  id: number
  skuId: number
  title: string
  imgUrl: string
  price: number
  count: number
  selected: boolean
  stock: number
}

interface CartState {
  items: CartItem[]
  loaded: boolean
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    loaded: false
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
        .reduce((total, item) => total + item.price * item.count, 0),

    // 总数量
    totalCount: (state) => state.items.reduce((sum, item) => sum + item.count, 0),

    // 是否全选
    isAllSelected: (state) =>
      state.items.length > 0 && state.items.every(item => item.selected),

    // 获取商品数量
    getItemCount: (state) => (skuId: number) => {
      const item = state.items.find(item => item.skuId === skuId)
      return item ? item.count : 0
    }
  },

  actions: {
    /**
     * 从后端加载购物车
     */
    async loadCart() {
      try {
        const data = await CartApi.getCartList()
        this.items = data || []
        this.loaded = true
      } catch (error) {
        console.error('加载购物车失败:', error)
        this.items = []
        this.loaded = true
      }
    },

    /**
     * 添加到购物车
     */
    async addToCart(product: Product, count: number = 1) {
      try {
        await CartApi.addToCart({ skuId: product.skuId, count })

        // 更新本地状态
        const existingItem = this.items.find(item => item.skuId === product.skuId)
        if (existingItem) {
          existingItem.count += count
        } else {
          this.items.push({
            id: 0,
            skuId: product.skuId,
            title: product.title,
            imgUrl: product.imgUrl,
            price: product.salePrice,
            count,
            selected: false,
            stock: product.stock
          })
        }
      } catch (error) {
        console.error('添加到购物车失败:', error)
        throw error
      }
    },

    /**
     * 从购物车移除
     */
    async removeFromCart(skuId: number) {
      try {
        await CartApi.removeFromCart(skuId)
        this.items = this.items.filter(item => item.skuId !== skuId)
      } catch (error) {
        console.error('从购物车移除失败:', error)
        throw error
      }
    },

    /**
     * 更新数量
     */
    async updateCount(skuId: number, count: number) {
      try {
        if (count <= 0) {
          await this.removeFromCart(skuId)
        } else {
          await CartApi.updateCartCount({ skuId, count })

          const item = this.items.find(item => item.skuId === skuId)
          if (item) {
            item.count = count
          }
        }
      } catch (error) {
        console.error('更新数量失败:', error)
        throw error
      }
    },

    /**
     * 切换选中状态
     */
    async toggleSelect(skuId: number) {
      try {
        await CartApi.toggleSelect(skuId)

        const item = this.items.find(item => item.skuId === skuId)
        if (item) {
          item.selected = !item.selected
        }
      } catch (error) {
        console.error('切换选中状态失败:', error)
        throw error
      }
    },

    /**
     * 全选/取消全选
     */
    async toggleSelectAll() {
      try {
        const selected = !this.isAllSelected
        await CartApi.toggleSelectAll(selected)

        this.items.forEach(item => {
          item.selected = selected
        })
      } catch (error) {
        console.error('全选操作失败:', error)
        throw error
      }
    },

    /**
     * 清空购物车
     */
    async clearCart() {
      try {
        await CartApi.clearCart()
        this.items = []
      } catch (error) {
        console.error('清空购物车失败:', error)
        throw error
      }
    },

    /**
     * 清空选中的商品
     */
    async clearSelected() {
      try {
        await CartApi.clearSelected()
        this.items = this.items.filter(item => !item.selected)
      } catch (error) {
        console.error('清空选中商品失败:', error)
        throw error
      }
    },

    /**
     * 获取商品在购物车中的数量（不从后端加载，直接返回本地缓存值）
     */
    async getItemCountFromServer(skuId: number): Promise<number> {
      try {
        const count = await CartApi.getCartCount(skuId)
        return count || 0
      } catch (error) {
        console.error('获取商品数量失败:', error)
        return 0
      }
    }
  }
})
