import Request from 'luch-request'
import type { Result } from '@/types'

// 配置基础URL（开发环境使用相对路径，通过vite代理转发）
const baseURL = import.meta.env.DEV
  ? '/api'
  : 'https://api.pinshop.com'

// 创建请求实例
const http = new Request({
  baseURL,
  timeout: 30000,
  // H5环境下使用浏览器原生XMLHttpRequest，确保能通过Vite代理
  adapter: process.env.UNI_PLATFORM === 'h5' ? 'http' : undefined,
  header: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 添加 Token
    const token = uni.getStorageSync('token')
    if (token) {
      config.header = {
        ...config.header,
        Authorization: `Bearer ${token}`
      }
    }

    // 显示加载提示（可选）
    if (!config.hideLoading) {
      uni.showLoading({
        title: '加载中...',
        mask: true
      })
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    // 隐藏加载提示
    uni.hideLoading()

    const { config, data } = response
    const result = data as Result

    // 业务成功
    if (result.code === 200) {
      return result.data
    }

    // 未登录 - 跳转登录页
    if (result.code === 401) {
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')

      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })

      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/profile/index'
        })
      }, 1500)

      return Promise.reject(result)
    }

    // 其他业务错误
    uni.showToast({
      title: result.message || '请求失败',
      icon: 'none'
    })

    return Promise.reject(result)
  },
  (error) => {
    // 隐藏加载提示
    uni.hideLoading()

    console.error('Request Error:', error)

    let message = '网络请求失败'

    // 网络超时
    if (error.errMsg.includes('timeout')) {
      message = '请求超时，请稍后重试'
    }
    // 网络断开
    else if (error.errMsg.includes('fail')) {
      message = '网络连接失败，请检查网络'
    }

    uni.showToast({
      title: message,
      icon: 'none'
    })

    return Promise.reject(error)
  }
)

export default http
