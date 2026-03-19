/**
 * 三餐记食 - Mock 接口文档
 *
 * 本文件定义了小程序所有 API 接口规范，供后台开发人员参考实现。
 * 所有接口返回 JSON 格式数据，采用统一的响应结构。
 */

// ==================== 数据模型 ====================

/**
 * 菜品分类
 * @typedef {Object} Category
 * @property {number} id - 分类ID
 * @property {string} code - 分类编码
 * @property {string} name - 分类名称
 * @property {string} icon - 图标名称
 * @property {number} sort - 排序
 */

/**
 * 菜品
 * @typedef {Object} Dish
 * @property {number} id - 菜品ID
 * @property {string} name - 菜品名称
 * @property {string} image - 图片URL
 * @property {number} categoryId - 分类ID
 * @property {string} categoryName - 分类名称
 * @property {number} calories - 热量(kcal)
 * @property {number} protein - 蛋白质(g)
 * @property {number} carbs - 碳水化合物(g)
 * @property {number} fat - 脂肪(g)
 * @property {string[]} mealTypes - 适合餐次: ["breakfast", "lunch", "dinner"]
 * @property {number} createdAt - 创建时间戳
 */

/**
 * 饮食规划
 * @typedef {Object} Plan
 * @property {number} id - 规划ID
 * @property {string} startDate - 开始日期 YYYY-MM-DD
 * @property {string} endDate - 结束日期 YYYY-MM-DD
 * @property {boolean} weeklyReset - 是否每周重置
 * @property {Object.<string, DayPlan>} days - 日期到每日规划的映射
 * @property {number} createdAt - 创建时间戳
 *
 * 每日规划
 * @typedef {Object} DayPlan
 * @property {number[]} breakfast - 早餐菜品ID数组
 * @property {number[]} lunch - 午餐菜品ID数组
 * @property {number[]} dinner - 晚餐菜品ID数组
 */

/**
 * 打卡记录
 * @typedef {Object} Streak
 * @property {number} current - 当前连续天数
 * @property {number} longest - 最长连续天数
 * @property {string} lastDate - 最后打卡日期 YYYY-MM-DD
 * @property {string[]} checkIns - 打卡日期列表
 */

// ==================== Mock 数据示例 ====================

const mockData = {
  // 分类列表
  categories: [
    { id: 1, code: 'staple', name: '主食', icon: 'rice', sort: 1 },
    { id: 2, code: 'meat', name: '肉类', icon: 'meat', sort: 2 },
    { id: 3, code: 'vegetable', name: '蔬菜', icon: 'vegetable', sort: 3 },
    { id: 4, code: 'soup', name: '汤类', icon: 'soup', sort: 4 },
    { id: 5, code: 'fruit', name: '水果', icon: 'fruit', sort: 5 },
    { id: 6, code: 'other', name: '其他', icon: 'other', sort: 6 }
  ],

  // 菜品列表
  dishes: [
    {
      id: 1,
      name: '番茄炒蛋',
      image: 'https://picsum.photos/200/200?random=1',
      categoryId: 3,
      categoryName: '蔬菜',
      calories: 180,
      protein: 8,
      carbs: 12,
      fat: 10,
      mealTypes: ['breakfast', 'lunch'],
      createdAt: Date.now()
    },
    {
      id: 2,
      name: '红烧肉',
      image: 'https://picsum.photos/200/200?random=2',
      categoryId: 2,
      categoryName: '肉类',
      calories: 450,
      protein: 25,
      carbs: 8,
      fat: 35,
      mealTypes: ['lunch', 'dinner'],
      createdAt: Date.now()
    },
    {
      id: 3,
      name: '清炒时蔬',
      image: 'https://picsum.photos/200/200?random=3',
      categoryId: 3,
      categoryName: '蔬菜',
      calories: 80,
      protein: 3,
      carbs: 6,
      fat: 5,
      mealTypes: ['lunch', 'dinner'],
      createdAt: Date.now()
    },
    {
      id: 4,
      name: '米饭',
      image: 'https://picsum.photos/200/200?random=4',
      categoryId: 1,
      categoryName: '主食',
      calories: 230,
      protein: 4,
      carbs: 50,
      fat: 1,
      mealTypes: ['lunch', 'dinner'],
      createdAt: Date.now()
    },
    {
      id: 5,
      name: '紫菜蛋花汤',
      image: 'https://picsum.photos/200/200?random=5',
      categoryId: 4,
      categoryName: '汤类',
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
      id: 1,
      startDate: '2024-03-18',
      endDate: '2024-03-24',
      weeklyReset: false,
      days: {
        '2024-03-18': {
          breakfast: [1],
          lunch: [2, 3, 4],
          dinner: [3, 4, 5]
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