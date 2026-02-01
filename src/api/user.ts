import http from '@/utils/request'
import type {
  LoginReq,
  LoginRes,
  User,
  Address
} from '@/types'

/**
 * 用户登录（微信）
 */
export function login(data: LoginReq): Promise<LoginRes> {
  return http.post('/v1/user/login', data)
}

/**
 * 账号密码登录
 */
export function loginByPassword(data: {
  username: string
  password: string
}): Promise<LoginRes> {
  return http.post('/v1/user/login-password', data)
}

/**
 * 获取用户信息
 */
export function getUserProfile(userId: string): Promise<User> {
  return http.get('/v1/user/profile', { userId })
}

/**
 * 更新用户信息
 */
export function updateUserProfile(data: {
  userId: number
  nickname: string
  phone: string
}): Promise<void> {
  return http.put('/v1/user/profile', data)
}

/**
 * 获取地址列表
 */
export function getAddressList(userId: string): Promise<Address[]> {
  return http.get('/v1/user/addresses', { userId })
}

/**
 * 添加地址
 */
export function addAddress(data: Omit<Address, 'addressId'>): Promise<Address> {
  return http.post('/v1/user/address', data)
}

/**
 * 更新地址
 */
export function updateAddress(
  addressId: string,
  data: Omit<Address, 'addressId'>
): Promise<void> {
  return http.put(`/v1/user/address/${addressId}`, data)
}

/**
 * 删除地址
 */
export function deleteAddress(addressId: string, userId: string): Promise<void> {
  return http.delete(`/v1/user/address/${addressId}`, { userId })
}

/**
 * 设置默认地址
 */
export function setDefaultAddress(addressId: string): Promise<void> {
  return http.post(`/v1/user/address/${addressId}/default`)
}
