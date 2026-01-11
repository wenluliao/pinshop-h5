这份 `postman.json` 文件非常详细，涵盖了用户、商品、交易（秒杀）、订单、支付、拼团和管理后台七大核心模块，结构非常清晰。

基于你提供的这个 Postman 文件和之前的架构设计，我为你整理了 **V1.6 版本的前后端协作开发文档**。

这份文档的核心策略是：**后端负责生产标准（Smart-Doc 自动生成 JSON），前端负责消费标准（Apifox/Postman 导入 + 自动生成 TS 类型）**，实现完全无侵入的高效协作。

---

# 📘 FlashGroupBuy 前后端协作开发文档 (Project V1.6)

## 1. 核心协作工作流 (The Workflow)

为了实现“无侵入”且高效的接口对接，我们摒弃手动编写 Markdown 文档，采用以下全自动化流程：

1.  **后端 (Java)**: 编写代码时只需写好标准的 `Javadoc` 注释。
2.  **构建 (Maven)**: 运行 `mvn smart-doc:postman` (或 html/openapi)，自动在 `target/` 目录下生成 `postman.json`。
3.  **同步**:
    *   **方式 A (推荐)**: 将生成的 JSON 导入 **Apifox** 或 **YApi**。这些工具支持**自动生成前端 TypeScript 代码**。
    *   **方式 B (简单)**: 直接把 `postman.json` 扔给前端，前端导入 Postman 进行调试。
4.  **前端 (Uni-app)**: 根据 API 定义生成的 TS 类型进行开发，无需手动定义 Interface。

---

## 2. 前端技术栈选型 (Frontend Stack)

基于微信小程序场景和高并发秒杀的实时性要求，推荐以下技术栈：

| 模块 | 选型 | 理由 |
| :--- | :--- | :--- |
| **框架** | **Uni-app (Vue 3 + Vite + TypeScript)** | 一套代码发布到小程序和 H5，Vue 3 组合式 API 逻辑复用性强。 |
| **UI 组件库** | **Wot Design Uni** 或 **uView Plus** | 专为电商设计，包含倒计时、SKU 选择器、步进器等现成组件。 |
| **网络请求** | **luch-request** | Uni-app 社区最成熟的请求库，支持完善的拦截器（处理 Token 和全局错误）。 |
| **状态管理** | **Pinia** | 轻量级，对 TypeScript 支持极好。 |
| **Mock 工具** | **Apifox / Mock.js** | 后端接口没写好时，前端利用 Postman 定义的结构先行开发。 |

---

## 3. 前端架构与交互规范 (Frontend Architecture)

### 3.1 目录结构 (Uni-app)
```text
src/
├── api/                // 接口定义 (按模块划分)
│   ├── user.ts
│   ├── trade.ts        // 秒杀相关
│   └── group.ts        // 拼团相关
├── model/              // TypeScript 类型定义 (从 Apifox 自动导出)
│   └── types.d.ts
├── stores/             // Pinia 状态
│   └── userStore.ts
├── pages/              // 页面视图
│   ├── index/          // 首页 (秒杀流)
│   ├── detail/         // 商品详情 (倒计时/进度条)
│   └── order/          // 订单
└── utils/
    ├── request.ts      // luch-request 封装
    └── poller.ts       // 轮询工具类 (核心: 处理排队)
```

### 3.2 网络层封装 (request.ts)
前端必须统一处理后端的 `Result<T>` 结构。

```typescript
import Request from 'luch-request';
const http = new Request();

// 响应拦截器
http.interceptors.response.use((response) => {
    const { code, data, message } = response.data;
    
    // 200 代表业务成功
    if (code === 200) {
        return data;
    }
    
    // 401 未登录
    if (code === 401) {
        uni.navigateTo({ url: '/pages/login/index' });
        return Promise.reject('Unauthorized');
    }

    // 其他业务错误 (库存不足等)
    uni.showToast({ title: message, icon: 'none' });
    return Promise.reject(message);
}, (err) => {
    return Promise.reject(err);
});

export default http;
```

### 3.3 核心交互：秒杀轮询 (Seckill Polling)
针对 Postman 中的 `/api/v1/trade/seckill` 和 `/api/v1/trade/result/:queueId`，前端需要封装一个通用的轮询器。

