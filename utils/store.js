// 数据存储工具
const STORAGE_KEYS = {
  DISHES: 'dishes',
  PLANS: 'plans',
  CATEGORIES: 'categories',
  STREAK: 'streak'
}

// 默认分类
const DEFAULT_CATEGORIES = [
  { id: 'staple', name: '主食', icon: 'rice' },
  { id: 'meat', name: '肉类', icon: 'meat' },
  { id: 'vegetable', name: '蔬菜', icon: 'vegetable' },
  { id: 'soup', name: '汤类', icon: 'soup' },
  { id: 'fruit', name: '水果', icon: 'fruit' },
  { id: 'other', name: '其他', icon: 'other' }
]

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// 获取分类
function getCategories() {
  const data = uni.getStorageSync(STORAGE_KEYS.CATEGORIES)
  return data || DEFAULT_CATEGORIES
}

// 保存分类
function saveCategories(categories) {
  uni.setStorageSync(STORAGE_KEYS.CATEGORIES, categories)
}

// 获取所有菜品
function getDishes() {
  const data = uni.getStorageSync(STORAGE_KEYS.DISHES)
  return data || []
}

// 获取单个菜品
function getDish(id) {
  const dishes = getDishes()
  return dishes.find(d => d.id === id)
}

// 添加菜品
function addDish(dish) {
  const dishes = getDishes()
  const newDish = {
    id: generateId(),
    ...dish,
    createdAt: Date.now()
  }
  dishes.push(newDish)
  uni.setStorageSync(STORAGE_KEYS.DISHES, dishes)
  return newDish
}

// 更新菜品
function updateDish(id, data) {
  const dishes = getDishes()
  const index = dishes.findIndex(d => d.id === id)
  if (index !== -1) {
    dishes[index] = { ...dishes[index], ...data }
    uni.setStorageSync(STORAGE_KEYS.DISHES, dishes)
    return dishes[index]
  }
  return null
}

// 删除菜品
function deleteDish(id) {
  const dishes = getDishes()
  const filtered = dishes.filter(d => d.id !== id)
  uni.setStorageSync(STORAGE_KEYS.DISHES, filtered)

  // 从所有规划中移除该菜品
  const plans = getPlans()
  plans.forEach(plan => {
    if (!plan.days) return
    for (const date in plan.days) {
      const day = plan.days[date]
      if (day.breakfast) {
        day.breakfast = day.breakfast.filter(dishId => dishId !== id)
      }
      if (day.lunch) {
        day.lunch = day.lunch.filter(dishId => dishId !== id)
      }
      if (day.dinner) {
        day.dinner = day.dinner.filter(dishId => dishId !== id)
      }
    }
  })
  uni.setStorageSync(STORAGE_KEYS.PLANS, plans)
}

// 按分类获取菜品
function getDishesByCategory(categoryId) {
  const dishes = getDishes()
  if (!categoryId) return dishes
  return dishes.filter(d => d.category === categoryId)
}

// 搜索菜品
function searchDishes(keyword) {
  const dishes = getDishes()
  if (!keyword) return dishes
  return dishes.filter(d => d.name.includes(keyword))
}

// 获取所有规划
function getPlans() {
  const data = uni.getStorageSync(STORAGE_KEYS.PLANS)
  return data || []
}

// 获取单个规划
function getPlan(id) {
  const plans = getPlans()
  return plans.find(p => p.id === id)
}

// 添加规划
function addPlan(plan) {
  const plans = getPlans()
  const newPlan = {
    id: generateId(),
    ...plan,
    createdAt: Date.now()
  }
  plans.push(newPlan)
  uni.setStorageSync(STORAGE_KEYS.PLANS, plans)
  return newPlan
}

// 更新规划
function updatePlan(id, data) {
  const plans = getPlans()
  const index = plans.findIndex(p => p.id === id)
  if (index !== -1) {
    plans[index] = { ...plans[index], ...data }
    uni.setStorageSync(STORAGE_KEYS.PLANS, plans)
    return plans[index]
  }
  return null
}

// 删除规划
function deletePlan(id) {
  const plans = getPlans()
  const filtered = plans.filter(p => p.id !== id)
  uni.setStorageSync(STORAGE_KEYS.PLANS, filtered)
}

// 获取今日规划
function getTodayPlan() {
  const plans = getPlans()
  const today = formatDate(new Date())
  return plans.find(p => {
    return today >= p.startDate && today <= p.endDate
  })
}

// 格式化日期
function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 获取日期范围内的所有日期
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

