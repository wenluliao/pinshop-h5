// api/category.ts
import http from '@/utils/request'

export interface VegetableCategory {
  id: number
  parentId: number
  name: string
  icon: string
  imageUrl: string
  sortOrder: number
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
