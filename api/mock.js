/**
 * 三餐记食 - Mock 接口文档
 *
 * 本文件定义了小程序所有 API 接口规范，供后台开发人员参考实现。
 * 所有接口返回 JSON 格式数据，采用统一的响应结构。
 */

// ==================== 基础配置 ====================

/**
 * 基础 URL
 * 开发环境: http://localhost:3000/api
 * 生产环境: https://api.sancanji.com/api
 */

/**
 * 统一响应格式
 * @typedef {Object} ApiResponse
 * @property {number} code - 状态码：0=成功，其他=失败
 * @property {string} message - 提示信息
 * @property {any} data - 返回数据
 *
 * 成功响应示例:
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": { ... }
 * }
 *
 * 失败响应示例:
 * {
 *   "code": 1001,
 *   "message": "参数错误",
 *   "data": null
 * }
 */

/**
 * 分页请求参数
 * @typedef {Object} PageParams
 * @property {number} page - 页码，从1开始
 * @property {number} pageSize - 每页数量，默认20
 */

/**
 * 分页响应数据
 * @typedef {Object} PageData
 * @property {Array} list - 数据列表
 * @property {number} total - 总数量
 * @property {number} page - 当前页码
 * @property {number} pageSize - 每页数量
 */

// ==================== 数据模型 ====================

/**
 * 菜品分类
 * @typedef {Object} Category
 * @property {string} id - 分类ID
 * @property {string} name - 分类名称
 * @property {string} icon - 图标名称
 *
 * 示例:
 * {
 *   "id": "staple",
 *   "name": "主食",
 *   "icon": "rice"
 * }
 */

/**
 * 菜品
 * @typedef {Object} Dish
 * @property {string} id - 菜品ID
 * @property {string} name - 菜品名称
 * @property {string} image - 图片URL
 * @property {string} category - 分类ID
 * @property {number} calories - 热量(kcal)
 * @property {number} protein - 蛋白质(g)
 * @property {number} carbs - 碳水化合物(g)
 * @property {number} fat - 脂肪(g)
 * @property {string[]} mealTypes - 适合餐次: ["breakfast", "lunch", "dinner"]
 * @property {number} createdAt - 创建时间戳
 *
 * 示例:
 * {
 *   "id": "abc123",
 *   "name": "番茄炒蛋",
 *   "image": "https://example.com/dish.jpg",
 *   "category": "vegetable",
 *   "calories": 180,
 *   "protein": 8,
 *   "carbs": 12,
 *   "fat": 10,
 *   "mealTypes": ["breakfast", "lunch"],
 *   "createdAt": 1700000000000
 * }
 */

/**
 * 饮食规划
 * @typedef {Object} Plan
 * @property {string} id - 规划ID
 * @property {string} startDate - 开始日期 YYYY-MM-DD
 * @property {string} endDate - 结束日期 YYYY-MM-DD
 * @property {boolean} weeklyReset - 是否每周重置
 * @property {Object.<string, DayPlan>} days - 日期到每日规划的映射
 * @property {number} createdAt - 创建时间戳
 *
 * 每日规划
 * @typedef {Object} DayPlan
 * @property {string[]} breakfast - 早餐菜品ID数组
 * @property {string[]} lunch - 午餐菜品ID数组
 * @property {string[]} dinner - 晚餐菜品ID数组
 *
 * 示例:
 * {
 *   "id": "plan123",
 *   "startDate": "2024-03-18",
 *   "endDate": "2024-03-24",
 *   "weeklyReset": false,
 *   "days": {
 *     "2024-03-18": {
 *       "breakfast": ["dish1", "dish2"],
 *       "lunch": ["dish3"],
 *       "dinner": ["dish4", "dish5"]
 *     }
 *   },
 *   "createdAt": 1710720000000
 * }
 */

/**
 * 打卡记录
 * @typedef {Object} Streak
 * @property {number} current - 当前连续天数
 * @property {number} longest - 最长连续天数
 * @property {string} lastDate - 最后打卡日期 YYYY-MM-DD
 * @property {string[]} checkIns - 打卡日期列表
 *
 * 示例:
 * {
 *   "current": 7,
 *   "longest": 14,
 *   "lastDate": "2024-03-18",
 *   "checkIns": ["2024-03-12", "2024-03-13", ...]
 * }
 */

// ==================== 接口定义 ====================

// ==================== 1. 分类接口 ====================