```typescript
// utils/seckill-helper.ts

/**
 * 执行秒杀并轮询结果
 * @param skuId 商品ID
 * @param count 数量
 */
export async function handleSeckill(skuId: number, count: number) {
  try {
    // 1. 发起秒杀请求
    const { queueId, status } = await api.trade.doSeckill({ skuId, count });
    
    if (status === 'QUEUING') {
      uni.showLoading({ title: '排队中...' });
      // 2. 开始轮询 (每500ms查一次，最多查20次)
      return await pollResult(queueId);
    }
  } catch (e) {
    console.error(e);
  } finally {
    uni.hideLoading();
  }
}

async function pollResult(queueId: string, attempts = 0): Promise<any> {
  if (attempts > 20) throw new Error("请求超时，请稍后在订单查看");
  
  // 等待 500ms
  await new Promise(r => setTimeout(r, 500));
  
  const res = await api.trade.getSeckillResult(queueId);
  
  if (res.status === 'SUCCESS') {
    return res.orderId; // 抢购成功，跳转支付
  } else if (res.status === 'FAIL') {
    throw new Error("很遗憾，没抢到");
  } else {
    // 继续轮询
    return pollResult(queueId, attempts + 1);
  }
}
```

---

## 4. API 接口定义摘要 (基于 Postman 整理)

以下是供前端直接使用的核心接口清单，类型定义请参照 Postman 中的 JSON Body。

### 4.1 用户模块 (User)
*   `POST /api/v1/user/login`: 微信静默登录 (传入 openid, 实际生产环境传 code 由后端换 openid)。
*   `GET /api/v1/user/profile`: 获取用户信息。
*   `GET /api/v1/user/addresses`: 地址列表。

### 4.2 商品模块 (Product)
*   **`GET /api/v1/product/flash-list`** (核心)
    *   参数: `timeSlot` (如 "08:00")
    *   前端逻辑: 这里的 `stock` 是缓存库存，用于显示进度条。
*   `GET /api/v1/product/detail/:skuId`: 商品详情。

### 4.3 交易模块 (Trade - 高并发)
*   **`POST /api/v1/trade/seckill`**
    *   功能: **秒杀排队入口**。
    *   返回: `{ "queueId": "Q123", "status": "QUEUING" }`
*   **`GET /api/v1/trade/result/:queueId`**
    *   功能: **轮询查单**。
    *   返回: `{ "status": "SUCCESS", "orderId": "TD999" }`

### 4.4 拼团模块 (Group)
*   `POST /api/v1/group/initiate`: 发起拼团 (支付前调用，获取 groupId)。
*   `POST /api/v1/group/join`: 参与拼团。
*   **`GET /api/v1/group/:skuId/sessions`**
    *   功能: **详情页“正在拼”列表**。
    *   展示逻辑: 只展示 `expireTime > now` 且 `missingNum > 0` 的团。

### 4.5 管理后台模块 (Admin)
*   `GET /api/v1/admin/dashboard`: 聚合数据 (UV, GMV, 待发货)。
    *   建议前端使用 React/Vue Admin 的 `useQuery` 每 5 秒轮询一次，实现实时大屏效果。

---

## 5. 数据字典与类型定义 (Types)

建议前端建立 `types.d.ts`，直接映射后端的 Record。

```typescript
// 商品对象
export interface ProductVO {
  skuId: number;
  title: string;
  imgUrl: string;
  originalPrice: number;
  salePrice: number;
  flashPrice?: number; // 如果是秒杀品
  stock: number;
  tags: string[];      // ["包邮", "热销"]
}

// 订单对象
export interface OrderVO {
  orderId: string; // 注意：后端Long类型前端可能会精度丢失，建议后端转String传给前端
  status: number;  // 10:待付 20:待发 30:已发
  totalAmount: number;
  items: OrderItem[];
  createTime: string; // ISO String
}

// 拼团会话
export interface GroupSessionVO {
  sessionId: string;
  initiatorAvatar: string;
  initiatorName: string;
  missingNum: number;  // 还差几人
  expireTime: number;  // 毫秒时间戳
}
```

---

## 6. 开发建议

1.  **精度问题**: 后端的 `Long` 类型 ID (如订单号、用户 ID) 在 JavaScript 中可能会丢失精度。
    *   *后端处理*: Jackson 配置 `ToStringSerializer`，将所有 `Long` 转为 String 输出。
    *   *前端处理*: 统一当做字符串处理。
2.  **图片加载**: 商品列表页图片很多，Uni-app 中务必使用 `<image mode="aspectFill" lazy-load>` 开启懒加载。
3.  **倒计时**: 不要在 `setInterval` 中直接减秒数，而是**计算目标时间戳与当前时间的差值**，防止浏览器后台运行导致的计时偏差。

这一套方案结合了 Postman 的详细定义和你之前的高性能后端架构，前端开发人员可以直接开工。
