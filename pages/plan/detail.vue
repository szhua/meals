<template>
  <view class="container">
    <!-- 规划信息头部 -->
    <view class="plan-header">
      <view class="plan-info">
        <text class="plan-date">{{ plan.startDate }} ~ {{ plan.endDate }}</text>
        <view class="plan-stats">
          <view class="stat-item">
            <text class="stat-value">{{ days.length }}</text>
            <text class="stat-label">天</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ arrangedCount }}</text>
            <text class="stat-label">餐已安排</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 三餐表格 -->
    <scroll-view
      scroll-x
      class="table-scroll"
      :show-scrollbar="false"
      enable-flex
    >
      <view class="meal-table" :style="{ width: tableWidth + 'rpx' }">
        <!-- 表头 -->
        <view class="table-header">
          <view class="th th-date">日期</view>
          <view class="th th-meal th-breakfast">
            <view class="meal-indicator breakfast"></view>
            <text class="meal-name">早餐</text>
          </view>
          <view class="th th-meal th-lunch">
            <view class="meal-indicator lunch"></view>
            <text class="meal-name">午餐</text>
          </view>
          <view class="th th-meal th-dinner">
            <view class="meal-indicator dinner"></view>
            <text class="meal-name">晚餐</text>
          </view>
        </view>

        <!-- 表体 -->
        <view class="table-body">
          <view class="table-row" v-for="day in days" :key="day.date">
            <!-- 日期列 -->
            <view class="td td-date">
              <view class="date-main">
                <text class="date-num">{{ formatDay(day.date) }}</text>
                <text
                  class="date-week"
                  :class="{ 'is-today': isToday(day.date) }"
                  >{{ getWeekDay(day.date) }}</text
                >
              </view>
              <view class="date-calorie">
                <text class="calorie-value">{{
                  getDayCalories(day.date)
                }}</text>
                <text class="calorie-unit">kcal</text>
              </view>
            </view>

            <!-- 早餐列 -->
            <view class="td td-meal td-breakfast">
              <view class="dish-list">
                <view
                  v-for="dishId in day.meals.breakfast"
                  :key="dishId"
                  class="dish-item breakfast"
                  @tap="showDishDetail(dishId)"
                >
                  <text class="dish-name">{{ getDishName(dishId) }}</text>
                  <view
                    class="dish-remove"
                    @tap.stop="removeDish(day.date, 'breakfast', dishId)"
                  >
                    <text class="remove-icon">×</text>
                  </view>
                </view>
                <view
                  class="add-dish-btn"
                  @tap="addDish(day.date, 'breakfast')"
                >
                  <text class="add-icon">+</text>
                </view>
              </view>
            </view>

            <!-- 午餐列 -->
            <view class="td td-meal td-lunch">
              <view class="dish-list">
                <view
                  v-for="dishId in day.meals.lunch"
                  :key="dishId"
                  class="dish-item lunch"
                  @tap="showDishDetail(dishId)"
                >
                  <text class="dish-name">{{ getDishName(dishId) }}</text>
                  <view
                    class="dish-remove"
                    @tap.stop="removeDish(day.date, 'lunch', dishId)"
                  >
                    <text class="remove-icon">×</text>
                  </view>
                </view>
                <view class="add-dish-btn" @tap="addDish(day.date, 'lunch')">
                  <text class="add-icon">+</text>
                </view>
              </view>
            </view>

            <!-- 晚餐列 -->
            <view class="td td-meal td-dinner">
              <view class="dish-list">
                <view
                  v-for="dishId in day.meals.dinner"
                  :key="dishId"
                  class="dish-item dinner"
                  @tap="showDishDetail(dishId)"
                >
                  <text class="dish-name">{{ getDishName(dishId) }}</text>
                  <view
                    class="dish-remove"
                    @tap.stop="removeDish(day.date, 'dinner', dishId)"
                  >
                    <text class="remove-icon">×</text>
                  </view>
                </view>
                <view class="add-dish-btn" @tap="addDish(day.date, 'dinner')">
                  <text class="add-icon">+</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 菜品选择弹窗 -->
    <view class="dish-modal" v-if="showDishModal" @tap.self="closeModal">
      <view class="modal-content">
        <view class="modal-header">
          <view class="modal-title-wrap">
            <view class="modal-indicator" :class="currentMeal"></view>
            <text class="modal-title"
              >选择{{ getMealTypeName(currentMeal) }}菜品</text
            >
          </view>
          <view class="modal-close" @tap="closeModal">
            <text class="close-icon">×</text>
          </view>
        </view>

        <view class="modal-search-wrap">
          <icon name="search" size="28" />
          <input
            class="modal-search"
            v-model="searchKeyword"
            placeholder="搜索菜品名称"
          />
        </view>

        <scroll-view
          class="modal-list"
          scroll-y
          :scroll-with-animation="true"
          :enable-flex="true"
          :enable-avoid-clip="true"
          :enable-passive="true"
          scroll-anchoring
        >
          <view
            v-for="dish in filteredDishes"
            :key="dish.id"
            class="modal-dish-item"
            :class="{ adding: addingDishId === dish.id }"
            @tap="selectDish(dish.id)"
          >
            <image
              v-if="dish.image"
              class="modal-dish-img"
              :src="dish.image"
              mode="aspectFill"
            />
            <view v-else class="modal-dish-img dish-img-placeholder">
              <icon name="dish" size="24" />
            </view>
            <view class="modal-dish-info">
              <text class="dish-name">{{ dish.name }}</text>
              <view class="modal-dish-meta">
                <text class="modal-dish-category" v-if="dish.category">{{
                  getCategoryName(dish.category)
                }}</text>
                <text class="modal-dish-calorie" v-if="dish.calories"
                  >{{ dish.calories }} kcal</text
                >
              </view>
            </view>
            <view class="modal-dish-add-btn">
              <view
                v-if="addingDishId === dish.id"
                class="adding-spinner"
              ></view>
              <text v-else class="add-text">添加</text>
            </view>
          </view>

          <view v-if="filteredDishes.length === 0" class="modal-empty">
            <icon name="dish" size="64" />
            <text class="empty-text">菜品库空空如也</text>
            <text class="empty-hint">先去「菜品」页面添加一些菜品吧</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 添加成功提示 -->
    <view class="success-toast" v-if="showSuccessToast">
      <view class="success-checkmark">
        <view class="checkmark-circle"></view>
        <view class="checkmark-check"></view>
      </view>
      <text class="success-text">添加成功</text>
    </view>

    <!-- 菜品详情弹窗 -->
    <view class="detail-modal" v-if="showDetailModal" @tap="closeDetailModal">
      <view class="detail-content" @tap.stop>
        <view class="detail-header">
          <text class="detail-title">{{ detailDish?.name }}</text>
          <view class="detail-close" @tap="closeDetailModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="detail-body">
          <image
            v-if="detailDish?.image"
            class="detail-img"
            :src="detailDish.image"
            mode="aspectFill"
          />
          <view class="detail-info">
            <view class="info-row" v-if="detailDish?.category">
              <text class="info-label">分类</text>
              <text class="info-value">{{
                getCategoryName(detailDish.category)
              }}</text>
            </view>
            <view class="info-row" v-if="detailDish?.calories">
              <text class="info-label">热量</text>
              <text class="info-value">{{ detailDish.calories }} kcal</text>
            </view>
            <view class="info-row" v-if="detailDish?.protein">
              <text class="info-label">蛋白质</text>
              <text class="info-value">{{ detailDish.protein }}g</text>
            </view>
            <view class="info-row" v-if="detailDish?.carbs">
              <text class="info-label">碳水</text>
              <text class="info-value">{{ detailDish.carbs }}g</text>
            </view>
            <view class="info-row" v-if="detailDish?.fat">
              <text class="info-label">脂肪</text>
              <text class="info-value">{{ detailDish.fat }}g</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import store from "@/utils/store.js";