/**
 * 获取分类列表
 * GET /categories
 *
 * @response {Category[]} data - 分类列表
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": [
 *     { "id": "staple", "name": "主食", "icon": "rice" },
 *     { "id": "meat", "name": "肉类", "icon": "meat" },
 *     { "id": "vegetable", "name": "蔬菜", "icon": "vegetable" },
 *     { "id": "soup", "name": "汤类", "icon": "soup" },
 *     { "id": "fruit", "name": "水果", "icon": "fruit" },
 *     { "id": "other", "name": "其他", "icon": "other" }
 *   ]
 * }
 */

// ==================== 2. 菜品接口 ====================

/**
 * 获取菜品列表
 * GET /dishes
 *
 * @query {number} page - 页码，默认1
 * @query {number} pageSize - 每页数量，默认20
 * @query {string} category - 分类ID（可选）
 * @query {string} keyword - 搜索关键词（可选）
 * @query {string} mealType - 餐次筛选: breakfast/lunch/dinner（可选）
 *
 * @response {PageData} data - 分页数据
 * @response {Dish[]} data.list - 菜品列表
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": {
 *     "list": [
 *       {
 *         "id": "abc123",
 *         "name": "番茄炒蛋",
 *         "image": "https://example.com/dish.jpg",
 *         "category": "vegetable",
 *         "calories": 180,
 *         "protein": 8,
 *         "carbs": 12,
 *         "fat": 10,
 *         "mealTypes": ["breakfast", "lunch"],
 *         "createdAt": 1700000000000
 *       }
 *     ],
 *     "total": 50,
 *     "page": 1,
 *     "pageSize": 20
 *   }
 * }
 */

/**
 * 获取菜品详情
 * GET /dishes/:id
 *
 * @param {string} id - 菜品ID
 *
 * @response {Dish} data - 菜品详情
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": {
 *     "id": "abc123",
 *     "name": "番茄炒蛋",
 *     "image": "https://example.com/dish.jpg",
 *     "category": "vegetable",
 *     "calories": 180,
 *     "protein": 8,
 *     "carbs": 12,
 *     "fat": 10,
 *     "mealTypes": ["breakfast", "lunch"],
 *     "createdAt": 1700000000000
 *   }
 * }
 *
 * 错误码:
 * - 2001: 菜品不存在
 */

/**
 * 添加菜品
 * POST /dishes
 *
 * @body {Object} dish - 菜品信息
 * @body {string} dish.name - 菜品名称（必填）
 * @body {string} dish.image - 图片URL（可选）
 * @body {string} dish.category - 分类ID（可选）
 * @body {number} dish.calories - 热量（可选）
 * @body {number} dish.protein - 蛋白质（可选）
 * @body {number} dish.carbs - 碳水化合物（可选）
 * @body {number} dish.fat - 脂肪（可选）
 * @body {string[]} dish.mealTypes - 适合餐次（可选）
 *
 * 请求示例:
 * {
 *   "name": "番茄炒蛋",
 *   "image": "https://example.com/dish.jpg",
 *   "category": "vegetable",
 *   "calories": 180,
 *   "protein": 8,
 *   "carbs": 12,
 *   "fat": 10,
 *   "mealTypes": ["breakfast", "lunch"]
 * }
 *
 * @response {Dish} data - 新创建的菜品（含id和createdAt）
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "添加成功",
 *   "data": {
 *     "id": "abc123",
 *     "name": "番茄炒蛋",
 *     ...
 *     "createdAt": 1700000000000
 *   }
 * }
 *
 * 错误码:
 * - 1001: 参数错误（名称为空）
 * - 1002: 菜品名称已存在
 */

/**
 * 更新菜品
 * PUT /dishes/:id
 *
 * @param {string} id - 菜品ID
 * @body {Object} dish - 更新的菜品信息（部分更新）
 *
 * 请求示例:
 * {
 *   "name": "番茄炒蛋",
 *   "calories": 200
 * }
 *
 * @response {Dish} data - 更新后的菜品
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "更新成功",
 *   "data": { ... }
 * }
 *
 * 错误码:
 * - 2001: 菜品不存在
 * - 1002: 菜品名称已存在
 */

/**
 * 删除菜品
 * DELETE /dishes/:id
 *
 * @param {string} id - 菜品ID
 *
 * @response {Object} data - 空对象
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "删除成功",
 *   "data": {}
 * }
 *
 * 错误码:
 * - 2001: 菜品不存在
 *
 * 注意:
 * - 删除菜品时，需要同时从所有规划中移除该菜品
 */