// 计算每日营养
function calculateDayNutrition(dishIds) {
  const dishes = getDishes()
  const selectedDishes = dishIds.map(id => dishes.find(d => d.id === id)).filter(Boolean)
  return {
    calories: selectedDishes.reduce((sum, d) => sum + (d.calories || 0), 0),
    protein: selectedDishes.reduce((sum, d) => sum + (d.protein || 0), 0),
    carbs: selectedDishes.reduce((sum, d) => sum + (d.carbs || 0), 0),
    fat: selectedDishes.reduce((sum, d) => sum + (d.fat || 0), 0)
  }
}

// 获取连续打卡记录
function getStreak() {
  const data = uni.getStorageSync(STORAGE_KEYS.STREAK)
  return data || {
    current: 0,
    longest: 0,
    lastDate: '',
    checkIns: [] // 存储打卡日期列表
  }
}

// 更新连续打卡记录
function updateStreak() {
  const streak = getStreak()
  const today = formatDate(new Date())
  const yesterday = formatDate(new Date(Date.now() - 86400000))

  // 如果今天已经打卡，直接返回
  if (streak.lastDate === today) {
    return streak
  }

  // 检查是否是连续打卡
  if (streak.lastDate === yesterday) {
    streak.current += 1
  } else if (streak.lastDate !== today) {
    streak.current = 1
  }

  // 更新最长记录
  if (streak.current > streak.longest) {
    streak.longest = streak.current
  }

  streak.lastDate = today
  streak.checkIns.push(today)
  uni.setStorageSync(STORAGE_KEYS.STREAK, streak)

  return streak
}

// 检查今天是否完成所有三餐安排
function isDayComplete(plan, date) {
  if (!plan || !plan.days || !plan.days[date]) return false
  const day = plan.days[date]
  return day.breakfast.length > 0 && day.lunch.length > 0 && day.dinner.length > 0
}

// 获取时间相关的问候语
function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 9) {
    return { text: '早安', emoji: '🌅', message: '美好的一天从健康早餐开始' }
  } else if (hour >= 9 && hour < 12) {
    return { text: '上午好', emoji: '☀️', message: '记得安排今天的午餐哦' }
  } else if (hour >= 12 && hour < 14) {
    return { text: '中午好', emoji: '🍽️', message: '午餐时间到，享受美食吧' }
  } else if (hour >= 14 && hour < 18) {
    return { text: '下午好', emoji: '🌤️', message: '继续保持健康的饮食习惯' }
  } else if (hour >= 18 && hour < 22) {
    return { text: '晚上好', emoji: '🌙', message: '晚餐要适量，早点休息' }
  } else {
    return { text: '夜深了', emoji: '🌟', message: '注意休息，明天继续加油' }
  }
}

// 检查日期范围是否与现有规划冲突
function checkDateConflict(startDate, endDate, excludePlanId = null) {
  const plans = getPlans()
  const conflicts = []

  for (const plan of plans) {
    // 排除当前编辑的规划
    if (excludePlanId && plan.id === excludePlanId) continue

    // 检查日期范围是否有重叠
    const hasOverlap = !(endDate < plan.startDate || startDate > plan.endDate)
    if (hasOverlap) {
      conflicts.push(plan)
    }
  }

  return conflicts
}

// 获取所有已有规划的日期集合
function getPlannedDates(excludePlanId = null) {
  const plans = getPlans()
  const plannedDates = new Set()

  for (const plan of plans) {
    if (excludePlanId && plan.id === excludePlanId) continue
    const dates = getDateRange(plan.startDate, plan.endDate)
    dates.forEach(date => plannedDates.add(date))
  }

  return plannedDates
}

// 检查某个日期是否已有规划
function isDatePlanned(date, excludePlanId = null) {
  const plannedDates = getPlannedDates(excludePlanId)
  return plannedDates.has(date)
}

// 检查菜品是否在计划中使用
function isDishInPlans(dishId) {
  const plans = getPlans()
  for (const plan of plans) {
    if (!plan.days) continue
    for (const date in plan.days) {
      const day = plan.days[date]
      if (day.breakfast?.includes(dishId) ||
          day.lunch?.includes(dishId) ||
          day.dinner?.includes(dishId)) {
        return { inPlan: true, planDateRange: `${plan.startDate} ~ ${plan.endDate}` }
      }
    }
  }
  return { inPlan: false }
}

export default {
  STORAGE_KEYS,
  getCategories,
  saveCategories,
  getDishes,
  getDish,
  addDish,
  updateDish,
  deleteDish,
  getDishesByCategory,
  searchDishes,
  getPlans,
  getPlan,
  addPlan,
  updatePlan,
  deletePlan,
  getTodayPlan,
  formatDate,
  getDateRange,
  calculateDayNutrition,
  getStreak,
  updateStreak,
  isDayComplete,
  getGreeting,
  checkDateConflict,
  getPlannedDates,
  isDatePlanned,
  isDishInPlans
}