// api/category.ts
import http from '@/utils/request'
import type { CategoryTree } from '@/types'

export interface VegetableCategory {
  id: number
  parentId: number
  name: string
  icon: string
  imageUrl: string
  sortOrder: number
}

// 获取分类树（包含多级分类）
export function getCategoryTree(): Promise<CategoryTree[]> {
  return http.get('/v1/category/tree')
}

// 获取顶级分类
export const getCategoryList = () => {
  return http.get<{ data: VegetableCategory[] }>('/v1/category/top')
}

// 根据父分类获取子分类
export const getSubCategories = (parentId: number) => {
  return http.get<{ data: VegetableCategory[] }>(`/v1/category/${parentId}/children`)
}

// 获取分类详情
export const getCategoryDetail = (id: number) => {
  return http.get<{ data: VegetableCategory }>(`/v1/category/${id}`)
}
