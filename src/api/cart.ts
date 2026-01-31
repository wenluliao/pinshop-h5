import http from '@/utils/request'

/**
 * 购物车API
 */

/**
 * 获取购物车列表
 */
export const getCartList = () => {
  return http.get<Array<CartItem>>('/v1/cart/list')
}

/**
 * 添加商品到购物车
 */
export const addToCart = (data: { skuId: number; count: number }) => {
  return http.post('/v1/cart/add', data)
}

/**
 * 更新购物车商品数量
 */
export const updateCartCount = (data: { skuId: number; count: number }) => {
  return http.put('/v1/cart/update', data)
}

/**
 * 从购物车删除商品
 */
export const removeFromCart = (skuId: number) => {
  return http.delete(`/v1/cart/remove/${skuId}`)
}

/**
 * 切换选中状态
 */
export const toggleSelect = (skuId: number) => {
  return http.put(`/v1/cart/toggle/${skuId}`)
}

/**
 * 全选/取消全选
 */
export const toggleSelectAll = (selected: boolean) => {
  return http.put('/v1/cart/toggle-all', { selected })
}

/**
 * 清空购物车
 */
export const clearCart = () => {
  return http.delete('/v1/cart/clear')
}

/**
 * 清空选中的商品
 */
export const clearSelected = () => {
  return http.delete('/v1/cart/clear-selected')
}

/**
 * 获取商品在购物车中的数量
 */
export const getCartCount = (skuId: number) => {
  return http.get<number>(`/v1/cart/count/${skuId}`)
}
