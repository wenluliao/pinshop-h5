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

export interface OrderItemRequest {
  skuId: number
  count: number
  price: number
}

export interface CreateOrderRequest {
  userId: number
  receiverInfo: string
  items: OrderItemRequest[]
}

export interface CreateOrderResponse {
  orderId: number
  totalAmount: number
  status: number
}

// 结算预览
export const settlementPreview = (data: SettlementRequest) => {
  return http.post('/v1/settlement/preview', data)
}

// 提交订单
export const createOrder = (data: CreateOrderRequest) => {
  return http.post<{ data: CreateOrderResponse }>('/v1/order/create', data)
}
