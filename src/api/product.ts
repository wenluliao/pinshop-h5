import http from '@/utils/request'
import type {
  Product,
  ProductDetail,
  PageRes,
  CategoryProductRes
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

/**
 * 按分类查询商品（支持营销分类）
 */
export function getProductsByCategory(params: {
  categoryId: number
  relationType?: number // 1-主分类 2-营销分类
  sortBy?: string // price_asc, sales_desc, default
  pageNum?: number
  pageSize?: number
}): Promise<CategoryProductRes> {
  return http.get(`/v1/product/category/${params.categoryId}`, {
    relationType: params.relationType || 1,
    sortBy: params.sortBy || 'default',
    pageNum: params.pageNum || 1,
    pageSize: params.pageSize || 20
  })
}

/**
 * 搜索商品（支持别名）
 */
export function searchProductsWithAlias(params: {
  keyword: string
  pageNum?: number
  pageSize?: number
}): Promise<PageRes<Product>> {
  return http.get('/v1/product/search-alias', {
    keyword: params.keyword,
    pageNum: params.pageNum || 1,
    pageSize: params.pageSize || 20
  })
}