/**
 * 批量获取菜品信息
 * POST /dishes/batch
 *
 * @body {string[]} ids - 菜品ID数组
 *
 * 请求示例:
 * {
 *   "ids": ["abc123", "def456", "ghi789"]
 * }
 *
 * @response {Dish[]} data - 菜品列表
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": [
 *     { "id": "abc123", "name": "番茄炒蛋", ... },
 *     { "id": "def456", "name": "红烧肉", ... }
 *   ]
 * }
 */

/**
 * 检查菜品是否在规划中使用
 * GET /dishes/:id/in-plans
 *
 * @param {string} id - 菜品ID
 *
 * @response {Object} data
 * @response {boolean} data.inPlan - 是否在规划中
 * @response {string} data.planDateRange - 规划日期范围（如果存在）
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": {
 *     "inPlan": true,
 *     "planDateRange": "2024-03-18 ~ 2024-03-24"
 *   }
 * }
 */

// ==================== 3. 规划接口 ====================

/**
 * 获取规划列表
 * GET /plans
 *
 * @query {number} page - 页码，默认1
 * @query {number} pageSize - 每页数量，默认20
 * @query {string} status - 状态筛选: current/future/history（可选）
 *
 * @response {PageData} data - 分页数据
 * @response {Plan[]} data.list - 规划列表（不包含days详情）
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": {
 *     "list": [
 *       {
 *         "id": "plan123",
 *         "startDate": "2024-03-18",
 *         "endDate": "2024-03-24",
 *         "weeklyReset": false,
 *         "createdAt": 1710720000000
 *       }
 *     ],
 *     "total": 10,
 *     "page": 1,
 *     "pageSize": 20
 *   }
 * }
 */

/**
 * 获取规划详情
 * GET /plans/:id
 *
 * @param {string} id - 规划ID
 *
 * @response {Plan} data - 规划详情（含完整days数据）
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": {
 *     "id": "plan123",
 *     "startDate": "2024-03-18",
 *     "endDate": "2024-03-24",
 *     "weeklyReset": false,
 *     "days": {
 *       "2024-03-18": {
 *         "breakfast": ["dish1", "dish2"],
 *         "lunch": ["dish3"],
 *         "dinner": ["dish4"]
 *       },
 *       "2024-03-19": {
 *         "breakfast": [],
 *         "lunch": [],
 *         "dinner": []
 *       }
 *     },
 *     "createdAt": 1710720000000
 *   }
 * }
 *
 * 错误码:
 * - 3001: 规划不存在
 */

/**
 * 获取今日规划
 * GET /plans/today
 *
 * @response {Plan|null} data - 今日所属的规划，无则返回null
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": {
 *     "id": "plan123",
 *     "startDate": "2024-03-18",
 *     "endDate": "2024-03-24",
 *     "days": { ... },
 *     ...
 *   }
 * }
 */

/**
 * 创建规划
 * POST /plans
 *
 * @body {Object} plan - 规划信息
 * @body {string} plan.startDate - 开始日期 YYYY-MM-DD（必填）
 * @body {string} plan.endDate - 结束日期 YYYY-MM-DD（必填）
 * @body {boolean} plan.weeklyReset - 是否每周重置（可选，默认false）
 *
 * 请求示例:
 * {
 *   "startDate": "2024-03-18",
 *   "endDate": "2024-03-24",
 *   "weeklyReset": false
 * }
 *
 * @response {Plan} data - 新创建的规划
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "创建成功",
 *   "data": {
 *     "id": "plan123",
 *     "startDate": "2024-03-18",
 *     "endDate": "2024-03-24",
 *     "weeklyReset": false,
 *     "days": {
 *       "2024-03-18": { "breakfast": [], "lunch": [], "dinner": [] },
 *       ...
 *     },
 *     "createdAt": 1710720000000
 *   }
 * }
 *
 * 错误码:
 * - 1001: 参数错误
 * - 3002: 日期范围无效
 */

/**
 * 更新规划
 * PUT /plans/:id
 *
 * @param {string} id - 规划ID
 * @body {Object} plan - 更新的规划信息
 *
 * 请求示例 - 更新基本信息:
 * {
 *   "weeklyReset": true
 * }
 *
 * 请求示例 - 更新某日餐食:
 * {
 *   "days": {
 *     "2024-03-18": {
 *       "breakfast": ["dish1", "dish2"],
 *       "lunch": ["dish3"],
 *       "dinner": ["dish4"]
 *     }
 *   }
 * }
 *
 * 请求示例 - 添加菜品到某餐:
 * {
 *   "action": "addDish",
 *   "date": "2024-03-18",
 *   "meal": "breakfast",
 *   "dishId": "dish1"
 * }
 *
 * 请求示例 - 移除菜品:
 * {
 *   "action": "removeDish",
 *   "date": "2024-03-18",
 *   "meal": "breakfast",
 *   "dishId": "dish1"
 * }
 *
 * @response {Plan} data - 更新后的规划
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "更新成功",
 *   "data": { ... }
 * }
 *
 * 错误码:
 * - 3001: 规划不存在
 * - 3003: 日期不在规划范围内
 * - 2001: 菜品不存在
 */

