import { defineStore } from 'pinia'
import type { Product } from '@/types'
import * as CartApi from '@/api/cart'
import { getProductDetail } from '@/api/product'

interface CartItem {
  skuId: number
  count: number
  selected: boolean
}

interface CartItemWithInfo extends CartItem {
  title?: string
  imgUrl?: string
  salePrice?: number
  originalPrice?: number
  weightSpec?: string
  specification?: string
  stock?: number
}

interface CartState {
  items: CartItem[]
  itemsWithInfo: CartItemWithInfo[]
  loaded: boolean
}

// 从localStorage加载购物车
const loadCartFromStorage = (): CartItem[] => {
  try {
    const data = uni.getStorageSync('pinshop-cart')
    if (data) {
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('加载购物车数据失败:', error)
  }
  return []
}

// 保存购物车到localStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    uni.setStorageSync('pinshop-cart', JSON.stringify(items))
  } catch (error) {
    console.error('保存购物车数据失败:', error)
  }
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: loadCartFromStorage(),
    loaded: false,
    itemsWithInfo: [] as CartItemWithInfo[]
  }),

  getters: {
    // 选中的商品
    selectedItems: (state) => state.itemsWithInfo.filter(item => item.selected),

    // 选中数量
    selectedCount: (state) => state.itemsWithInfo.filter(item => item.selected).length,

    // 选中总价
    selectedTotal: (state) =>
      state.itemsWithInfo
        .filter(item => item.selected)
        .reduce((total, item) => total + (item.salePrice || 0) * item.count, 0),

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
     * 从后端加载商品详情
     */
    async loadCart() {
      if (this.loaded) return

      try {
        // 并发查询所有商品详情
        const itemsWithInfo = await Promise.all(
          this.items.map(async (item) => {
            try {
              const detail = await getProductDetail(item.skuId)
              return {
                ...item,
                title: detail.title,
                imgUrl: detail.imgUrl,
                salePrice: detail.salePrice,
                originalPrice: detail.originalPrice,
                specification: detail.specification,
                stock: detail.stock
              }
            } catch (error) {
              console.error(`加载商品 ${item.skuId} 详情失败:`, error)
              return {
                ...item,
                title: '商品已下架',
                imgUrl: '',
                salePrice: 0,
                stock: 0
              }
            }
          })
        )

        this.itemsWithInfo = itemsWithInfo
        this.loaded = true
      } catch (error) {
        console.error('加载购物车失败:', error)
        this.itemsWithInfo = []
        this.loaded = true
      }
    },

    /**
     * 刷新购物车商品信息（重新查询价格和库存）
     */
    async refreshCart() {
      this.loaded = false
      await this.loadCart()
    },

    /**
     * 添加到购物车
     */
    async addToCart(product: Product | any, count: number = 1) {
      try {
        // 先尝试调用后端API（如果后端实现的话）
        try {
          await CartApi.addToCart({ skuId: product.skuId, count })
        } catch (apiError) {
          // 后端API未实现或失败，仅使用本地存储
          console.log('后端API调用失败，使用本地存储')
        }

        // 更新本地状态（只保存skuId、count、selected）
        const existingItem = this.items.find(item => item.skuId === product.skuId)
        if (existingItem) {
          existingItem.count += count
          // 保存到localStorage
          saveCartToStorage(this.items)
        } else {
          this.items.push({
            skuId: product.skuId,
            count,
            selected: true
          })
          // 保存到localStorage
          saveCartToStorage(this.items)
        }

        // 刷新商品信息
        this.loaded = false
        await this.loadCart()
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
        // 尝试调用后端API
        try {
          await CartApi.removeFromCart(skuId)
        } catch (apiError) {
          console.log('后端API调用失败，使用本地存储')
        }
        // 更新本地状态
        this.items = this.items.filter(item => item.skuId !== skuId)
        this.itemsWithInfo = this.itemsWithInfo.filter(item => item.skuId !== skuId)
        // 保存到localStorage
        saveCartToStorage(this.items)
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
          // 尝试调用后端API
          try {
            await CartApi.updateCartCount({ skuId, count })
          } catch (apiError) {
            console.log('后端API调用失败，使用本地存储')
          }

          const item = this.items.find(item => item.skuId === skuId)
          if (item) {
            item.count = count
          }
          const itemWithInfo = this.itemsWithInfo.find(item => item.skuId === skuId)
          if (itemWithInfo) {
            itemWithInfo.count = count
          }
          // 保存到localStorage
          saveCartToStorage(this.items)
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
        // 尝试调用后端API
        try {
          await CartApi.toggleSelect(skuId)
        } catch (apiError) {
          console.log('后端API调用失败，使用本地存储')
        }

        const item = this.items.find(item => item.skuId === skuId)
        if (item) {
          item.selected = !item.selected
        }
        const itemWithInfo = this.itemsWithInfo.find(item => item.skuId === skuId)
        if (itemWithInfo) {
          itemWithInfo.selected = !itemWithInfo.selected
        }
        // 保存到localStorage
        saveCartToStorage(this.items)
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
        // 尝试调用后端API
        try {
          await CartApi.toggleSelectAll(selected)
        } catch (apiError) {
          console.log('后端API调用失败，使用本地存储')
        }

        this.items.forEach(item => {
          item.selected = selected
        })
        this.itemsWithInfo.forEach(item => {
          item.selected = selected
        })
        // 保存到localStorage
        saveCartToStorage(this.items)
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
