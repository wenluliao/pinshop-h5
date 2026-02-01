import { defineStore } from 'pinia'
import type { User, Address } from '@/types'
import * as userApi from '@/api/user'

interface UserState {
  token: string
  userInfo: User | null
  addresses: Address[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: uni.getStorageSync('token') || '',
    userInfo: uni.getStorageSync('userInfo') || null,
    addresses: []
  }),

  getters: {
    isLogin: (state) => !!state.token && !!state.userInfo,
    defaultAddress: (state) => state.addresses.find(addr => addr.isDefault === 1)
  },

  actions: {
    /**
     * 微信登录
     */
    async login(openid: string, nickname?: string, avatarUrl?: string) {
      try {
        const res = await userApi.login({ openid, nickname, avatarUrl })
        this.token = res.token
        this.userInfo = res.userInfo

        // 持久化存储
        uni.setStorageSync('token', res.token)
        uni.setStorageSync('userInfo', res.userInfo)

        return res
      } catch (error) {
        throw error
      }
    },

    /**
     * 账号密码登录
     */
    async loginByPassword(username: string, password: string) {
      try {
        const res = await userApi.loginByPassword({ username, password })
        this.token = res.token
        this.userInfo = res.userInfo

        // 持久化存储
        uni.setStorageSync('token', res.token)
        uni.setStorageSync('userInfo', res.userInfo)

        return res
      } catch (error) {
        throw error
      }
    },

    /**
     * 退出登录
     */
    logout() {
      this.token = ''
      this.userInfo = null
      this.addresses = []

      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
    },

    /**
     * 获取用户信息
     */
    async getUserInfo(userId: string) {
      try {
        const userInfo = await userApi.getUserProfile(userId)
        this.userInfo = userInfo
        uni.setStorageSync('userInfo', userInfo)
        return userInfo
      } catch (error) {
        throw error
      }
    },

    /**
     * 更新用户信息
     */
    async updateUserInfo(data: Partial<User>) {
      try {
        await userApi.updateUserProfile({
          userId: this.userInfo!.userId,
          nickname: data.nickname || '',
          phone: data.phone || ''
        })

        if (this.userInfo) {
          this.userInfo = { ...this.userInfo, ...data }
          uni.setStorageSync('userInfo', this.userInfo)
        }
      } catch (error) {
        throw error
      }
    },

    /**
     * 获取地址列表
     */
    async getAddresses() {
      try {
        this.addresses = await userApi.getAddressList(this.userInfo!.userId)
        return this.addresses
      } catch (error) {
        throw error
      }
    },

    /**
     * 添加地址
     */
    async addAddress(address: Omit<Address, 'addressId' | 'userId'>) {
      try {
        const newAddress = await userApi.addAddress({
          userId: this.userInfo!.userId,
          ...address
        })
        this.addresses.push(newAddress)
        return newAddress
      } catch (error) {
        throw error
      }
    },

    /**
     * 更新地址
     */
    async updateAddress(addressId: string, address: Omit<Address, 'addressId' | 'userId'>) {
      try {
        await userApi.updateAddress(addressId, {
          userId: this.userInfo!.userId,
          ...address
        })

        const index = this.addresses.findIndex(a => a.addressId === addressId)
        if (index !== -1) {
          this.addresses[index] = { ...address, addressId, userId: this.userInfo!.userId }
        }
      } catch (error) {
        throw error
      }
    },

    /**
     * 删除地址
     */
    async deleteAddress(addressId: string) {
      try {
        await userApi.deleteAddress(addressId, this.userInfo!.userId)
        this.addresses = this.addresses.filter(a => a.addressId !== addressId)
      } catch (error) {
        throw error
      }
    },

    /**
     * 设置默认地址
     */
    async setDefaultAddress(addressId: string) {
      try {
        await userApi.setDefaultAddress(addressId)

        // 更新本地状态
        this.addresses.forEach(addr => {
          addr.isDefault = addr.addressId === addressId ? 1 : 0
        })
      } catch (error) {
        throw error
      }
    }
  }
})
