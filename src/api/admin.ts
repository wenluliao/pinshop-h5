import http from '@/utils/request'
import type { DashboardData } from '@/types'

/**
 * 获取管理后台仪表盘数据
 */
export function getDashboard(): Promise<DashboardData> {
  return http.get('/v1/admin/dashboard')
}
