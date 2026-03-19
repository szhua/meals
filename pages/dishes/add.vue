<template>
  <view class="container">
    <scroll-view
      scroll-y
      class="form-scroll"
      :scroll-with-animation="true"
      :enable-flex="true"
      :enable-avoid-clip="true"
      :enable-passive="true"
      scroll-anchoring
    >
      <!-- 菜品图片 -->
      <view class="form-section">
        <view class="image-upload" @tap="chooseImage">
          <image
            v-if="form.image"
            class="preview-image"
            :src="form.image"
            mode="aspectFill"
          />
          <view v-else class="upload-placeholder">
            <icon-park name="camera" size="48" />
            <text class="upload-text">添加图片（可选）</text>
          </view>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="form-section">
        <view class="section-title">基本信息</view>
        <view class="form-item">
          <text class="label required">菜品名称</text>
          <input
            class="input"
            v-model="form.name"
            placeholder="请输入菜品名称"
          />
        </view>
        <view class="form-item">
          <text class="label">菜品分类</text>
          <picker
            :value="categoryIndex"
            :range="categories"
            range-key="name"
            @change="onCategoryChange"
          >
            <view class="picker">
              <text>{{ categories[categoryIndex]?.name || "请选择分类" }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
      </view>

      <!-- 适合餐次 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-title">适合餐次</text>
          <text class="section-hint">选择适合的餐次，方便后续筛选</text>
        </view>
        <view class="meal-types">
          <view
            class="meal-type-item"
            :class="{ active: form.mealTypes.includes('breakfast') }"
            @tap="toggleMealType('breakfast')"
          >
            <view class="meal-icon-wrap breakfast">
              <icon-park name="breakfast" size="36" />
            </view>
            <text class="meal-name">早餐</text>
          </view>
          <view
            class="meal-type-item"
            :class="{ active: form.mealTypes.includes('lunch') }"
            @tap="toggleMealType('lunch')"
          >
            <view class="meal-icon-wrap lunch">
              <icon-park name="lunch" size="36" />
            </view>
            <text class="meal-name">午餐</text>
          </view>
          <view
            class="meal-type-item"
            :class="{ active: form.mealTypes.includes('dinner') }"
            @tap="toggleMealType('dinner')"
          >
            <view class="meal-icon-wrap dinner">
              <icon-park name="dinner" size="36" />
            </view>
            <text class="meal-name">晚餐</text>
          </view>
        </view>
      </view>

      <!-- 营养信息 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-title">营养信息</text>
          <text class="section-hint">记录营养数据，更好地规划饮食</text>
        </view>
        <view class="form-item">
          <text class="label">热量</text>
          <view class="input-with-unit">
            <input
              class="input"
              type="digit"
              v-model="form.calories"
              placeholder="例如 200"
            />
            <text class="input-unit">kcal</text>
          </view>
        </view>
        <view class="form-item">
          <text class="label">蛋白质</text>
          <view class="input-with-unit">
            <input
              class="input"
              type="digit"
              v-model="form.protein"
              placeholder="例如 15"
            />
            <text class="input-unit">g</text>
          </view>
        </view>
        <view class="form-item">
          <text class="label">碳水化合物</text>
          <view class="input-with-unit">
            <input
              class="input"
              type="digit"
              v-model="form.carbs"
              placeholder="例如 30"
            />
            <text class="input-unit">g</text>
          </view>
        </view>
        <view class="form-item">
          <text class="label">脂肪</text>
          <view class="input-with-unit">
            <input
              class="input"
              type="digit"
              v-model="form.fat"
              placeholder="例如 10"
            />
            <text class="input-unit">g</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 提交按钮 -->
    <view class="submit-bar">
      <button class="submit-btn" @tap="submit">保存菜品</button>
    </view>
  </view>
</template>

<script>
import api from "@/api/index.js";

// 根据菜品名称匹配默认图片
function getDefaultImage(dishName) {
  const name = dishName.toLowerCase();
  const imageMap = [
    { keywords: ['米饭', '饭', '炒饭', '盖饭', '拌饭', '粥'], image: '/static/foods/rice.png' },
    { keywords: ['面条', '面', '粉', '意面', '拉面', '拌面'], image: '/static/foods/noodles.png' },
    { keywords: ['蔬菜', '青菜', '白菜', '菠菜', '生菜', '西兰花', '菜'], image: '/static/foods/vegetables.png' },
    { keywords: ['水果', '苹果', '香蕉', '橙子', '草莓', '葡萄'], image: '/static/foods/fruits.png' },
    { keywords: ['甜点', '蛋糕', '布丁', '冰淇淋', '点心', '甜品'], image: '/static/foods/dessert.png' },
    { keywords: ['汤', '羹', '煲汤'], image: '/static/foods/soup.png' },
    { keywords: ['肉', '鸡肉', '牛肉', '猪肉', '羊肉', '排骨', '鸡腿', '牛排'], image: '/static/foods/meat.png' },
    { keywords: ['海鲜', '鱼', '虾', '蟹', '贝', '龙虾', '三文鱼'], image: '/static/foods/seafood.png' },
    { keywords: ['早餐', '包子', '馒头', '煎饼', '豆浆', '油条'], image: '/static/foods/breakfast.png' },
    { keywords: ['沙拉', '沙拉', '轻食'], image: '/static/foods/salad.png' },
  ];

  for (const item of imageMap) {
    if (item.keywords.some(keyword => name.includes(keyword))) {
      return item.image;
    }
  }
  // 默认返回菜品图标
  return '/static/foods/vegetables.png';
}

export default {
  data() {
    return {
      isEdit: false,
      dishId: null,
      categories: [],
      categoryIndex: 0,
      form: {
        name: "",
        image: "",
        categoryId: null,
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        mealTypes: [],
      },
    };
  },
  async onLoad(options) {
    await this.loadCategories();
    if (options.id) {
      this.isEdit = true;
      this.dishId = options.id;
      await this.loadDish();
    } else {
      // 新增菜品时设置默认值
      this.setDefaultsForNewDish();
    }
  },
  methods: {
    async loadCategories() {
      try {
        const res = await api.getCategories();
        this.categories = [{ id: null, name: "未分类" }, ...(res.data || [])];
      } catch (error) {
        console.error("加载分类失败:", error);
        this.categories = [{ id: null, name: "未分类" }];
      }
    },
    setDefaultsForNewDish() {
      // 默认选择"主食"分类
      const stapleIndex = this.categories.findIndex(c => c.name === "主食");
      if (stapleIndex !== -1) {
        this.categoryIndex = stapleIndex;
        this.form.categoryId = this.categories[stapleIndex].id;
      }
      // 默认适合餐次：午餐、晚餐
      this.form.mealTypes = ["lunch", "dinner"];
      // 默认营养信息
      this.form.calories = "200";
      this.form.protein = "5";
      this.form.carbs = "30";
      this.form.fat = "5";
    },
    async loadDish() {
      try {
        const res = await api.getDish(this.dishId);
        const dish = res.data;
        if (dish) {
          this.form = {
            name: dish.name || "",
            image: dish.image || "",
            categoryId: dish.categoryId || null,
            calories: dish.calories || "",
            protein: dish.protein || "",
            carbs: dish.carbs || "",
            fat: dish.fat || "",
            mealTypes: dish.mealTypes || [],
          };
          if (dish.categoryId) {
            this.categoryIndex = this.categories.findIndex(
              (c) => c.id === dish.categoryId,
            );
          }
          uni.setNavigationBarTitle({ title: "编辑菜品" });
        }
      } catch (error) {
        console.error("加载菜品失败:", error);
        uni.showToast({ title: "加载失败", icon: "none" });
      }
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          uni.showLoading({ title: "上传中..." });
          try {
            const uploadRes = await api.uploadImage(tempFilePath);
            if (uploadRes.data && uploadRes.data.url) {
              this.form.image = uploadRes.data.url;
            }
            uni.hideLoading();
          } catch (error) {
            uni.hideLoading();
            console.error("上传图片失败:", error);
            uni.showToast({ title: "上传失败", icon: "none" });
          }
        },
      });
    },
    onCategoryChange(e) {
      this.categoryIndex = e.detail.value;
      this.form.categoryId = this.categories[this.categoryIndex].id;
    },
    toggleMealType(type) {
      const index = this.form.mealTypes.indexOf(type);
      if (index > -1) {
        this.form.mealTypes.splice(index, 1);
      } else {
        this.form.mealTypes.push(type);
      }
    },
    async submit() {
      if (!this.form.name.trim()) {
        return uni.showToast({ title: "请输入菜品名称", icon: "none" });
      }

      // 如果没有上传图片，根据菜品名称自动匹配默认图片
      const dishImage = this.form.image || getDefaultImage(this.form.name);

      const data = {
        name: this.form.name.trim(),
        image: dishImage,
        categoryId: this.form.categoryId,
        calories: this.form.calories ? parseInt(this.form.calories) : 0,
        protein: this.form.protein ? parseInt(this.form.protein) : 0,
        carbs: this.form.carbs ? parseInt(this.form.carbs) : 0,
        fat: this.form.fat ? parseInt(this.form.fat) : 0,
        mealTypes: this.form.mealTypes,
      };

      try {
        if (this.isEdit) {
          await api.updateDish(this.dishId, data);
          uni.showToast({ title: "修改成功", icon: "success" });
        } else {
          // 检查菜品名称是否重复
          const dishesRes = await api.getDishes();
          const isDuplicate = dishesRes.data.list.some(
            d => d.name.trim() === this.form.name.trim()
          );
          if (isDuplicate) {
            return uni.showToast({ title: "该菜品名称已存在", icon: "none" });
          }
          await api.addDish(data);
          uni.showToast({ title: "添加成功", icon: "success" });
        }

        setTimeout(() => {
          uni.navigateBack();
        }, 500);
      } catch (error) {
        console.error("保存菜品失败:", error);
        uni.showToast({ title: "保存失败，请重试", icon: "none" });
      }
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

.form-scroll {
  box-sizing: border-box;
  flex: 1;
  padding: $spacing-md;
  padding-bottom: calc($spacing-2xl + 88rpx);
}

.form-section {
  background: $color-bg-primary;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-size-md;
  font-weight: $font-weight-medium;
  color: $color-text-primary;
  margin-bottom: $spacing-md;
}

.section-header {
  display: flex;
  flex-direction: column;
  margin-bottom: $spacing-md;
}

.section-header .section-title {
  margin-bottom: $spacing-xs;
}

.section-hint {
  font-size: $font-size-sm;
  color: $color-text-tertiary;
}

.image-upload {
  width: 100%;
  height: 300rpx;
  border-radius: $radius-md;
  overflow: hidden;
  background: $color-bg-tertiary;
  transition: transform 0.2s;
}

.image-upload:active {
  transform: scale(0.98);
}

.preview-image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: $color-text-tertiary;
  gap: $spacing-sm;
}

