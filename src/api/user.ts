import http from '@/utils/request'
import type {
  LoginReq,
  LoginRes,
  User,
  Address
} from '@/types'

/**
 * 用户登录
 */
export function login(data: LoginReq): Promise<LoginRes> {
  return http.post('/api/v1/user/login', data)
}

/**
 * 获取用户信息
 */
export function getUserProfile(userId: string): Promise<User> {
  return http.get('/api/v1/user/profile', { userId })
}

/**
 * 更新用户信息
 */
export function updateUserProfile(data: {
  userId: number
  nickname: string
  phone: string
}): Promise<void> {
  return http.put('/api/v1/user/profile', data)
}

/**
 * 获取地址列表
 */
export function getAddressList(userId: string): Promise<Address[]> {
  return http.get('/api/v1/user/addresses', { userId })
}

/**
 * 添加地址
 */
export function addAddress(data: Omit<Address, 'addressId'>): Promise<Address> {
  return http.post('/api/v1/user/address', data)
}

/**
 * 更新地址
 */
export function updateAddress(
  addressId: string,
  data: Omit<Address, 'addressId'>
): Promise<void> {
  return http.put(`/api/v1/user/address/${addressId}`, data)
}

/**
 * 删除地址
 */
export function deleteAddress(addressId: string, userId: string): Promise<void> {
  return http.delete(`/api/v1/user/address/${addressId}`, { userId })
}

/**
 * 设置默认地址
 */
export function setDefaultAddress(addressId: string): Promise<void> {
  return http.post(`/api/v1/user/address/${addressId}/default`)
}
