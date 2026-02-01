import type { Result } from '@/types'

/**
 * 基于uni.request的HTTP请求工具
 * 专为H5环境优化
 */
class HttpRequest {
  private baseURL: string

  constructor() {
    // 开发环境使用空字符串（通过Vite代理）
    this.baseURL = import.meta.env.DEV ? '' : 'https://api.pinshop.com'
  }

  /**
   * GET请求
   */
  get<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('GET', url, data)
  }

  /**
   * POST请求
   */
  post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('POST', url, data)
  }

  /**
   * PUT请求
   */
  put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('PUT', url, data)
  }

  /**
   * DELETE请求
   */
  delete<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('DELETE', url, data)
  }

  /**
   * 通用请求方法
   */
  private request<T>(
    method: string,
    url: string,
    data?: any
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // 构建完整URL
      const fullUrl = this.baseURL + url

      // 添加查询参数
      let requestOptions: any = {
        url: fullUrl,
        method: method.toUpperCase(),
        timeout: 30000,
        header: {
          'Content-Type': 'application/json'
        }
      }

      // GET请求将数据放到url参数中
      if (method.toUpperCase() === 'GET' && data) {
        const params = new URLSearchParams()
        Object.keys(data).forEach(key => {
          if (data[key] !== null && data[key] !== undefined) {
            params.append(key, String(data[key]))
          }
        })
        const queryString = params.toString()
        if (queryString) {
          requestOptions.url += (fullUrl.includes('?') ? '&' : '?') + queryString
        }
      } else {
        // POST/PUT/DELETE将数据放到body中
        requestOptions.data = data
      }

      // 添加Token
      const token = uni.getStorageSync('token')
      if (token) {
        requestOptions.header.Authorization = `Bearer ${token}`
      }

      uni.request({
        ...requestOptions,
        success: (res: any) => {
          try {
            const result = res.data as Result

            // 业务成功
            if (result.code === 200) {
              resolve(result.data as T)
              return
            }

            // 未登录
            if (result.code === 401) {
              uni.removeStorageSync('token')
              uni.removeStorageSync('userInfo')

              uni.showToast({
                title: '请先登录',
                icon: 'none'
              })

              reject(result)
              return
            }

            // 其他业务错误
            uni.showToast({
              title: result.message || '请求失败',
              icon: 'none'
            })

            reject(result)
          } catch (error) {
            console.error('Response parse error:', error)
            reject(error)
          }
        },
        fail: (err: any) => {
          console.error('Request failed:', err)

          let message = '网络请求失败'

          if (err.errMsg) {
            if (err.errMsg.includes('timeout')) {
              message = '请求超时'
            } else if (err.errMsg.includes('fail')) {
              message = '网络连接失败'
            }
          }

          uni.showToast({
            title: message,
            icon: 'none'
          })

          reject(err)
        }
      })
    })
  }
}

// 创建并导出实例
const http = new HttpRequest()

export default http
