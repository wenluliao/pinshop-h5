/**
 * 通用响应结构
 */
export interface Result<T = any> {
  code: number
  data: T
  message: string
}

/**
 * 用户信息
 */
export interface User {
  userId: string
  nickname: string
  avatarUrl: string
  phone: string
  openid?: string
  createTime?: string
}

/**
 * 用户登录请求
 */
export interface LoginReq {
  openid: string
  nickname?: string
  avatarUrl?: string
}

/**
 * 用户登录响应
 */
export interface LoginRes {
  token: string
  userInfo: User
}

/**
 * 收货地址
 */
export interface Address {
  addressId: string
  userId: string
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddr: string
  isDefault: number // 0-否 1-是
}

/**
 * 商品SKU
 */
export interface Product {
  skuId: number
  title: string
  subtitle?: string
  imgUrl: string
  originalPrice: number
  salePrice: number
  flashPrice?: number // 秒杀价
  stock: number
  sales?: number // 销量
  tags?: string[] // ["包邮", "热销"]
  flashEndTime?: number // 秒杀结束时间戳
  timeSlot?: string // 时间段 "08:00"
}

/**
 * 商品详情
 */
export interface ProductDetail extends Product {
  content: string // 商品详情HTML
  images: string[] // 商品图片列表
  categoryId: number
  specification?: string // 规格说明
}

/**
 * 秒杀事件
 */
export interface SeckillEvent {
  eventId: number
  skuId: number
  timeSlot: string
  flashPrice: number
  stock: number
  maxLimit: number // 单人限购数量
}

/**
 * 秒杀下单请求
 */
export interface SeckillReq {
  eventId: number
  skuId: number
  count: number
  userId: number
}

/**
 * 秒杀下单响应
 */
export interface SeckillRes {
  queueId: string
  status: 'QUEUING' | 'SUCCESS' | 'FAIL'
  orderId?: string
}

/**
 * 秒杀结果
 */
export interface SeckillResult {
  queueId: string
  status: 'QUEUING' | 'SUCCESS' | 'FAIL'
  orderId?: string
  message?: string
}

/**
 * 订单状态
 */
export enum OrderStatus {
  UNPAID = 10,    // 待支付
  PENDING = 20,   // 待发货
  SHIPPED = 30,   // 已发货
  COMPLETED = 40, // 已完成
  CANCELLED = 50  // 已取消
}

/**
 * 订单项
 */
export interface OrderItem {
  itemId: string
  skuId: number
  productTitle: string
  productImg: string
  salePrice: number
  count: number
  totalAmount: number
}

/**
 * 订单
 */
export interface Order {
  orderId: string
  orderNo: string
  userId: string
  status: OrderStatus
  totalAmount: number
  payAmount: number
  items: OrderItem[]
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  createTime: string
  payTime?: string
  shipTime?: string
  finishTime?: string
  isGroup?: boolean // 是否拼团订单
  groupId?: string // 拼团ID
}

/**
 * 订单统计
 */
export interface OrderCount {
  unpaid: number
  pending: number
  shipped: number
  completed: number
}

/**
 * 支付方式
 */
export enum PayType {
  WECHAT = 'WECHAT',
  ALIPAY = 'ALIPAY'
}

/**
 * 创建支付请求
 */
export interface CreatePayReq {
  userId: number
  orderId: number
  payType: PayType
}

/**
 * 支付响应
 */
export interface PayRes {
  paymentId: string
  payParams: any // 微信/支付宝支付参数
}

/**
 * 支付状态
 */
export enum PayStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

/**
 * 拼团会话
 */
export interface GroupSession {
  sessionId: string
  skuId: number
  initiatorId: number
  initiatorAvatar: string
  initiatorName: string
  requiredNum: number // 需要人数
  currentNum: number // 当前人数
  missingNum: number // 还差人数
  expireTime: number // 过期时间戳
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'
  createTime: number
}

/**
 * 拼团记录
 */
export interface GroupRecord {
  recordId: string
  sessionId: string
  orderId: string
  skuId: number
  productTitle: string
  productImg: string
  userId: number
  userName: string
  userAvatar: string
  isLeader: boolean // 是否团长
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED'
  joinTime: number
}

/**
 * 拼团详情
 */
export interface GroupDetail {
  session: GroupSession
  members: GroupRecord[]
}

/**
 * 管理后台仪表盘数据
 */
export interface DashboardData {
  uv: number // 访客数
  pv: number // 浏览量
  gmv: number // 成交额
  orderCount: number // 订单数
  pendingShip: number // 待发货
  userCount: number // 用户数
  todaySeckill: {
    totalOrders: number
    successRate: number
    avgProcessTime: number
  }
}

/**
 * 分页参数
 */
export interface PageParams {
  pageNum: number
  pageSize: number
}

/**
 * 分页响应
 */
export interface PageRes<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}
