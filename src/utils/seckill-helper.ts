import { http } from './request'
import type { SeckillReq, SeckillRes, SeckillResult } from '@/types'

/**
 * 秒杀轮询配置
 */
const POLL_CONFIG = {
  interval: 500, // 轮询间隔（毫秒）
  maxAttempts: 20 // 最大轮询次数
}

/**
 * 执行秒杀并轮询结果
 * @param params 秒杀参数
 * @returns 订单ID
 */
export async function handleSeckill(params: SeckillReq): Promise<string> {
  try {
    // 1. 发起秒杀请求
    const seckillRes: SeckillRes = await http.post('/api/v1/trade/seckill', params, {
      hideLoading: true
    })

    if (seckillRes.status === 'QUEUING') {
      // 2. 显示排队中
      uni.showLoading({
        title: '排队中...',
        mask: true
      })

      // 3. 开始轮询结果
      return await pollResult(seckillRes.queueId)
    } else if (seckillRes.status === 'SUCCESS') {
      // 直接成功
      return seckillRes.orderId!
    } else {
      throw new Error('秒杀失败')
    }
  } catch (error: any) {
    throw error
  } finally {
    uni.hideLoading()
  }
}

/**
 * 轮询查询秒杀结果
 * @param queueId 排队ID
 * @param attempts 当前尝试次数
 * @returns 订单ID
 */
async function pollResult(
  queueId: string,
  attempts: number = 0
): Promise<string> {
  // 超过最大次数
  if (attempts >= POLL_CONFIG.maxAttempts) {
    throw new Error('请求超时，请在订单中查看')
  }

  // 等待间隔
  await new Promise(resolve => setTimeout(resolve, POLL_CONFIG.interval))

  // 查询结果
  const result: SeckillResult = await http.get(
    `/api/v1/trade/result/${queueId}`,
    undefined,
    { hideLoading: true }
  )

  if (result.status === 'SUCCESS') {
    // 成功
    return result.orderId!
  } else if (result.status === 'FAIL') {
    // 失败
    throw new Error(result.message || '很遗憾，没抢到')
  } else {
    // 继续轮询
    return pollResult(queueId, attempts + 1)
  }
}

/**
 * 获取秒杀结果（不自动轮询）
 * @param queueId 排队ID
 * @returns 秒杀结果
 */
export function getSeckillResult(queueId: string): Promise<SeckillResult> {
  return http.get(`/api/v1/trade/result/${queueId}`)
}
