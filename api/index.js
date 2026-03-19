/**
 * API 请求封装
 *
 * 使用方式：
 * 1. 开发环境使用 mock 数据（useMock: true）
 * 2. 生产环境切换为真实接口
 */

import mockData from './mock.js'

// ==================== 配置 ====================

const config = {
  // 是否使用 mock 数据
  useMock: false,

  // API 基础地址
  baseURL: 'http://localhost:8080/api',

  // 请求超时时间
  timeout: 10000
}

// ==================== 请求封装 ====================

/**
 * 发起请求
 * @param {string} url - 请求路径
 * @param {Object} options - 请求选项
 * @returns {Promise} 请求结果
 */
function request(url, options = {}) {
  const {
    method = 'GET',
    data = null,
    header = {}
  } = options

  return new Promise((resolve, reject) => {
    // 如果使用 mock，直接返回 mock 数据
    if (config.useMock) {
      handleMock(url, method, data)
        .then(resolve)
        .catch(reject)
      return
    }

    // 获取token
    const token = uni.getStorageSync('token')
    const headers = {
      'Content-Type': 'application/json',
      ...header
    }
    // 只有当 token 有效时才添加 Authorization header
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      headers['Authorization'] = 'Bearer ' + token
    }

    // 真实请求
    uni.request({
      url: config.baseURL + url,
      method,
      data,
      header: headers,
      timeout: config.timeout,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            // token过期，跳转登录
            if (res.data.code === 1005) {
              uni.removeStorageSync('token')
              uni.reLaunch({ url: '/pages/index/index' })
            }
            reject(res.data)
          }
        } else {
          reject({
            code: res.statusCode,
            message: '网络请求失败'
          })
        }
      },
      fail: (err) => {
        reject({
          code: -1,
          message: err.errMsg || '网络请求失败'
        })
      }
    })
  })
}

// ==================== Mock 处理 ====================

/**
 * 处理 mock 请求
 */
function handleMock(url, method, data) {
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      const result = mockHandler(url, method, data)
      resolve({
        code: 0,
        message: 'success',
        data: result
      })
    }, 200)
  })
}

/**
 * Mock 处理器
 */
