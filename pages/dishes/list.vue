<template>
  <view class="container">
    <!-- 菜品列表 -->
    <z-paging
      ref="paging"
      class="dish-list"
      :fixed="false"
      :custom-refresher="true"
      :show-empty="false"
      @query="queryList"
    >
      <!-- 头部内容 -->
      <template #top>
        <!-- 搜索栏 -->
        <view class="search-section">
          <view class="search-bar">
            <icon-park name="search" size="28" />
            <input
              class="search-input"
              type="text"
              v-model="keyword"
              placeholder="搜索菜品名称"
              @input="onSearch"
            />
          </view>
        </view>

        <!-- 分类筛选 -->
        <scroll-view
          class="category-scroll"
          scroll-x
          :scroll-left="scrollLeft"
          :scroll-with-animation="true"
          :show-scrollbar="false"
          enable-flex
          :enable-avoid-clip="true"
          :enable-passive="true"
          scroll-anchoring
        >
          <view class="category-list">
            <view
              class="category-item"
              :class="{ active: !currentCategory }"
              @tap="selectCategory('')"
            >
              <text class="category-text">全部</text>
            </view>
            <view
              v-for="cat in categories"
              :key="cat.id"
              class="category-item"
              :class="{ active: currentCategory === cat.id }"
              @tap="selectCategory(cat.id)"
            >
              <icon-park :name="cat.icon" size="24" />
              <text class="category-text">{{ cat.name }}</text>
            </view>
          </view>
        </scroll-view>
      </template>
      <template #empty>
        <!-- 空状态 -->
        <view v-if="dishes.length === 0" class="empty-state">
          <view class="empty-illustration">
            <view class="plate-container">
              <view class="plate"></view>
              <view class="plate-shadow"></view>
              <view class="steam steam-1"></view>
              <view class="steam steam-2"></view>
              <view class="steam steam-3"></view>
            </view>
          </view>
          <text class="empty-title">菜品库空空如也</text>
          <text class="empty-desc">添加你常做的菜品，方便制定每周餐饮计划</text>
          <view class="empty-actions">
            <view class="empty-btn primary" @tap="addDish">
              <text class="btn-icon">+</text>
              <text class="btn-text">添加第一道菜品</text>
            </view>
            <view class="empty-btn secondary" @tap="addSampleDishes">
              <text class="btn-text">试试示例菜品</text>
            </view>
          </view>
          <text class="empty-tip"
            >小贴士：菜品可以设置热量、蛋白质等营养信息</text
          >
        </view>

        <!-- 搜索无结果 -->
        <view
          v-else-if="filteredDishes.length === 0"
          class="empty-state search-empty"
        >
          <view class="search-empty-icon">
            <icon-park name="search" size="48" />
          </view>
          <text class="empty-title">未找到「{{ keyword }}」</text>
          <text class="empty-desc">换个关键词试试，或者添加这道菜品</text>
          <view class="empty-btn primary" @tap="addDishWithName">
            <text class="btn-text">添加「{{ keyword }}」</text>
          </view>
        </view>
      </template>

      <!-- 菜品卡片 -->
      <view
        v-for="dish in filteredDishes"
        :key="dish.id"
        class="dish-card"
        @tap="editDish(dish.id)"
      >
        <!-- 删除按钮 -->
        <view class="delete-btn" @tap.stop="confirmDelete(dish)">
          <icon-park name="delete" size="22" />
        </view>

        <!-- 图片 -->
        <view class="dish-image-wrap">
          <image
            v-if="dish.image"
            class="dish-image"
            :src="dish.image"
            mode="aspectFill"
          />
          <view v-else class="dish-image dish-image-placeholder">
            <icon-park name="dish" size="48" />
          </view>
        </view>

        <!-- 信息 -->
        <view class="dish-content">
          <view class="dish-header">
            <text class="dish-name">{{ dish.name }}</text>
            <view class="dish-category-tag" v-if="dish.categoryId">
              <text class="category-tag-text">{{
                getCategoryName(dish.categoryId)
              }}</text>
            </view>
          </view>

          <!-- 营养信息 -->
          <view class="dish-nutrition" v-if="hasNutrition(dish)">
            <view class="nutrition-item" v-if="dish.calories">
              <view class="nutrition-icon fire"></view>
              <text class="nutrition-value">{{ dish.calories }}</text>
              <text class="nutrition-unit">kcal</text>
            </view>
            <view class="nutrition-item" v-if="dish.protein">
              <text class="nutrition-label">蛋白质</text>
              <text class="nutrition-value">{{ dish.protein }}g</text>
            </view>
            <view class="nutrition-item" v-if="dish.carbs">
              <text class="nutrition-label">碳水</text>
              <text class="nutrition-value">{{ dish.carbs }}g</text>
            </view>
          </view>

          <!-- 餐次标签 -->
          <view
            class="dish-meal-types"
            v-if="dish.mealTypes && dish.mealTypes.length"
          >
            <view
              v-for="typei in dish.mealTypes"
              :key="typei"
              class="meal-tag"
              :class="'meal-' + typei"
            >
              <text class="meal-tag-text">{{ getMealTypeName(typei) }}</text>
            </view>
          </view>
        </view>
      </view>
    </z-paging>

    <!-- 添加按钮 -->
    <view class="fab-button" @tap="addDish">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script>
