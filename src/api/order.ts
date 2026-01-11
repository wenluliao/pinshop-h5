import http from '@/utils/request'
import type {
  Order,
  OrderCount,
  PageRes
} from '@/types'

/**
 * 获取订单列表
 */
export function getOrderList(params: {
  userId: string
  status?: number
  pageNum?: number
  pageSize?: number
}): Promise<PageRes<Order>> {
  return http.get('/v1/order/list', params)
}

/**
 * 获取订单详情
 */
export function getOrderDetail(orderId: string, userId: string): Promise<Order> {
  return http.get(`/v1/order/${orderId}`, { userId })
}

/**
 * 获取订单统计
 */
export function getOrderCount(userId: string): Promise<OrderCount> {
  return http.get('/v1/order/count', { userId })
}

/**
 * 取消订单
 */
export function cancelOrder(orderId: string): Promise<void> {
  return http.post(`/v1/order/${orderId}/cancel`)
}

/**
 * 获取订单状态
 */
export function getOrderStatus(orderId: string, userId: string): Promise<number> {
  return http.get(`/v1/order/${orderId}/status`, { userId })
}