.upload-text {
  font-size: $font-size-base;
}

.form-item {
  margin-bottom: $spacing-md;
}

.form-item:last-child {
  margin-bottom: 0;
}

.label {
  display: block;
  font-size: $font-size-base;
  color: $color-text-secondary;
  margin-bottom: $spacing-xs;
}

.label.required::before {
  content: "*";
  color: $color-error;
  margin-right: $spacing-xs;
}

.input {
  width: 100%;
  height: 80rpx;
  padding: 0 $spacing-md;
  background: $color-bg-tertiary;
  border-radius: $radius-sm;
  font-size: $font-size-base;
  box-sizing: border-box;
  transition: background 0.2s;
}

.input:focus {
  background: $color-bg-secondary;
}

.input-with-unit {
  display: flex;
  align-items: center;
  background: $color-bg-tertiary;
  border-radius: $radius-sm;
  height: 80rpx;
  padding-right: $spacing-md;
  transition: background 0.2s;
}

.input-with-unit:focus-within {
  background: $color-bg-secondary;
}

.input-with-unit .input {
  flex: 1;
  background: transparent;
  padding: 0 $spacing-md;
}

.input-unit {
  font-size: $font-size-sm;
  color: $color-text-tertiary;
  flex-shrink: 0;
}

.picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  padding: 0 $spacing-md;
  background: $color-bg-tertiary;
  border-radius: $radius-sm;
  font-size: $font-size-base;
  transition: background 0.2s;
}

