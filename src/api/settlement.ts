// api/settlement.ts
import http from '@/utils/request'

export interface PickupPoint {
  id: number
  name: string
  address: string
  phone: string
  businessHours: string
  latitude: number
  longitude: number
}

export interface SettlementPreview {
  deliveryDateText: string
  commission: number
  totalAmount: number
  payableAmount: number
}

export interface SettlementRequest {
  pickupPointId: number
  totalAmount: number
  userId: number
}

// 结算预览
export const settlementPreview = (data: SettlementRequest) => {
  return http.post<{ data: SettlementPreview }>('/v1/settlement/preview', data)
}

// 提交订单
export const submitOrder = (data: any) => {
  return http.post<{ data: any }>('/v1/settlement/submit', data)
}
