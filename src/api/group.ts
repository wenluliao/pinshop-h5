import http from '@/utils/request'
import type {
  GroupSession,
  GroupRecord,
  GroupDetail,
  PageRes
} from '@/types'

/**
 * 发起拼团
 */
export function initiateGroup(): Promise<{ sessionId: string }> {
  return http.post('/v1/group/initiate')
}

/**
 * 参与拼团
 */
export function joinGroup(sessionId: string): Promise<void> {
  return http.post('/v1/group/join', { sessionId })
}

/**
 * 获取正在拼的团
 */
export function getGroupSessions(skuId: number): Promise<GroupSession[]> {
  return http.get(`/v1/group/${skuId}/sessions`)
}

/**
 * 获取我的拼团记录
 */
export function getMyGroupRecords(params: {
  userId: string
  pageNum?: number
  pageSize?: number
}): Promise<PageRes<GroupRecord>> {
  return http.get('/v1/group/my', params)
}

/**
 * 获取拼团详情
 */
export function getGroupDetail(sessionId: string): Promise<GroupDetail> {
  return http.get(`/v1/group/${sessionId}/detail`)
}
