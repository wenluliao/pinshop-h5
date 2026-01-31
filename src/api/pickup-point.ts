// api/pickup-point.ts
import http from '@/utils/request'

export interface PickupPoint {
  id: number
  name: string
  address: string
  phone: string
  businessHours: string
  latitude: number
  longitude: number
  deliveryRange?: number
}

// 获取代收点列表
export const getPickupPointList = () => {
  return http.get<{ data: PickupPoint[] }>('/v1/pickup-point/list')
}

// 获取附近代收点
export const getNearbyPickupPoints = (latitude: number, longitude: number) => {
  return http.get<{ data: PickupPoint[] }>(
    `/v1/pickup-point/nearby?latitude=${latitude}&longitude=${longitude}`
  )
}

// 设置默认代收点
export const setDefaultPickupPoint = (pointId: number) => {
  return http.post('/v1/pickup-point/default', { pointId })
}

// 获取用户默认代收点
export const getDefaultPickupPoint = () => {
  return http.get<{ data: PickupPoint }>('/v1/pickup-point/default')
}