export default {
  data() {
    return {
      planId: "",
      plan: {
        startDate: "",
        endDate: "",
        days: {},
      },
      dishes: [],
      categories: [],
      showDishModal: false,
      currentDate: "",
      currentMeal: "",
      searchKeyword: "",
      addingDishId: "",
      showSuccessToast: false,
      showDetailModal: false,
      detailDish: null,
    };
  },
  computed: {
    days() {
      if (!this.plan.startDate || !this.plan.endDate) return [];
      const dates = store.getDateRange(this.plan.startDate, this.plan.endDate);
      return dates.map((date) => ({
        date,
        meals: this.plan.days[date] || { breakfast: [], lunch: [], dinner: [] },
      }));
    },
    filteredDishes() {
      if (!this.searchKeyword) return this.dishes;
      return this.dishes.filter((d) => d.name.includes(this.searchKeyword));
    },
    arrangedCount() {
      let count = 0;
      this.days.forEach((day) => {
        if (day.meals.breakfast.length) count++;
        if (day.meals.lunch.length) count++;
        if (day.meals.dinner.length) count++;
      });
      return count;
    },
    tableWidth() {
      // 日期列100rpx + 三餐列各160rpx = 580rpx
      return 580;
    },
  },
  onLoad(options) {
    this.planId = options.id;
    this.loadPlan();
    this.dishes = store.getDishes();
    this.categories = store.getCategories();
  },
  methods: {
    loadPlan() {
      const plan = store.getPlan(this.planId);
      if (plan) {
        this.plan = plan;
      }
    },
    formatDay(date) {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    },
    getWeekDay(date) {
      const today = store.formatDate(new Date());
      if (date === today) return "今天";
      const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      return weekDays[new Date(date).getDay()];
    },
    isToday(date) {
      return date === store.formatDate(new Date());
    },
    getDishName(id) {
      const dish = this.dishes.find((d) => d.id === id);
      return dish ? dish.name : "未知";
    },
    getCategoryName(id) {
      const cat = this.categories.find((c) => c.id === id);
      return cat ? cat.name : "";
    },
    getMealTypeName(meal) {
      const map = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐" };
      return map[meal] || "";
    },
    getDayCalories(date) {
      const meals = this.plan.days[date];
      if (!meals) return 0;
      const allDishes = [...meals.breakfast, ...meals.lunch, ...meals.dinner];
      return store.calculateDayNutrition(allDishes).calories;
    },
    addDish(date, meal) {
      this.currentDate = date;
      this.currentMeal = meal;
      this.searchKeyword = "";
      this.showDishModal = true;
    },
    closeModal() {
      this.showDishModal = false;
    },
    showDishDetail(dishId) {
      const dish = this.dishes.find((d) => d.id === dishId);
      if (dish) {
        this.detailDish = dish;
        this.showDetailModal = true;
      }
    },
    closeDetailModal() {
      this.showDetailModal = false;
      this.detailDish = null;
    },
    selectDish(dishId) {
      // 显示添加动画
      this.addingDishId = dishId;

      setTimeout(() => {
        if (!this.plan.days[this.currentDate]) {
          this.plan.days[this.currentDate] = {
            breakfast: [],
            lunch: [],
            dinner: [],
          };
        }
        if (
          !this.plan.days[this.currentDate][this.currentMeal].includes(dishId)
        ) {
          this.plan.days[this.currentDate][this.currentMeal].push(dishId);
          store.updatePlan(this.planId, { days: this.plan.days });
        }

        // 显示成功提示
        this.addingDishId = "";
        this.showDishModal = false;
        this.showSuccessToast = true;

        // 1.5秒后隐藏成功提示
        setTimeout(() => {
          this.showSuccessToast = false;
        }, 1500);
      }, 200);
    },
    removeDish(date, meal, dishId) {
      uni.showModal({
        title: "移除菜品",
        content: `确定要移除「${this.getDishName(dishId)}」吗？\n移除后可以重新添加。`,
        confirmColor: "#EF4444",
        confirmText: "移除",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            const index = this.plan.days[date][meal].indexOf(dishId);
            if (index > -1) {
              this.plan.days[date][meal].splice(index, 1);
              store.updatePlan(this.planId, { days: this.plan.days });
            }
          }
        },
      });
    },
  },
};
</script>

