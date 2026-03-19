<template>
  <view class="container">
    <!-- 冰箱列表 -->
    <z-paging
      ref="paging"
      class="fridge-list"
      :fixed="false"
      :custom-refresher="true"
      :show-empty="false"
      v-model="fridgeItems"
      @query="queryList"
    >
      <!-- 头部内容 -->
      <template #top>
        <!-- 统计卡片 -->
        <view class="stats-card">
          <view class="stat-item">
            <text class="stat-value">{{ totalItems }}</text>
            <text class="stat-label">食材种类</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ totalQuantity }}</text>
            <text class="stat-label">总数量</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value warning" v-if="expiringCount > 0">{{
              expiringCount
            }}</text>
            <text class="stat-value" v-else>0</text>
            <text class="stat-label">即将过期</text>
          </view>
        </view>
      </template>

      <template #empty>
        <!-- 空状态 -->
        <view class="empty-state">
          <view class="empty-illustration">
            <view class="fridge-icon-wrap">
              <icon-park name="refrigerator" size="80" />
            </view>
          </view>
          <text class="empty-title">冰箱空空如也</text>
          <text class="empty-desc">添加食材到冰箱，方便规划饮食</text>
          <view class="empty-btn primary" @tap="openAddModal">
            <text class="btn-text">添加食材</text>
          </view>
        </view>
      </template>

      <!-- 冰箱卡片 -->
      <view
        v-for="(item, index) in sortedFridgeItems"
        :key="item.id"
        class="fridge-card"
        :class="{ 'zero-quantity': item.quantity === 0 }"
        :style="{ animationDelay: index * 0.05 + 's' }"
      >
        <!-- 过期提醒 -->
        <view
          class="expiry-badge warning"
          v-if="isExpiringSoon(item.expiryDate)"
        >
          <text class="expiry-text">即将过期</text>
        </view>
        <view class="expiry-badge expired" v-if="isExpired(item.expiryDate)">
          <text class="expiry-text">已过期</text>
        </view>

        <!-- 图片 -->
        <view class="item-image-wrap">
          <image
            v-if="item.dishImage && !imageErrors.has(item.id)"
            class="item-image"
            :src="item.dishImage"
            mode="aspectFill"
            @error="onImageError(item.id)"
          />
          <view v-else class="item-image item-image-placeholder">
            <icon-park name="dish" size="40" />
          </view>
        </view>

        <!-- 信息 -->
        <view class="item-content">
          <text class="item-name">{{ item.dishName }}</text>

          <!-- 底部信息行：数量控制 + 过期日期 -->
          <view class="item-meta-row">
            <!-- 数量控制 -->
            <view class="quantity-control">
              <view class="quantity-btn minus" @tap="decreaseQuantity(item)">
                <text class="btn-text">−</text>
              </view>
              <text class="quantity-value"
                >{{ item.quantity }}{{ item.unit || "份" }}</text
              >
              <view class="quantity-btn plus" @tap="increaseQuantity(item)">
                <text class="btn-text">+</text>
              </view>
            </view>

            <!-- 过期日期 -->
            <view class="expiry-info" @tap="showExpiryPicker(item)">
              <icon-park name="calendar" size="14" />
              <text
                class="expiry-date"
                :class="{ 'expiring-soon': isExpiringSoon(item.expiryDate) }"
              >
                {{ item.expiryDate ? formatDate(item.expiryDate) : "设置过期" }}
              </text>
            </view>
          </view>
        </view>

        <!-- 删除按钮 -->
        <view class="delete-btn" @tap="confirmRemove(item)">
          <icon-park name="delete" size="16" />
        </view>
      </view>
    </z-paging>

    <!-- 添加按钮 -->
    <view class="fab-button" v-if="!showAddModal" @tap="openAddModal">
      <text class="fab-icon">+</text>
    </view>

    <!-- 去菜品管理按钮 -->
    <view class="fab-button secondary" v-if="!showAddModal" @tap="goToDishes">
      <icon-park name="dish" color="#ffffff" size="24" />
    </view>

    <!-- 添加菜品弹窗 -->
    <view class="dish-modal" v-if="showAddModal">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">选择菜品添加到冰箱</text>
          <view class="modal-close" @tap="closeAddModal">
            <text class="close-icon">×</text>
          </view>
        </view>

        <view class="modal-search-wrap">
          <icon-park name="search" size="28" />
          <input
            class="modal-search"
            v-model="searchKeyword"
            placeholder="搜索菜品"
          />
        </view>

        <!-- 分类筛选 -->
        <scroll-view
          class="modal-category-scroll"
          scroll-x
          :scroll-with-animation="true"
          :show-scrollbar="false"
          enable-flex
        >
          <view class="modal-category-list">
            <view
              class="modal-category-item"
              :class="{ active: !modalCategory }"
              @tap="selectModalCategory('')"
            >
              <text class="category-text">全部</text>
            </view>
            <view
              v-for="cat in categories"
              :key="cat.id"
              class="modal-category-item"
              :class="{ active: String(modalCategory) === String(cat.id) }"
              @tap="selectModalCategory(cat.id)"
            >
              <icon-park v-if="cat.icon" :name="cat.icon" size="20" />
              <text class="category-text">{{ cat.name }}</text>
            </view>
          </view>
        </scroll-view>

        <!-- 无菜品提示 -->
        <view class="no-dish-tip" v-if="dishes.length === 0">
          <icon-park name="dish" size="48" />
          <text class="tip-text">菜品库为空</text>
          <text class="tip-hint">请先添加菜品到菜品库</text>
          <view class="tip-btn" @tap="goToAddDish">
            <text class="tip-btn-text">去添加菜品</text>
          </view>
        </view>

        <scroll-view
          v-else
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
            :class="{
              adding: addingDishId === dish.id,
              'in-fridge': isInFridge(dish.id),
            }"
            @tap="selectDish(dish)"
          >
            <image
              v-if="dish.image"
              class="modal-dish-img"
              :src="dish.image"
              mode="aspectFill"
            />
            <view v-else class="modal-dish-img dish-img-placeholder">
              <icon-park name="dish" size="24" />
            </view>
            <view class="modal-dish-info">
              <text class="dish-name">{{ dish.name }}</text>
              <view class="modal-dish-meta">
                <text class="modal-dish-calorie" v-if="dish.calories">
                  {{ dish.calories }} kcal
                </text>
                <text
                  class="modal-dish-status in-fridge-text"
                  v-if="isInFridge(dish.id)"
                >
                  已在冰箱
                </text>
              </view>
            </view>
            <view class="modal-dish-add-btn" v-if="!isInFridge(dish.id)">
              <view
                v-if="addingDishId === dish.id"
                class="adding-spinner"
              ></view>
              <text v-else class="add-text">添加</text>
            </view>
          </view>

          <view
            v-if="filteredDishes.length === 0 && dishes.length > 0"
            class="modal-empty"
          >
            <icon-park name="search" size="48" />
            <text class="empty-text">未找到匹配的菜品</text>
          </view>
        </scroll-view>

        <!-- 底部关闭按钮 -->
        <view class="modal-footer">
          <view class="modal-close-btn" @tap="closeAddModal">
            <text class="close-btn-text">关闭</text>
          </view>
        </view>
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
      fridgeItems: [],
      dishes: [],
      categories: [],
      showAddModal: false,
      searchKeyword: "",
      modalCategory: "",
      addingDishId: "",
      showSuccessToast: false,
      imageErrors: new Set(),
    };
  },
  computed: {
    totalItems() {
      return this.fridgeItems.length;
    },
    totalQuantity() {
      return this.fridgeItems.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0,
      );
    },
    expiringCount() {
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);
      return this.fridgeItems.filter((item) => {
        if (!item.expiryDate) return false;
        const expiryDate = new Date(item.expiryDate);
        return expiryDate <= threeDaysLater && expiryDate >= new Date();
      }).length;
    },
    filteredDishes() {
      let result = this.dishes;
      if (this.modalCategory) {
        result = result.filter(
          (dish) => String(dish.categoryId) === String(this.modalCategory),
        );
      }
      if (this.searchKeyword) {
        result = result.filter((dish) =>
          dish.name.toLowerCase().includes(this.searchKeyword.toLowerCase()),
        );
      }
      return result;
    },
    // 排序后的冰箱列表，数量为0的排在后面
    sortedFridgeItems() {
      return [...this.fridgeItems].sort((a, b) => {
        const aQty = a.quantity || 0;
        const bQty = b.quantity || 0;
        // 数量为0的排在后面
        if (aQty === 0 && bQty !== 0) return 1;
        if (aQty !== 0 && bQty === 0) return -1;
        return 0;
      });
    },
  },
  onShow() {
    this.loadData();
  },
  methods: {
    queryList() {
      this.loadData();
    },
    async loadData() {
      try {
        this.imageErrors.clear();
        const [fridgeRes, dishesRes, categoriesRes] = await Promise.all([
          api.getFridge(),
          api.getDishes(),
          api.getCategories(),
        ]);
        this.dishes = dishesRes.data.list || [];
        this.categories = categoriesRes.data || [];
        this.$refs.paging?.complete(fridgeRes.data || []);
      } catch (error) {
        console.error("加载数据失败:", error);
        uni.showToast({ title: "加载失败", icon: "none" });
        this.$refs.paging?.complete([]);
      }
    },
    isInFridge(dishId) {
      return this.fridgeItems.some((item) => item.dishId === dishId);
    },
    onImageError(itemId) {
      this.imageErrors.add(itemId);
    },
    async openAddModal() {
      this.searchKeyword = "";
      this.modalCategory = "";
      // 重新加载菜品和分类数据
      try {
        const [dishesRes, categoriesRes] = await Promise.all([
          api.getDishes(),
          api.getCategories(),
        ]);
        this.dishes = dishesRes.data.list || [];
        this.categories = categoriesRes.data || [];
      } catch (error) {
        console.error("加载数据失败:", error);
      }
      this.showAddModal = true;
    },
    closeAddModal() {
      this.showAddModal = false;
      this.addingDishId = "";
      this.modalCategory = "";
    },
    selectModalCategory(id) {
      this.modalCategory = id || "";
    },
    goToAddDish() {
      this.showAddModal = false;
      uni.navigateTo({
        url: "/pages/dishes/add",
      });
    },
    goToDishes() {
      uni.navigateTo({
        url: "/pages/dishes/list",
      });
    },
    async selectDish(dish) {
      // 检查是否已在冰箱中
      if (this.isInFridge(dish.id)) {
        uni.showToast({ title: "该菜品已在冰箱中", icon: "none" });
        return;
      }

      // 显示添加动画
      this.addingDishId = dish.id;

      setTimeout(async () => {
        try {
          await api.addToFridge({
            dishId: dish.id,
            quantity: 1,
            unit: "份",
            expiryDate: null,
          });

          // 重新加载冰箱数据
          const fridgeRes = await api.getFridge();
          this.fridgeItems = fridgeRes.data || [];

          // 显示成功提示
          this.addingDishId = "";
          this.showAddModal = false;
          this.showSuccessToast = true;

          setTimeout(() => {
            this.showSuccessToast = false;
          }, 1500);
        } catch (error) {
          console.error("添加失败:", error);
          uni.showToast({ title: "添加失败", icon: "none" });
          this.addingDishId = "";
        }
      }, 200);
    },
    async increaseQuantity(item) {
      try {
        await api.updateFridgeItem(item.id, {
          quantity: item.quantity + 1,
        });
        item.quantity += 1;
      } catch (error) {
        console.error("更新数量失败:", error);
        uni.showToast({ title: "操作失败", icon: "none" });
      }
    },
    async decreaseQuantity(item) {
      if (item.quantity <= 0) {
        return;
      }
      try {
        await api.updateFridgeItem(item.id, {
          quantity: item.quantity - 1,
        });
        item.quantity -= 1;
      } catch (error) {
        console.error("更新数量失败:", error);
        uni.showToast({ title: "操作失败", icon: "none" });
      }
    },
    confirmRemove(item) {
      uni.showModal({
        title: "移除食材",
        content: `确定要将「${item.dishName}」从冰箱移除吗？`,
        confirmColor: "#EF4444",
        confirmText: "移除",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.removeFromFridge(item.id);
              this.fridgeItems = this.fridgeItems.filter(
                (i) => i.id !== item.id,
              );
              uni.showToast({ title: "已移除", icon: "success" });
            } catch (error) {
              console.error("移除失败:", error);
              uni.showToast({ title: "操作失败", icon: "none" });
            }
          }
        },
      });
    },
    formatDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日`;
    },
    isExpiringSoon(dateStr) {
      if (!dateStr) return false;
      const expiryDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);
      return expiryDate <= threeDaysLater && expiryDate >= today;
    },
    isExpired(dateStr) {
      if (!dateStr) return false;
      const expiryDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return expiryDate < today;
    },
    showExpiryPicker(item) {
      uni.showActionSheet({
        itemList: ["设置过期时间", "清除过期时间"],
        success: async (res) => {
          if (res.tapIndex === 0) {
            // 设置过期时间
            uni.showModal({
              title: "设置过期时间",
              editable: true,
              placeholderText: "请输入天数（如：3表示3天后过期）",
              success: async (modalRes) => {
                if (modalRes.confirm && modalRes.content) {
                  const days = parseInt(modalRes.content);
                  if (isNaN(days) || days <= 0) {
                    uni.showToast({ title: "请输入有效天数", icon: "none" });
                    return;
                  }
                  const expiryDate = new Date();
                  expiryDate.setDate(expiryDate.getDate() + days);
                  const dateStr = expiryDate.toISOString().split("T")[0];
                  try {
                    await api.updateFridgeItem(item.id, {
                      expiryDate: dateStr,
                    });
                    item.expiryDate = dateStr;
                    uni.showToast({ title: "设置成功", icon: "success" });
                  } catch (error) {
                    console.error("设置过期时间失败:", error);
                    uni.showToast({ title: "设置失败", icon: "none" });
                  }
                }
              },
            });
          } else if (res.tapIndex === 1) {
            // 清除过期时间
            try {
              await api.updateFridgeItem(item.id, { expiryDate: null });
              item.expiryDate = null;
              uni.showToast({ title: "已清除", icon: "success" });
            } catch (error) {
              console.error("清除过期时间失败:", error);
              uni.showToast({ title: "操作失败", icon: "none" });
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

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $color-bg-secondary;
}

/* ==================== 统计卡片 ==================== */
.stats-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: $color-bg-primary;
  margin: $spacing-sm $spacing-md;
  padding: $spacing-md $spacing-sm;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-primary;
}

.stat-value.warning {
  color: $color-warning;
}

.stat-label {
  font-size: $font-size-xs;
  color: $color-text-tertiary;
  margin-top: 4rpx;
}

.stat-divider {
  width: 1rpx;
  height: 40rpx;
  background: $color-border;
}

/* ==================== 冰箱列表 ==================== */
.fridge-list {
  flex: 1;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
}

.empty-illustration {
  margin-bottom: $spacing-lg;
}

.fridge-icon-wrap {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
}

.empty-title {
  font-size: $font-size-lg;
  color: $color-text-primary;
  font-weight: $font-weight-semibold;
  margin-bottom: $spacing-sm;
}

.empty-desc {
  font-size: $font-size-sm;
  color: $color-text-tertiary;
  text-align: center;
  margin-bottom: $spacing-xl;
}

.empty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md $spacing-xl;
  border-radius: $radius-lg;
  transition: all 0.2s;
}

.empty-btn.primary {
  background: linear-gradient(135deg, $color-info 0%, #2563eb 100%);
  box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.3);
}

.empty-btn.primary .btn-text {
  color: $color-bg-primary;
  font-weight: $font-weight-medium;
}

.empty-btn:active {
  transform: scale(0.98);
}

/* 冰箱卡片 */
.fridge-card {
  display: flex;
  align-items: stretch;
  background: $color-bg-primary;
  border-radius: $radius-lg;
  margin: 0 $spacing-md $spacing-sm;
  position: relative;
  overflow: hidden;
  animation: card-enter 0.5s cubic-bezier(0.25, 1, 0.5, 1) backwards;

  /* 卡片右侧微妙的渐变装饰 */
  &::after {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 180rpx;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(34, 197, 94, 0.03) 50%,
      rgba(34, 197, 94, 0.06) 100%
    );
    pointer-events: none;
  }

  /* 底部装饰线 */
  &::before {
    content: "";
    position: absolute;
    left: $spacing-md;
    right: $spacing-md;
    bottom: 0;
    height: 1rpx;
    background: linear-gradient(
      90deg,
      transparent 0%,
      $color-border 20%,
      $color-border 80%,
      transparent 100%
    );
  }

  /* 悬浮阴影 - 更有层次 */
  box-shadow:
    0 2rpx 8rpx rgba(0, 0, 0, 0.03),
    0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  transition:
    transform 0.3s cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 0.3s ease;
}

.fridge-card:active {
  transform: scale(0.98);
  box-shadow:
    0 1rpx 4rpx rgba(0, 0, 0, 0.04),
    0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

@keyframes card-enter {
  0% {
    opacity: 0;
    transform: translateY(24rpx) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 数量为0的卡片样式 */
.fridge-card.zero-quantity {
  opacity: 0.5;

  .item-name {
    color: $color-text-tertiary;
  }

  .quantity-value {
    color: $color-text-tertiary;
  }
}

/* 过期徽章 */
.expiry-badge {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  padding: 6rpx 12rpx;
  border-radius: $radius-full;
  z-index: 10;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  letter-spacing: 0.02em;
  backdrop-filter: blur(8rpx);
}

.expiry-badge.warning {
  background: rgba(251, 191, 36, 0.15);
  border: 1rpx solid rgba(251, 191, 36, 0.3);
}

.expiry-badge.warning .expiry-text {
  color: $color-warning-dark;
}

.expiry-badge.expired {
  background: rgba(239, 68, 68, 0.12);
  border: 1rpx solid rgba(239, 68, 68, 0.25);
}

.expiry-badge.expired .expiry-text {
  color: $color-error;
}

/* 图片 */
.item-image-wrap {
  flex-shrink: 0;
  padding: $spacing-sm;
  display: flex;
  align-items: center;
}

.item-image {
  width: 88rpx;
  height: 88rpx;
  border-radius: $radius-md;
  object-fit: cover;
}

.item-image-placeholder {
  background: linear-gradient(
    145deg,
    $color-primary-bg 0%,
    rgba(134, 239, 172, 0.25) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-primary;
  border: 2rpx dashed rgba(34, 197, 94, 0.25);
}

/* 内容 */
.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: $spacing-sm;
  padding-right: 56rpx;
}

.item-name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  letter-spacing: 0.01em;
  margin-bottom: 8rpx;
}

/* 底部信息行 */
.item-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-sm;
}

/* 数量控制 */
.quantity-control {
  display: flex;
  align-items: center;
  background: $color-bg-secondary;
  border-radius: $radius-full;
  padding: 4rpx;
}

.quantity-btn {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.quantity-btn.minus {
  background: transparent;
  color: $color-text-secondary;
}

.quantity-btn.minus:active {
  background: rgba(239, 68, 68, 0.1);
  color: $color-error;
}

.quantity-btn.plus {
  background: $color-primary;
  color: white;
}

.quantity-btn.plus:active {
  transform: scale(0.9);
}

.quantity-btn .btn-text {
  font-size: 28rpx;
  font-weight: 300;
  line-height: 1;
}

.quantity-value {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  margin: 0 8rpx;
  min-width: 56rpx;
  text-align: center;
}

/* 过期日期 */
.expiry-info {
  display: inline-flex;
  align-items: center;
  gap: 4rpx;
  color: $color-text-tertiary;
  padding: 6rpx 10rpx;
  background: rgba(0, 0, 0, 0.02);
  border-radius: $radius-sm;
  transition: all 0.2s;
}

.expiry-info:active {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(0.98);
}

.expiry-date {
  font-size: $font-size-xs;
  letter-spacing: 0.02em;
}

.expiry-date.expiring-soon {
  color: $color-warning-dark;
  font-weight: $font-weight-medium;
}

/* 删除按钮 */
.delete-btn {
  position: absolute;
  top: 50%;
  right: $spacing-sm;
  transform: translateY(-50%);
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  color: $color-text-tertiary;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  z-index: 5;
}

.delete-btn:active {
  background: rgba(239, 68, 68, 0.1);
  color: $color-error;
}

/* ==================== 添加按钮 ==================== */
.fab-button {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx;
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, $color-info 0%, #2563eb 100%);
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(59, 130, 246, 0.35);
  transition: all 0.2s;
  z-index: $z-fab;
}

.fab-button.secondary {
  bottom: 268rpx;
  background: linear-gradient(
    135deg,
    $color-primary 0%,
    $color-primary-dark 100%
  );
  box-shadow: 0 4rpx 20rpx rgba(34, 197, 94, 0.35);
}

.fab-button:active {
  transform: scale(0.9);
}

.fab-icon {
  font-size: $font-size-2xl;
  color: $color-bg-primary;
  font-weight: 300;
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

.modal-search {
  flex: 1;
  font-size: $font-size-base;
  color: $color-text-primary;
  margin-left: 12rpx;
}

/* 弹窗分类筛选 */
.modal-category-scroll {
  white-space: nowrap;
  margin: 0 $spacing-md;
  margin-bottom: $spacing-sm;
}

.modal-category-list {
  display: inline-flex;
  gap: 12rpx;
}

.modal-category-item {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 20rpx;
  background: $color-bg-secondary;
  border-radius: $radius-full;
  transition: all 0.2s;
}

.modal-category-item.active {
  background: $color-primary-bg;
  color: $color-primary-dark;
}

.modal-category-item .category-text {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.modal-category-item.active .category-text {
  color: $color-primary-dark;
  font-weight: $font-weight-medium;
}

.modal-list {
  flex: 1;
  padding: 0 $spacing-md;
  max-height: 45vh;
}

/* 底部关闭按钮 */
.modal-footer {
  padding: $spacing-md;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
  border-top: 1rpx solid $color-divider;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background: $color-bg-tertiary;
  border-radius: $radius-lg;
  transition: all 0.2s;
}

.modal-close-btn:active {
  background: $color-border;
  transform: scale(0.98);
}

.modal-close-btn .close-btn-text {
  font-size: $font-size-base;
  color: $color-text-secondary;
  font-weight: $font-weight-medium;
}

.modal-dish-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: $color-bg-secondary;
  border-radius: $radius-lg;
  margin-bottom: 12rpx;
  transition: all 0.2s;
}

.modal-dish-item:active {
  background: $color-bg-tertiary;
}

.modal-dish-item.in-fridge {
  opacity: 0.6;
}

.modal-dish-item.adding {
  background: $color-primary-bg;
  border: 1rpx solid $color-primary;
}

.modal-dish-img {
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-md;
  margin-right: 16rpx;
  flex-shrink: 0;
  object-fit: cover;
}

.dish-img-placeholder {
  background: linear-gradient(
    135deg,
    $color-primary-bg 0%,
    rgba(134, 239, 172, 0.3) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-primary;
}

.modal-dish-info {
  flex: 1;
  min-width: 0;
}

.modal-dish-info .dish-name {
  font-size: $font-size-base;
  color: $color-text-primary;
  font-weight: $font-weight-medium;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-dish-meta {
  margin-top: 6rpx;
  display: flex;
  gap: 12rpx;
  align-items: center;
}

.modal-dish-calorie {
  font-size: $font-size-sm;
  color: $color-text-tertiary;
}

.modal-dish-status {
  font-size: $font-size-sm;
  padding: 2rpx 12rpx;
  border-radius: $radius-full;
}

.in-fridge-text {
  color: $color-primary;
  background: $color-primary-bg;
}

.modal-dish-add-btn {
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, $color-info 0%, #2563eb 100%);
  border-radius: $radius-full;
  flex-shrink: 0;
}

.modal-dish-add-btn .add-text {
  font-size: $font-size-sm;
  color: $color-bg-primary;
  font-weight: $font-weight-medium;
}

/* 无菜品提示 */
.no-dish-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 32rpx;
  color: $color-text-tertiary;
}

.tip-text {
  font-size: $font-size-base;
  color: $color-text-secondary;
  margin-top: $spacing-md;
}

.tip-hint {
  font-size: $font-size-sm;
  color: $color-text-tertiary;
  margin-top: $spacing-xs;
  margin-bottom: $spacing-lg;
}

.tip-btn {
  padding: $spacing-sm $spacing-xl;
  background: linear-gradient(
    135deg,
    $color-primary 0%,
    $color-primary-dark 100%
  );
  border-radius: $radius-full;
}

.tip-btn-text {
  font-size: $font-size-sm;
  color: $color-bg-primary;
}

.modal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  color: $color-text-tertiary;
}

.empty-text {
  font-size: $font-size-base;
  margin-top: $spacing-md;
}

/* 添加动画 */
.adding-spinner {
  width: 28rpx;
  height: 28rpx;
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
</style>