/**
 * 删除规划
 * DELETE /plans/:id
 *
 * @param {string} id - 规划ID
 *
 * @response {Object} data - 空对象
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "删除成功",
 *   "data": {}
 * }
 *
 * 错误码:
 * - 3001: 规划不存在
 */

/**
 * 检查日期冲突
 * GET /plans/check-conflict
 *
 * @query {string} startDate - 开始日期 YYYY-MM-DD
 * @query {string} endDate - 结束日期 YYYY-MM-DD
 * @query {string} excludeId - 排除的规划ID（编辑时使用，可选）
 *
 * @response {Object} data
 * @response {boolean} data.hasConflict - 是否有冲突
 * @response {Plan[]} data.conflicts - 冲突的规划列表
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": {
 *     "hasConflict": true,
 *     "conflicts": [
 *       {
 *         "id": "plan456",
 *         "startDate": "2024-03-20",
 *         "endDate": "2024-03-26"
 *       }
 *     ]
 *   }
 * }
 */

/**
 * 获取已规划日期
 * GET /plans/planned-dates
 *
 * @query {string} excludeId - 排除的规划ID（可选）
 *
 * @response {Object} data
 * @response {string[]} data.dates - 已规划日期列表
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": {
 *     "dates": ["2024-03-18", "2024-03-19", "2024-03-20", ...]
 *   }
 * }
 */

/**
 * 计算每日营养
 * POST /plans/calculate-nutrition
 *
 * @body {string[]} dishIds - 菜品ID数组
 *
 * 请求示例:
 * {
 *   "dishIds": ["dish1", "dish2", "dish3"]
 * }
 *
 * @response {Object} data - 营养汇总
 * @response {number} data.calories - 总热量
 * @response {number} data.protein - 总蛋白质
 * @response {number} data.carbs - 总碳水
 * @response {number} data.fat - 总脂肪
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": {
 *     "calories": 650,
 *     "protein": 35,
 *     "carbs": 80,
 *     "fat": 25
 *   }
 * }
 */

// ==================== 4. 打卡记录接口 ====================

/**
 * 获取打卡记录
 * GET /streak
 *
 * @response {Streak} data - 打卡记录
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": {
 *     "current": 7,
 *     "longest": 14,
 *     "lastDate": "2024-03-18",
 *     "checkIns": ["2024-03-12", "2024-03-13", ...]
 *   }
 * }
 */

/**
 * 更新打卡记录（完成三餐打卡）
 * POST /streak/check-in
 *
 * @body {string} date - 打卡日期 YYYY-MM-DD（可选，默认今天）
 *
 * 请求示例:
 * {
 *   "date": "2024-03-18"
 * }
 *
 * @response {Streak} data - 更新后的打卡记录
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "打卡成功",
 *   "data": {
 *     "current": 8,
 *     "longest": 14,
 *     "lastDate": "2024-03-18",
 *     "checkIns": [...]
 *   }
 * }
 *
 * 注意:
 * - 如果今天已经打卡，返回当前记录不变
 * - 如果是连续打卡，current + 1
 * - 如果断签，current 重置为 1
 */

// ==================== 5. 用户接口（预留） ====================

/**
 * 用户登录
 * POST /user/login
 *
 * @body {string} code - 微信登录code
 *
 * 请求示例:
 * {
 *   "code": "wx_code_xxx"
 * }
 *
 * @response {Object} data
 * @response {string} data.token - 登录凭证
 * @response {Object} data.userInfo - 用户信息
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "登录成功",
 *   "data": {
 *     "token": "jwt_token_xxx",
 *     "userInfo": {
 *       "openId": "xxx",
 *       "nickName": "用户昵称",
 *       "avatar": "头像URL"
 *     }
 *   }
 * }
 */

/**
 * 获取用户信息
 * GET /user/info
 *
 * @header {string} Authorization - Bearer token
 *
 * @response {Object} data - 用户信息
 */

/**
 * 更新用户信息
 * PUT /user/info
 *
 * @header {string} Authorization - Bearer token
 * @body {Object} userInfo - 更新的用户信息
 */