import api from "@/api/index.js";
import zPaging from "@/uni_modules/z-paging/components/z-paging/z-paging.vue";

export default {
  components: {
    zPaging,
  },
  data() {
    return {
      keyword: "",
      currentCategory: "",
      categories: [],
      dishes: [],
      scrollLeft: 0,
    };
  },
  computed: {
    filteredDishes() {
      let result = this.dishes;
      if (this.currentCategory) {
        result = result.filter((d) => d.categoryId === this.currentCategory);
      }
      if (this.keyword) {
        result = result.filter((d) => d.name.includes(this.keyword));
      }
      return result;
    },
  },
  onShow() {
    this.loadData();
    // 刷新 z-paging 列表
    this.$refs.paging?.reload();
  },
  methods: {
    /**
     * z-paging 数据查询回调
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     */
    queryList(page, pageSize) {
      this.loadData();
    },
    async loadData() {
      try {
        const [categoriesRes, dishesRes] = await Promise.all([
          api.getCategories(),
          api.getDishes(),
        ]);
        this.categories = categoriesRes.data || [];
        this.dishes = dishesRes.data.list || [];
        this.$refs.paging?.complete();
      } catch (error) {
        console.error("加载数据失败:", error);
        uni.showToast({ title: "加载失败，请重试", icon: "none" });
        this.$refs.paging?.complete();
      }
    },
    selectCategory(id) {
      this.currentCategory = id;
    },
    onSearch() {
      // 搜索已通过computed实现
    },
    getCategoryName(id) {
      const cat = this.categories.find((c) => c.id === id);
      return cat ? cat.name : "未分类";
    },
    getMealTypeName(type) {
      const map = {
        breakfast: "早餐",
        lunch: "午餐",
        dinner: "晚餐",
      };
      return map[type] || type;
    },
    hasNutrition(dish) {
      return dish.calories || dish.protein || dish.carbs;
    },
    addDish() {
      uni.navigateTo({
        url: "/pages/dishes/add",
      });
    },
    addDishWithName() {
      uni.navigateTo({
        url: "/pages/dishes/add?name=" + encodeURIComponent(this.keyword),
      });
    },
    async addSampleDishes() {
      // 获取分类列表用于查找categoryId
      const categoryMap = {};
      this.categories.forEach(c => {
        categoryMap[c.code] = c.id;
      });

      const sampleDishes = [
        {
          name: "番茄炒蛋",
          categoryId: categoryMap['vegetable'] || 3,
          calories: 180,
          protein: 8,
          carbs: 12,
          mealTypes: ["breakfast", "lunch"],
        },
        {
          name: "红烧肉",
          categoryId: categoryMap['meat'] || 2,
          calories: 450,
          protein: 25,
          carbs: 8,
          mealTypes: ["lunch", "dinner"],
        },
        {
          name: "清炒时蔬",
          categoryId: categoryMap['vegetable'] || 3,
          calories: 80,
          protein: 3,
          carbs: 6,
          mealTypes: ["lunch", "dinner"],
        },
        {
          name: "米饭",
          categoryId: categoryMap['staple'] || 1,
          calories: 230,
          carbs: 50,
          mealTypes: ["lunch", "dinner"],
        },
        {
          name: "紫菜蛋花汤",
          categoryId: categoryMap['soup'] || 4,
          calories: 60,
          protein: 4,
          mealTypes: ["lunch", "dinner"],
        },
      ];

      try {
        for (const dish of sampleDishes) {
          await api.addDish(dish);
        }
        this.loadData();
        uni.showToast({
          title: "已添加5道示例菜品",
          icon: "success",
        });
      } catch (error) {
        console.error("添加示例菜品失败:", error);
        uni.showToast({ title: "添加失败，请重试", icon: "none" });
      }
    },
    editDish(id) {
      uni.navigateTo({
        url: "/pages/dishes/add?id=" + id,
      });
    },
    async confirmDelete(dish) {
      // 检查菜品是否在计划中使用
      let inPlan = false;
      let planDateRange = "";
      try {
        const checkRes = await api.checkDishInPlans(dish.id);
        inPlan = checkRes.data?.inPlan || false;
        planDateRange = checkRes.data?.planDateRange || "";
      } catch (error) {
        console.error("检查菜品使用情况失败:", error);
      }

      let content = "";
      if (inPlan) {
        content = `「${dish.name}」已在规划 ${planDateRange} 中使用。\n删除后相关计划中的菜品也会移除，确定要删除吗？`;
      } else {
        content = `确定要删除「${dish.name}」吗？\n删除后无法恢复。`;
      }

      uni.showModal({
        title: "删除菜品",
        content: content,
        confirmColor: "#EF4444",
        confirmText: "删除",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.deleteDish(dish.id);
              this.loadData();
              uni.showToast({
                title: "已删除",
                icon: "success",
              });
            } catch (error) {
              console.error("删除菜品失败:", error);
              uni.showToast({ title: "删除失败，请重试", icon: "none" });
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
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $color-bg-secondary;
}

/* ==================== 搜索栏 ==================== */
.search-section {
  padding: 20rpx $spacing-md;
  background: $color-bg-primary;
}

.search-bar {
  display: flex;
  align-items: center;
  background: $color-bg-tertiary;
  border-radius: 16rpx;
  padding: 0 $spacing-md;
  height: 80rpx;
}

.search-icon {
  font-size: $font-size-base;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: $font-size-base;
  color: $color-text-primary;
}

/* ==================== 分类筛选 ==================== */
.category-scroll {
  background: $color-bg-primary;
  white-space: nowrap;
  border-bottom: 1rpx solid $color-bg-tertiary;
}

.category-list {
  display: inline-flex;
  padding: 16rpx $spacing-md;
  gap: 16rpx;
}

.category-item {
  display: inline-flex;
  align-items: center;
  padding: 18rpx $spacing-md;
  background: $color-bg-tertiary;
  border-radius: $radius-md;
  border: 1rpx solid transparent;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.category-item:focus-visible {
  outline: 2rpx solid $color-primary;
  outline-offset: 2rpx;
}

.category-item::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.3s,
    height 0.3s;
}

.category-item:active::after {
  width: 300%;
  height: 300%;
}

.category-item:active {
  transform: scale(0.95);
}

.category-item.active {
  background: $color-primary-bg;
  border-color: $color-primary;
}

.category-item.active::after {
  display: none;
}

.category-text {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.category-item.active .category-text {
  color: $color-primary-dark;
  font-weight: $font-weight-medium;
}

/* ==================== 菜品列表 ==================== */
.dish-list {
  flex: 1;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  animation: empty-fade-in 0.5s ease-out;
}

@keyframes empty-fade-in {
  0% {
    opacity: 0;
    transform: translateY(20rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-illustration {
  margin-bottom: 40rpx;
}

.plate-container {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.plate {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, #f5f5f5 0%, #e8e8e8 100%);
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  border: 8rpx solid #e0e0e0;
  animation: plate-float 3s ease-in-out infinite;
}

@keyframes plate-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
}

.plate-shadow {
  width: 120rpx;
  height: 20rpx;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 50%;
  position: absolute;
  bottom: 0;
  left: 40rpx;
  animation: shadow-pulse 3s ease-in-out infinite;
}

@keyframes shadow-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(0.9);
    opacity: 0.4;
  }
}

.steam {
  position: absolute;
  width: 8rpx;
  height: 30rpx;
  background: linear-gradient(to top, rgba(200, 200, 200, 0.6), transparent);
  border-radius: 4rpx;
  animation: steam-rise 2s ease-out infinite;
}

.steam-1 {
  left: 60rpx;
  top: -20rpx;
  animation-delay: 0s;
}

.steam-2 {
  left: 90rpx;
  top: -30rpx;
  animation-delay: 0.3s;
}

.steam-3 {
  left: 120rpx;
  top: -20rpx;
  animation-delay: 0.6s;
}

@keyframes steam-rise {
  0% {
    opacity: 0;
    transform: translateY(20rpx) scaleY(0.5);
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    transform: translateY(-40rpx) scaleY(1.5);
  }
}

.empty-title {
  font-size: $font-size-lg;
  color: $color-text-primary;
  font-weight: $font-weight-semibold;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: $font-size-sm;
  color: $color-text-tertiary;
  text-align: center;
  margin-bottom: 40rpx;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  width: 100%;
  max-width: 500rpx;
  margin-bottom: 40rpx;
}

.empty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 40rpx;
  border-radius: $radius-lg;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.empty-btn:focus-visible {
  outline: 2rpx solid $color-primary;
  outline-offset: 2rpx;
}

.empty-btn::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.3s,
    height 0.3s;
}

.empty-btn:active::after {
  width: 300%;
  height: 300%;
}

.empty-btn.primary {
  background: linear-gradient(
    135deg,
    $color-primary 0%,
    $color-primary-dark 100%
  );
  box-shadow: $shadow-primary;
}

.empty-btn.primary .btn-text {
  color: $color-bg-primary;
  font-weight: $font-weight-medium;
}

.empty-btn.secondary {
  background: $color-bg-tertiary;
  border: 2rpx solid $color-border;
}

.empty-btn.secondary .btn-text {
  color: $color-text-secondary;
}

.empty-btn:active {
  transform: scale(0.98);
}

.btn-icon {
  font-size: $font-size-xl;
  color: $color-bg-primary;
  margin-right: 12rpx;
  font-weight: 300;
}

.btn-text {
  font-size: $font-size-base;
}

.empty-tip {
  font-size: $font-size-xs;
  color: $color-text-placeholder;
  padding: 16rpx 24rpx;
  background: $color-bg-tertiary;
  border-radius: $radius-md;
}

/* 搜索无结果 */
.search-empty {
  padding: 100rpx 40rpx;
}

.search-empty-icon {
  width: 120rpx;
  height: 120rpx;
  background: $color-bg-tertiary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  opacity: 0.6;
}

/* 菜品卡片 */
.dish-card {
  display: flex;
  background: $color-bg-primary;
  border-radius: $radius-xl;
  padding: $spacing-md;
  margin: 0 $spacing-md $spacing-md;
  position: relative;
  overflow: hidden;

  /* 左侧彩色条纹装饰 */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6rpx;
    background: linear-gradient(
      180deg,
      $color-primary 0%,
      $color-primary-light 100%
    );
    border-radius: $radius-xl 0 0 $radius-xl;
  }

  /* 微妙的底部边框 */
  &::after {
    content: "";
    position: absolute;
    left: 24rpx;
    right: $spacing-md;
    bottom: 0;
    height: 1rpx;
    background: linear-gradient(
      90deg,
      transparent 0%,
      $color-border 50%,
      transparent 100%
    );
  }
}

.dish-card:active {
  background: $color-bg-secondary;
}

/* 图片 */
.dish-image-wrap {
  flex-shrink: 0;
  margin-right: $spacing-md;
  position: relative;
}

.dish-image {
  width: 144rpx;
  height: 144rpx;
  border-radius: $radius-lg;
  object-fit: cover;
}

.dish-image-placeholder {
  background: linear-gradient(
    135deg,
    $color-primary-bg 0%,
    rgba(134, 239, 172, 0.3) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  width: 144rpx;
  height: 144rpx;
  border-radius: $radius-lg;
  border: 2rpx dashed $color-primary-light;
}

/* 内容 */
.dish-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 12rpx;
}

.dish-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  padding-right: 64rpx;
}

.dish-name {
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.dish-category-tag {
  background: $color-bg-tertiary;
  padding: 4rpx 12rpx;
  border-radius: $radius-full;
  margin-left: $spacing-sm;
  flex-shrink: 0;
}

.category-tag-text {
  font-size: 20rpx;
  color: $color-text-tertiary;
  font-weight: $font-weight-medium;
}

/* 营养信息 */
.dish-nutrition {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.nutrition-item {
  display: inline-flex;
  align-items: baseline;
  padding: 6rpx 12rpx;
  border-radius: $radius-sm;
  background: rgba(251, 191, 36, 0.1);
}

.nutrition-icon {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 6rpx;
  flex-shrink: 0;
}

.nutrition-icon.fire {
  background: $color-warning;
  box-shadow: 0 0 8rpx rgba(251, 191, 36, 0.4);
}

.nutrition-label {
  font-size: 20rpx;
  color: $color-text-tertiary;
  margin-right: 4rpx;
}

.nutrition-value {
  font-size: 22rpx;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  font-variant-numeric: tabular-nums;
}

.nutrition-unit {
  font-size: 18rpx;
  color: $color-text-tertiary;
  margin-left: 2rpx;
}

/* 餐次标签 */
.dish-meal-types {
  display: flex;
  gap: 8rpx;
}

.meal-tag {
  padding: 4rpx 12rpx;
  border-radius: $radius-sm;
  border: 1rpx solid transparent;
}

.meal-tag.breakfast {
  background: $color-breakfast-bg;
  border-color: rgba(245, 158, 11, 0.2);
}

.meal-tag.lunch {
  background: $color-lunch-bg;
  border-color: rgba(59, 130, 246, 0.2);
}

.meal-tag.dinner {
  background: $color-dinner-bg;
  border-color: rgba(139, 92, 246, 0.2);
}

.meal-tag-text {
  font-size: 20rpx;
  font-weight: $font-weight-medium;
}

.meal-tag.breakfast .meal-tag-text {
  color: $color-breakfast;
}

.meal-tag.lunch .meal-tag-text {
  color: $color-lunch;
}

.meal-tag.dinner .meal-tag-text {
  color: $color-dinner;
}

/* 删除按钮 */
.delete-btn {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  background: $color-bg-tertiary;
  color: $color-text-tertiary;
  transition:
    background 0.15s,
    color 0.15s,
    transform 0.15s;
  z-index: 10;
}

.delete-btn:active {
  background: rgba(239, 68, 68, 0.12);
  color: $color-error;
  transform: scale(0.92);
}

/* ==================== 添加按钮 ==================== */
.fab-button {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx;
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(
    135deg,
    $color-primary 0%,
    $color-primary-dark 100%
  );
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-primary;
  transition: all 0.2s;
  z-index: $z-fab;
}

.fab-button:focus-visible {
  outline: 2rpx solid $color-primary-dark;
  outline-offset: 4rpx;
}

.fab-button::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 28rpx;
  background: linear-gradient(
    135deg,
    $color-primary 0%,
    $color-primary-dark 100%
  );
  animation: fab-pulse 2s infinite;
}

@keyframes fab-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.15);
    opacity: 0;
  }

  100% {
    transform: scale(1.15);
    opacity: 0;
  }
}

.fab-button:active {
  transform: scale(0.9) rotate(90deg);
  box-shadow: 0 4rpx 16rpx rgba(34, 197, 94, 0.3);
}

.fab-icon {
  font-size: $font-size-2xl;
  color: $color-bg-primary;
  font-weight: 300;
  position: relative;
  z-index: 1;
  transition: transform 0.2s;
}

.fab-button:active .fab-icon {
  transform: rotate(-90deg);
}
</style>
