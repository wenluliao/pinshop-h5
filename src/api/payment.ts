import http from '@/utils/request'
import type {
  CreatePayReq,
  PayRes,
  PayConfig,
  PayStatus
} from '@/types'

/**
 * 创建支付
 */
export function createPayment(data: CreatePayReq): Promise<PayRes> {
  return http.post('/v1/pay/create', data)
}

/**
 * 获取支付配置
 */
export function getPaymentConfig(): Promise<PayConfig> {
  return http.get('/v1/pay/config')
}

/**
 * 获取支付状态
 */
export function getPaymentStatus(userId: number, orderId: number): Promise<PayStatus> {
  return http.get('/v1/pay/status', { userId, orderId })
}

/**
 * 测试：模拟支付成功（仅Mock模式）
 */
export function testPaymentSuccess(paymentId: string): Promise<void> {
  return http.post('/v1/pay/test/success', null, { params: { paymentId } })
}

/**
 * 测试：模拟支付失败（仅Mock模式）
 */
export function testPaymentFail(paymentId: string): Promise<void> {
  return http.post('/v1/pay/test/fail', null, { params: { paymentId } })
}

/**
 * 微信支付回调（后端接口，前端不直接调用）
 */
export function wechatPayCallback(data: any): Promise<void> {
  return http.post('/v1/pay/callback/wechat', data)
}

/**
 * 支付宝支付回调（后端接口，前端不直接调用）
 */
export function alipayCallback(data: any): Promise<void> {
  return http.post('/v1/pay/callback/alipay', data)
}
