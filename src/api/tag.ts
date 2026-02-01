import http from '@/utils/request'
import type { ProductTag, TagsGroup } from '@/types'

/**
 * 获取所有标签（按类型分组）
 */
export function getAllTags(): Promise<TagsGroup> {
  return http.get('/v1/tag/all')
}

/**
 * 按类型查询标签
 */
export function getTagsByType(tagType: number): Promise<ProductTag[]> {
  return http.get(`/v1/tag/type/${tagType}`)
}

/**
 * 获取商品的标签ID列表
 */
export function getProductTagIds(spuId: number): Promise<number[]> {
  return http.get(`/v1/tag/product/${spuId}`)
}

/**
 * 为商品批量添加标签
 */
export function batchAddTagsToProduct(spuId: number, tagIds: number[]): Promise<void> {
  return http.post(`/v1/tag/product/${spuId}`, tagIds)
}