.picker:active {
  background: $color-bg-secondary;
}

.picker-arrow {
  font-size: $font-size-sm;
  color: $color-text-tertiary;
}

.meal-types {
  display: flex;
  justify-content: space-around;
  gap: $spacing-sm;
}

.meal-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  background: $color-bg-tertiary;
  border-radius: $radius-lg;
  border: 2rpx solid transparent;
  transition:
    transform 0.2s,
    background 0.2s,
    border-color 0.2s;
  position: relative;
  overflow: hidden;
  min-height: $touch-target-min;
}

.meal-type-item::after {
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

.meal-type-item:active::after {
  width: 300%;
  height: 300%;
}

.meal-type-item:active {
  transform: scale(0.95);
}

.meal-type-item.active {
  background: $color-primary-bg;
  border-color: $color-primary;
}

.meal-type-item.active::after {
  display: none;
}

.meal-icon {
  font-size: $font-size-lg;
}

.meal-name {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.meal-type-item.active .meal-name {
  color: $color-primary;
  font-weight: $font-weight-medium;
}

.meal-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-sm;
}

.meal-icon-wrap.breakfast {
  background: $color-breakfast-bg;
}

.meal-icon-wrap.lunch {
  background: $color-lunch-bg;
}

.meal-icon-wrap.dinner {
  background: $color-dinner-bg;
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-md;
  background: $color-bg-primary;
  border-top: 1rpx solid $color-divider;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
  z-index: 100;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(
    135deg,
    $color-primary 0%,
    $color-primary-dark 100%
  );
  color: $color-bg-primary;
  font-size: $font-size-md;
  border-radius: $radius-full;
  border: none;
  position: relative;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.submit-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: btn-shine 3s infinite;
}

@keyframes btn-shine {
  0% {
    left: -100%;
  }
  50%,
  100% {
    left: 100%;
  }
}

.submit-btn:active {
  transform: scale(0.98);
  box-shadow: $shadow-primary;
}
</style>
