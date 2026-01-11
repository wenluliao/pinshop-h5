import http from '@/utils/request'
import type {
  Product,
  ProductDetail,
  PageRes
} from '@/types'

/**
 * 获取秒杀商品列表
 */
export function getFlashList(timeSlot?: string): Promise<Product[]> {
  return http.get('/v1/product/flash-list', { timeSlot })
}

/**
 * 获取商品详情
 */
export function getProductDetail(skuId: number): Promise<ProductDetail> {
  return http.get(`/v1/product/detail/${skuId}`)
}

/**
 * 获取商品分类
 */
export function getCategories(): Promise<any[]> {
  return http.get('/v1/product/categories')
}

/**
 * 搜索商品
 */
export function searchProducts(params: {
  keyword: string
  pageNum?: number
  pageSize?: number
}): Promise<PageRes<Product>> {
  return http.get('/v1/product/search', params)
}

/**
 * 获取热门商品
 */
export function getHotProducts(limit: number = 10): Promise<Product[]> {
  return http.get('/v1/product/hot', { limit })
}