<style lang="scss">
@import "@/styles/variables.scss";

/* ==================== 容器 ==================== */
.container {
  min-height: 100vh;
  background: $color-bg-secondary;
  display: flex;
  flex-direction: column;
}

/* ==================== 头部信息 ==================== */
.plan-header {
  background: linear-gradient(
    135deg,
    $color-primary 0%,
    $color-primary-dark 100%
  );
  padding: 32rpx;
  animation: header-enter 0.5s ease-out;
}

@keyframes header-enter {
  0% {
    opacity: 0;
    transform: translateY(-20rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.plan-info {
  display: flex;
  flex-direction: column;
}

.plan-date {
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: $color-bg-primary;
  margin-bottom: 24rpx;
}

.plan-stats {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: $radius-md;
  padding: 20rpx 32rpx;
  align-self: flex-start;
}

.stat-item {
  display: flex;
  align-items: baseline;
}

.stat-value {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-bg-primary;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.85);
  margin-left: 4rpx;
}

.stat-divider {
  width: 1rpx;
  height: 32rpx;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 32rpx;
}

/* ==================== 表格 ==================== */
.table-scroll {
  flex: 1;
  background: $color-bg-secondary;
}

.meal-table {
  display: flex;
  flex-direction: column;
}

/* 表头 */
.table-header {
  display: flex;
  flex-direction: row;
  background: $color-primary-bg;
  position: sticky;
  top: 0;
  z-index: 10;
}

.th {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  border-bottom: 2rpx solid $color-primary-light;
}

.th-date {
  width: 99rpx;
  justify-content: center;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-primary-dark;
  background: $color-primary-bg;
  position: sticky;
  border-right: 2rpx solid $color-primary-light;
  left: 0;
  flex-shrink: 0;
  z-index: 5;
}

.th-meal {
  width: 160rpx;
  justify-content: center;
  flex-shrink: 0;
}

.th-meal .meal-name {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-primary-dark;
}

.meal-indicator {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}

.meal-indicator.breakfast {
  background: $color-breakfast;
}

.meal-indicator.lunch {
  background: $color-lunch;
}

.meal-indicator.dinner {
  background: $color-dinner;
}

/* 表体 */
.table-body {
  background: $color-bg-primary;
  padding-bottom: $spacing-lg;
}

.table-row {
  display: flex;
  flex-direction: row;
  border-bottom: 1rpx solid $color-divider;
  animation: row-enter 0.3s ease-out backwards;
}

@keyframes row-enter {
  0% {
    opacity: 0;
    transform: translateX(-20rpx);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

// 为每行添加递增延迟
.table-row:nth-child(1) {
  animation-delay: 0s;
}
.table-row:nth-child(2) {
  animation-delay: 0.03s;
}
.table-row:nth-child(3) {
  animation-delay: 0.06s;
}
.table-row:nth-child(4) {
  animation-delay: 0.09s;
}
.table-row:nth-child(5) {
  animation-delay: 0.12s;
}
.table-row:nth-child(6) {
  animation-delay: 0.15s;
}
.table-row:nth-child(7) {
  animation-delay: 0.18s;
}

.table-row:nth-child(even) {
  background: #fafafa;
}

/* 日期单元格 */
.td {
  padding: $spacing-md;
}

.td-date {
  width: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: $color-bg-primary;
  border-right: 2rpx solid $color-border;
  position: sticky;
  left: 0;
  flex-shrink: 0;
  z-index: 5;
}

.td-meal {
  width: 160rpx;
  flex-shrink: 0;
  border-right: 1rpx solid $color-divider;
}

.date-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12rpx;
}

.date-num {
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}

.date-week {
  font-size: $font-size-xs;
  color: $color-text-tertiary;
  margin-top: $spacing-xs;
}

.date-week.is-today {
  color: $color-primary;
  font-weight: $font-weight-medium;
  position: relative;
}

.date-week.is-today::after {
  content: "";
  position: absolute;
  bottom: -4rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 2rpx;
  background: $color-primary;
  animation: today-underline 1s ease-out;
}

@keyframes today-underline {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}

.date-calorie {
  display: flex;
  align-items: baseline;
  background: $color-warning-bg;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
}

.calorie-value {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-warning-dark;
  font-variant-numeric: tabular-nums;
}

.calorie-unit {
  font-size: $font-size-xs;
  color: $color-warning-dark;
  margin-left: $spacing-xs;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.dish-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm;
  border-radius: $radius-md;
  position: relative;
}

.dish-item.breakfast {
  background: $color-breakfast-bg;
  border: 1rpx solid $color-breakfast-light;
}

.dish-item.lunch {
  background: $color-lunch-bg;
  border: 1rpx solid $color-lunch-light;
}

.dish-item.dinner {
  background: $color-dinner-bg;
  border: 1rpx solid $color-dinner-light;
}

.dish-name {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 24rpx;
}

.dish-remove {
  position: absolute;
  top: 0;
  right: 0;
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 $radius-md 0 $radius-md;
  background: rgba(0, 0, 0, 0.05);
}

.dish-remove:active {
  background: rgba(0, 0, 0, 0.1);
}

.remove-icon {
  font-size: 20rpx;
  color: $color-text-tertiary;
}

.dish-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-sm;
  border-radius: $radius-md;
  min-height: $touch-target-min;
  background: $color-bg-secondary;
  border: 1rpx dashed $color-border;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.dish-add-btn:active {
  background: $color-primary-bg;
  border-color: $color-primary;
}

.add-icon {
  font-size: $font-size-lg;
  color: $color-text-tertiary;
}

.dish-add-btn:active .add-icon {
  color: $color-primary;
}

/* ==================== 弹窗 ==================== */
.dish-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.modal-content {
  width: 100%;
  max-height: 75vh;
  background: $color-bg-primary;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modal-slide-up 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}

@keyframes modal-slide-up {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid $color-divider;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
}

.modal-indicator {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}

.modal-indicator.breakfast {
  background: $color-breakfast;
}

.modal-indicator.lunch {
  background: $color-lunch;
}

.modal-indicator.dinner {
  background: $color-dinner;
}

.modal-title {
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}

.modal-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-bg-tertiary;
  border-radius: 50%;
  transition: all 0.2s;
}

.modal-close:active {
  background: $color-border;
  transform: scale(0.9) rotate(90deg);
}

.close-icon {
  font-size: $font-size-md;
  color: $color-text-secondary;
}

.modal-search-wrap {
  display: flex;
  align-items: center;
  margin: $spacing-md;
  padding: 0 $spacing-md;
  background: $color-bg-secondary;
  border-radius: $radius-lg;
  height: 80rpx;
}

.search-icon {
  font-size: $font-size-base;
  margin-right: 12rpx;
}

.modal-search {
  flex: 1;
  font-size: $font-size-base;
  color: $color-text-primary;
}

.modal-list {
  flex: 1;
  padding: 0 $spacing-md $spacing-md;
  max-height: 50vh;
}

.modal-dish-item {
  display: flex;
  align-items: center;
  padding: 12rpx;
  background: $color-bg-secondary;
  border-radius: $radius-sm;
  margin-bottom: 8rpx;
  min-height: 60rpx;
  width: 100%;
  box-sizing: border-box;
}

.modal-dish-item:active {
  background: $color-bg-tertiary;
}

.modal-dish-img {
  width: 48rpx;
  height: 48rpx;
  border-radius: 6rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.modal-dish-info {
  flex: 1;
  min-width: 0;
}

.modal-dish-info .dish-name {
  font-size: 24rpx;
  color: $color-text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-dish-meta {
  margin-top: 4rpx;
  display: flex;
  gap: 8rpx;
}

.modal-dish-category,
.modal-dish-calorie {
  font-size: 20rpx;
  color: $color-text-tertiary;
}

.modal-dish-add-btn {
  padding: 6rpx 16rpx;
  background: $color-primary;
  border-radius: 6rpx;
  flex-shrink: 0;
  margin-right: 23rpx;
}

.modal-dish-add-btn .add-text {
  font-size: 22rpx;
  color: $color-bg-primary;
}

.dish-img-placeholder {
  background: $color-bg-tertiary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.empty-icon {
  font-size: $font-size-2xl;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: $font-size-base;
  color: $color-text-secondary;
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: $font-size-sm;
  color: $color-text-tertiary;
}

/* ==================== 添加动画 ==================== */
.modal-dish-item.adding {
  background: $color-primary-bg;
  border-color: $color-primary;
}

.adding-spinner {
  width: 24rpx;
  height: 24rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* ==================== 成功提示 ==================== */
.success-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(34, 197, 94, 0.95);
  padding: $spacing-lg $spacing-xl;
  border-radius: $radius-xl;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: $z-toast;
  animation: toast-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes toast-pop {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

.success-checkmark {
  width: 64rpx;
  height: 64rpx;
  margin-bottom: 16rpx;
  position: relative;
}

.checkmark-circle {
  width: 100%;
  height: 100%;
  border: 4rpx solid $color-bg-primary;
  border-radius: 50%;
}

.checkmark-check {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24rpx;
  height: 12rpx;
  border-left: 4rpx solid $color-bg-primary;
  border-bottom: 4rpx solid $color-bg-primary;
  transform: translate(-50%, -60%) rotate(-45deg);
  animation: check-draw 0.3s ease-out 0.1s forwards;
  opacity: 0;
}

@keyframes check-draw {
  0% {
    opacity: 0;
    width: 0;
  }
  100% {
    opacity: 1;
    width: 24rpx;
  }
}

.success-text {
  color: $color-bg-primary;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
}

/* ==================== 菜品详情弹窗 ==================== */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.detail-content {
  width: 600rpx;
  background: $color-bg-primary;
  border-radius: $radius-lg;
  overflow: hidden;
  animation: detail-pop 0.25s ease-out;
}

@keyframes detail-pop {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  border-bottom: 1rpx solid $color-divider;
}

.detail-title {
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}

.detail-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-bg-secondary;
  border-radius: 50%;
}

.detail-body {
  padding: $spacing-md;
}

.detail-img {
  width: 100%;
  height: 300rpx;
  border-radius: $radius-md;
  margin-bottom: $spacing-md;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid $color-divider;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: $font-size-sm;
  color: $color-text-tertiary;
}

.info-value {
  font-size: $font-size-sm;
  color: $color-text-primary;
  font-weight: $font-weight-medium;
}
</style>