function mockHandler(url, method, data) {
  // 分类接口
  if (url === '/categories') {
    return mockData.categories
  }

  // 菜品列表
  if (url === '/dishes' && method === 'GET') {
    let list = [...mockData.dishes]

    // 分类筛选
    if (data?.category) {
      list = list.filter(d => d.category === data.category)
    }

    // 关键词搜索
    if (data?.keyword) {
      list = list.filter(d => d.name.includes(data.keyword))
    }

    // 分页
    const page = data?.page || 1
    const pageSize = data?.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      list: list.slice(start, end),
      total: list.length,
      page,
      pageSize
    }
  }

  // 菜品详情
  if (url.startsWith('/dishes/') && method === 'GET') {
    const id = url.split('/')[2]
    return mockData.dishes.find(d => d.id === id) || null
  }

  // 添加菜品
  if (url === '/dishes' && method === 'POST') {
    const newDish = {
      id: 'dish' + Date.now(),
      ...data,
      createdAt: Date.now()
    }
    mockData.dishes.push(newDish)
    return newDish
  }

  // 更新菜品
  if (url.startsWith('/dishes/') && method === 'PUT') {
    const id = url.split('/')[2]
    const index = mockData.dishes.findIndex(d => d.id === id)
    if (index !== -1) {
      mockData.dishes[index] = { ...mockData.dishes[index], ...data }
      return mockData.dishes[index]
    }
    return null
  }

  // 删除菜品
  if (url.startsWith('/dishes/') && method === 'DELETE') {
    const id = url.split('/')[2]
    const index = mockData.dishes.findIndex(d => d.id === id)
    if (index !== -1) {
      mockData.dishes.splice(index, 1)
    }
    return {}
  }

  // 批量获取菜品
  if (url === '/dishes/batch' && method === 'POST') {
    return mockData.dishes.filter(d => data.ids.includes(d.id))
  }

  // 检查菜品是否在规划中
  if (url.includes('/in-plans')) {
    const id = url.split('/')[2]
    for (const plan of mockData.plans) {
      for (const date in plan.days) {
        const day = plan.days[date]
        if (day.breakfast?.includes(id) ||
            day.lunch?.includes(id) ||
            day.dinner?.includes(id)) {
          return {
            inPlan: true,
            planDateRange: `${plan.startDate} ~ ${plan.endDate}`
          }
        }
      }
    }
    return { inPlan: false }
  }

  // 规划列表
  if (url === '/plans' && method === 'GET') {
    return {
      list: mockData.plans.map(p => ({
        id: p.id,
        startDate: p.startDate,
        endDate: p.endDate,
        weeklyReset: p.weeklyReset,
        createdAt: p.createdAt
      })),
      total: mockData.plans.length,
      page: 1,
      pageSize: 20
    }
  }

  // 规划详情
  if (url.startsWith('/plans/') && method === 'GET' && !url.includes('today') && !url.includes('check-conflict')) {
    const id = url.split('/')[2]
    return mockData.plans.find(p => p.id === id) || null
  }

  // 今日规划
  if (url === '/plans/today') {
    const today = formatDate(new Date())
    return mockData.plans.find(p => today >= p.startDate && today <= p.endDate) || null
  }

  // 创建规划
  if (url === '/plans' && method === 'POST') {
    const newPlan = {
      id: 'plan' + Date.now(),
      ...data,
      days: {},
      createdAt: Date.now()
    }
    // 初始化每日数据
    const dates = getDateRange(data.startDate, data.endDate)
    dates.forEach(date => {
      newPlan.days[date] = {
        breakfast: [],
        lunch: [],
        dinner: []
      }
    })
    mockData.plans.push(newPlan)
    return newPlan
  }

  // 更新规划
  if (url.startsWith('/plans/') && method === 'PUT') {
    const id = url.split('/')[2]
    const index = mockData.plans.findIndex(p => p.id === id)
    if (index !== -1) {
      mockData.plans[index] = { ...mockData.plans[index], ...data }
      return mockData.plans[index]
    }
    return null
  }

  // 删除规划
  if (url.startsWith('/plans/') && method === 'DELETE') {
    const id = url.split('/')[2]
    const index = mockData.plans.findIndex(p => p.id === id)
    if (index !== -1) {
      mockData.plans.splice(index, 1)
    }
    return {}
  }

  // 检查日期冲突
  if (url === '/plans/check-conflict') {
    const conflicts = []
    for (const plan of mockData.plans) {
      const hasOverlap = !(data.endDate < plan.startDate || data.startDate > plan.endDate)
      if (hasOverlap && plan.id !== data.excludeId) {
        conflicts.push({
          id: plan.id,
          startDate: plan.startDate,
          endDate: plan.endDate
        })
      }
    }
    return {
      hasConflict: conflicts.length > 0,
      conflicts
    }
  }

  // 已规划日期
  if (url === '/plans/planned-dates') {
    const dates = new Set()
    for (const plan of mockData.plans) {
      if (data?.excludeId && plan.id === data.excludeId) continue
      const range = getDateRange(plan.startDate, plan.endDate)
      range.forEach(d => dates.add(d))
    }
    return { dates: Array.from(dates) }
  }

  // 计算营养
  if (url === '/plans/calculate-nutrition') {
    const result = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    for (const dishId of data.dishIds) {
      const dish = mockData.dishes.find(d => d.id === dishId)
      if (dish) {
        result.calories += dish.calories || 0
        result.protein += dish.protein || 0
        result.carbs += dish.carbs || 0
        result.fat += dish.fat || 0
      }
    }
    return result
  }

  // 打卡记录
  if (url === '/streak' && method === 'GET') {
    return mockData.streak
  }

  // 打卡
  if (url === '/streak/check-in') {
    const today = data?.date || formatDate(new Date())
    const yesterday = formatDate(new Date(Date.now() - 86400000))

    if (mockData.streak.lastDate !== today) {
      if (mockData.streak.lastDate === yesterday) {
        mockData.streak.current += 1
      } else {
        mockData.streak.current = 1
      }

      if (mockData.streak.current > mockData.streak.longest) {
        mockData.streak.longest = mockData.streak.current
      }

      mockData.streak.lastDate = today
      mockData.streak.checkIns.push(today)
    }

    return mockData.streak
  }

  return null
}

// ==================== 工具函数 ====================

/**
 * 格式化日期
 */
function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 获取日期范围
 */
function getDateRange(startDate, endDate) {
  const dates = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  while (start <= end) {
    dates.push(formatDate(new Date(start)))
    start.setDate(start.getDate() + 1)
  }
  return dates
}

// ==================== API 接口 ====================