// ==================== 6. 文件上传接口 ====================

/**
 * 上传图片
 * POST /upload/image
 *
 * @body {File} file - 图片文件
 *
 * @response {Object} data
 * @response {string} data.url - 图片URL
 *
 * 响应示例:
 * {
 *   "code": 0,
 *   "message": "上传成功",
 *   "data": {
 *     "url": "https://cdn.example.com/images/xxx.jpg"
 *   }
 * }
 *
 * 错误码:
 * - 4001: 文件格式不支持
 * - 4002: 文件大小超限
 */

// ==================== 错误码定义 ====================

/**
 * 全局错误码
 *
 * 通用错误 (1xxx):
 * - 1000: 未知错误
 * - 1001: 参数错误
 * - 1002: 数据已存在
 * - 1003: 操作失败
 * - 1004: 无权限
 * - 1005: 登录过期
 *
 * 菜品相关 (2xxx):
 * - 2001: 菜品不存在
 * - 2002: 菜品名称已存在
 * - 2003: 菜品正在使用中
 *
 * 规划相关 (3xxx):
 * - 3001: 规划不存在
 * - 3002: 日期范围无效
 * - 3003: 日期不在规划范围内
 * - 3004: 规划日期冲突
 *
 * 文件相关 (4xxx):
 * - 4001: 文件格式不支持
 * - 4002: 文件大小超限
 * - 4003: 上传失败
 *
 * 用户相关 (5xxx):
 * - 5001: 用户不存在
 * - 5002: 登录失败
 * - 5003: Token无效
 */

// ==================== Mock 数据示例 ====================

const mockData = {
  // 分类列表
  categories: [
    { id: 'staple', name: '主食', icon: 'rice' },
    { id: 'meat', name: '肉类', icon: 'meat' },
    { id: 'vegetable', name: '蔬菜', icon: 'vegetable' },
    { id: 'soup', name: '汤类', icon: 'soup' },
    { id: 'fruit', name: '水果', icon: 'fruit' },
    { id: 'other', name: '其他', icon: 'other' }
  ],

  // 菜品列表
  dishes: [
    {
      id: 'dish001',
      name: '番茄炒蛋',
      image: 'https://picsum.photos/200/200?random=1',
      category: 'vegetable',
      calories: 180,
      protein: 8,
      carbs: 12,
      fat: 10,
      mealTypes: ['breakfast', 'lunch'],
      createdAt: Date.now()
    },
    {
      id: 'dish002',
      name: '红烧肉',
      image: 'https://picsum.photos/200/200?random=2',
      category: 'meat',
      calories: 450,
      protein: 25,
      carbs: 8,
      fat: 35,
      mealTypes: ['lunch', 'dinner'],
      createdAt: Date.now()
    },
    {
      id: 'dish003',
      name: '清炒时蔬',
      image: 'https://picsum.photos/200/200?random=3',
      category: 'vegetable',
      calories: 80,
      protein: 3,
      carbs: 6,
      fat: 5,
      mealTypes: ['lunch', 'dinner'],
      createdAt: Date.now()
    },
    {
      id: 'dish004',
      name: '米饭',
      image: 'https://picsum.photos/200/200?random=4',
      category: 'staple',
      calories: 230,
      protein: 4,
      carbs: 50,
      fat: 1,
      mealTypes: ['lunch', 'dinner'],
      createdAt: Date.now()
    },
    {
      id: 'dish005',
      name: '紫菜蛋花汤',
      image: 'https://picsum.photos/200/200?random=5',
      category: 'soup',
      calories: 60,
      protein: 4,
      carbs: 3,
      fat: 3,
      mealTypes: ['lunch', 'dinner'],
      createdAt: Date.now()
    }
  ],

  // 规划列表
  plans: [
    {
      id: 'plan001',
      startDate: '2024-03-18',
      endDate: '2024-03-24',
      weeklyReset: false,
      days: {
        '2024-03-18': {
          breakfast: ['dish001'],
          lunch: ['dish002', 'dish003', 'dish004'],
          dinner: ['dish003', 'dish004', 'dish005']
        },
        '2024-03-19': {
          breakfast: [],
          lunch: [],
          dinner: []
        }
      },
      createdAt: Date.now()
    }
  ],

  // 打卡记录
  streak: {
    current: 7,
    longest: 14,
    lastDate: '2024-03-18',
    checkIns: ['2024-03-12', '2024-03-13', '2024-03-14', '2024-03-15', '2024-03-16', '2024-03-17', '2024-03-18']
  }
}

export default mockData