const api = {
  // ==================== 分类 ====================

  /**
   * 获取分类列表
   */
  getCategories() {
    return request('/categories')
  },

  // ==================== 菜品 ====================

  /**
   * 获取菜品列表
   * @param {Object} params
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.category - 分类ID
   * @param {string} params.keyword - 搜索关键词
   */
  getDishes(params = {}) {
    return request('/dishes', { data: params })
  },

  /**
   * 获取菜品详情
   * @param {string} id - 菜品ID
   */
  getDish(id) {
    return request(`/dishes/${id}`)
  },

  /**
   * 添加菜品
   * @param {Object} dish - 菜品信息
   */
  addDish(dish) {
    return request('/dishes', { method: 'POST', data: dish })
  },

  /**
   * 更新菜品
   * @param {string} id - 菜品ID
   * @param {Object} dish - 更新的菜品信息
   */
  updateDish(id, dish) {
    return request(`/dishes/${id}`, { method: 'PUT', data: dish })
  },

  /**
   * 删除菜品
   * @param {string} id - 菜品ID
   */
  deleteDish(id) {
    return request(`/dishes/${id}`, { method: 'DELETE' })
  },

  /**
   * 批量获取菜品
   * @param {string[]} ids - 菜品ID数组
   */
  getDishesBatch(ids) {
    return request('/dishes/batch', { method: 'POST', data: { ids } })
  },

  /**
   * 检查菜品是否在规划中
   * @param {string} id - 菜品ID
   */
  checkDishInPlans(id) {
    return request(`/dishes/${id}/in-plans`)
  },

  // ==================== 规划 ====================

  /**
   * 获取规划列表
   * @param {Object} params
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   */
  getPlans(params = {}) {
    return request('/plans', { data: params })
  },

  /**
   * 获取规划详情
   * @param {string} id - 规划ID
   */
  getPlan(id) {
    return request(`/plans/${id}`)
  },

  /**
   * 获取今日规划
   */
  getTodayPlan() {
    return request('/plans/today')
  },

  /**
   * 创建规划
   * @param {Object} plan - 规划信息
   */
  createPlan(plan) {
    return request('/plans', { method: 'POST', data: plan })
  },

  /**
   * 更新规划
   * @param {string} id - 规划ID
   * @param {Object} plan - 更新的规划信息
   */
  updatePlan(id, plan) {
    return request(`/plans/${id}`, { method: 'PUT', data: plan })
  },

  /**
   * 删除规划
   * @param {string} id - 规划ID
   */
  deletePlan(id) {
    return request(`/plans/${id}`, { method: 'DELETE' })
  },

  /**
   * 检查日期冲突
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @param {string} excludeId - 排除的规划ID
   */
  checkDateConflict(startDate, endDate, excludeId = null) {
    return request('/plans/check-conflict', {
      data: { startDate, endDate, excludeId }
    })
  },

  /**
   * 获取已规划日期
   * @param {string} excludeId - 排除的规划ID
   */
  getPlannedDates(excludeId = null) {
    return request('/plans/planned-dates', {
      data: { excludeId }
    })
  },

  /**
   * 计算营养
   * @param {string[]} dishIds - 菜品ID数组
   */
  calculateNutrition(dishIds) {
    return request('/plans/calculate-nutrition', {
      method: 'POST',
      data: { dishIds }
    })
  },

  // ==================== 打卡 ====================

  /**
   * 获取打卡记录
   */
  getStreak() {
    return request('/streak')
  },

  /**
   * 打卡
   * @param {string} date - 打卡日期（可选）
   */
  checkIn(date = null) {
    return request('/streak/check-in', {
      method: 'POST',
      data: { date }
    })
  },

  // ==================== 用户 ====================

  /**
   * 用户登录
   * @param {string} code - 微信登录code
   */
  async login(code) {
    const res = await request('/user/login', { method: 'POST', data: { code } })
    if (res.data && res.data.token) {
      uni.setStorageSync('token', res.data.token)
    }
    return res
  },

  /**
   * 微信登录（自动获取code）
   */
  wxLogin() {
    return new Promise((resolve, reject) => {
      uni.login({
        success: async (loginRes) => {
          try {
            const res = await this.login(loginRes.code)
            resolve(res)
          } catch (e) {
            reject(e)
          }
        },
        fail: reject
      })
    })
  },

  /**
   * 获取手机号
   * @param {string} code - 手机号code
   */
  getPhoneNumber(code) {
    return request('/user/phone', { method: 'POST', data: { code } })
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return request('/user/info')
  },

  /**
   * 更新用户信息
   * @param {Object} userInfo - 用户信息
   */
  updateUserInfo(userInfo) {
    return request('/user/info', { method: 'PUT', data: userInfo })
  },

  // ==================== 文件上传 ====================

  /**
   * 上传图片
   * @param {string} filePath - 本地文件路径
   */
  uploadImage(filePath) {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync('token')
      uni.uploadFile({
        url: config.baseURL + '/upload/image',
        filePath,
        name: 'file',
        header: token ? { 'Authorization': 'Bearer ' + token } : {},
        success: (res) => {
          const data = JSON.parse(res.data)
          if (data.code === 0) {
            resolve(data)
          } else {
            reject(data)
          }
        },
        fail: reject
      })
    })
  }
}

export default api