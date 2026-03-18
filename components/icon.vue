<template>
  <view class="icon" :style="{ width: size + 'rpx', height: size + 'rpx', color: iconColor }">
    <!-- 早餐图标 - 太阳 -->
    <view v-if="name === 'breakfast'" class="icon-breakfast">
      <view class="sun">
        <view class="sun-core"></view>
        <view class="sun-ray ray-1"></view>
        <view class="sun-ray ray-2"></view>
        <view class="sun-ray ray-3"></view>
        <view class="sun-ray ray-4"></view>
      </view>
    </view>

    <!-- 午餐图标 - 太阳高照 -->
    <view v-else-if="name === 'lunch'" class="icon-lunch">
      <view class="sun-full">
        <view class="sun-full-core"></view>
      </view>
    </view>

    <!-- 晚餐图标 - 月亮 -->
    <view v-else-if="name === 'dinner'" class="icon-dinner">
      <view class="moon"></view>
    </view>

    <!-- 热量图标 - 火焰 -->
    <view v-else-if="name === 'fire'" class="icon-fire">
      <view class="flame flame-1"></view>
      <view class="flame flame-2"></view>
    </view>

    <!-- 添加图标 -->
    <view v-else-if="name === 'add'" class="icon-add">
      <view class="h-line"></view>
      <view class="v-line"></view>
    </view>

    <!-- 关闭图标 -->
    <view v-else-if="name === 'close'" class="icon-close">
      <view class="line line-1"></view>
      <view class="line line-2"></view>
    </view>

    <!-- 菜品图标 -->
    <view v-else-if="name === 'dish'" class="icon-dish">
      <view class="plate"></view>
      <view class="plate-inner"></view>
    </view>

    <!-- 日历图标 -->
    <view v-else-if="name === 'calendar'" class="icon-calendar">
      <view class="cal-top"></view>
      <view class="cal-body"></view>
      <view class="cal-dots">
        <view class="cal-dot"></view>
        <view class="cal-dot"></view>
        <view class="cal-dot"></view>
      </view>
    </view>

    <!-- 搜索图标 -->
    <view v-else-if="name === 'search'" class="icon-search">
      <view class="search-circle"></view>
      <view class="search-handle"></view>
    </view>

    <!-- 相机图标 -->
    <view v-else-if="name === 'camera'" class="icon-camera">
      <view class="camera-body"></view>
      <view class="camera-lens"></view>
      <view class="camera-flash"></view>
    </view>

    <!-- 主食图标 - 米饭碗 -->
    <view v-else-if="name === 'rice'" class="icon-rice">
      <view class="rice-bowl"></view>
      <view class="rice-grain g1"></view>
      <view class="rice-grain g2"></view>
      <view class="rice-grain g3"></view>
    </view>

    <!-- 肉类图标 -->
    <view v-else-if="name === 'meat'" class="icon-meat">
      <view class="meat-bone"></view>
      <view class="meat-body"></view>
    </view>

    <!-- 蔬菜图标 -->
    <view v-else-if="name === 'vegetable'" class="icon-vegetable">
      <view class="vege-leaf l1"></view>
      <view class="vege-leaf l2"></view>
      <view class="vege-stem"></view>
    </view>

    <!-- 汤类图标 -->
    <view v-else-if="name === 'soup'" class="icon-soup">
      <view class="soup-bowl"></view>
      <view class="soup-steam s1"></view>
      <view class="soup-steam s2"></view>
    </view>

    <!-- 水果图标 -->
    <view v-else-if="name === 'fruit'" class="icon-fruit">
      <view class="fruit-body"></view>
      <view class="fruit-leaf"></view>
      <view class="fruit-stem"></view>
    </view>

    <!-- 其他图标 -->
    <view v-else-if="name === 'other'" class="icon-other">
      <view class="other-plate"></view>
      <view class="other-fork"></view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 32,
    },
    color: {
      type: String,
      default: '',
    },
    ariaLabel: {
      type: String,
      default: '',
    },
  },
  computed: {
    iconColor() {
      if (this.color) return this.color;
      // 根据图标类型返回默认颜色
      const colorMap = {
        breakfast: '#F59E0B',
        lunch: '#3B82F6',
        dinner: '#8B5CF6',
        fire: '#EF4444',
        dish: '#6B7280',
        calendar: '#22C55E',
        search: '#6B7280',
        camera: '#6B7280',
        rice: '#F59E0B',
        meat: '#EF4444',
        vegetable: '#22C55E',
        soup: '#F59E0B',
        fruit: '#22C55E',
        other: '#6B7280',
      };
      return colorMap[this.name] || '#6B7280';
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* 早餐 - 太阳 */
.icon-breakfast .sun {
  position: relative;
  width: 60%;
  height: 60%;
}

.sun-core {
  width: 100%;
  height: 100%;
  background: $color-breakfast;
  border-radius: 50%;
}

.sun-ray {
  position: absolute;
  width: 3rpx;
  height: 20%;
  background: $color-breakfast;
  border-radius: 2rpx;
  left: 50%;
  transform: translateX(-50%);
}

.ray-1 {
  top: -30%;
}
.ray-2 {
  bottom: -30%;
}
.ray-3 {
  left: -30%;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  width: 3rpx;
  height: 20%;
}
.ray-4 {
  right: -30%;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  width: 3rpx;
  height: 20%;
  left: auto;
}

/* 午餐 - 圆太阳 */
.icon-lunch .sun-full {
  width: 70%;
  height: 70%;
  position: relative;
}

.sun-full-core {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, $color-warning-light 0%, $color-warning 100%);
  border-radius: 50%;
  box-shadow: 0 0 10rpx rgba(245, 158, 11, 0.5);
}

/* 晚餐 - 月亮 */
.icon-dinner .moon {
  width: 60%;
  height: 60%;
  background: linear-gradient(135deg, $color-dinner-light 0%, $color-dinner 100%);
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
}

/* 火焰 */
.icon-fire {
  position: relative;
  width: 50%;
  height: 60%;
}

.flame {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(0deg, $color-error 0%, $color-warning 100%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
}

.flame-1 {
  height: 80%;
  width: 70%;
  left: 15%;
}

.flame-2 {
  height: 60%;
  width: 50%;
  left: 25%;
  opacity: 0.7;
}

/* 添加 */
.icon-add {
  width: 60%;
  height: 60%;
  position: relative;
}

.icon-add .h-line,
.icon-add .v-line {
  position: absolute;
  background: currentColor;
  border-radius: 2rpx;
}

.icon-add .h-line {
  width: 100%;
  height: 4rpx;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.icon-add .v-line {
  width: 4rpx;
  height: 100%;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
}

/* 关闭 */
.icon-close {
  width: 60%;
  height: 60%;
  position: relative;
}

.icon-close .line {
  position: absolute;
  width: 100%;
  height: 4rpx;
  background: currentColor;
  border-radius: 2rpx;
  top: 50%;
  left: 0;
}

.icon-close .line-1 {
  transform: translateY(-50%) rotate(45deg);
}

.icon-close .line-2 {
  transform: translateY(-50%) rotate(-45deg);
}

/* 菜品 */
.icon-dish {
  width: 70%;
  height: 70%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-dish .plate {
  width: 100%;
  height: 100%;
  border: 4rpx solid currentColor;
  border-radius: 50%;
}

.icon-dish .plate-inner {
  position: absolute;
  width: 60%;
  height: 60%;
  border: 2rpx solid currentColor;
  border-radius: 50%;
  opacity: 0.5;
}

/* 日历 */
.icon-calendar {
  width: 70%;
  height: 70%;
  position: relative;
}

.cal-top {
  width: 100%;
  height: 20%;
  background: $color-success;
  border-radius: 4rpx 4rpx 0 0;
}

.cal-body {
  width: 100%;
  height: 80%;
  border: 2rpx solid $color-border;
  border-top: none;
  border-radius: 0 0 4rpx 4rpx;
  background: $color-bg-primary;
}

.cal-dots {
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6rpx;
}

.cal-dot {
  width: 6rpx;
  height: 6rpx;
  background: $color-success;
  border-radius: 50%;
}

/* 搜索 */
.icon-search {
  width: 60%;
  height: 60%;
  position: relative;
}

.search-circle {
  width: 60%;
  height: 60%;
  border: 3rpx solid currentColor;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
}

.search-handle {
  width: 3rpx;
  height: 40%;
  background: currentColor;
  border-radius: 2rpx;
  position: absolute;
  bottom: 0;
  right: 10%;
  transform: rotate(-45deg);
  transform-origin: bottom center;
}

/* 相机 */
.icon-camera {
  width: 70%;
  height: 70%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.camera-body {
  width: 100%;
  height: 70%;
  background: currentColor;
  border-radius: 6rpx;
  margin-top: 30%;
  position: relative;
}

.camera-lens {
  width: 36%;
  height: 50%;
  border: 3rpx solid currentColor;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: transparent;
}

.camera-flash {
  width: 20%;
  height: 15%;
  background: currentColor;
  border-radius: 2rpx;
  position: absolute;
  top: 15%;
  left: 20%;
}

/* 主食 - 米饭碗 */
.icon-rice {
  width: 70%;
  height: 70%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rice-bowl {
  width: 80%;
  height: 50%;
  background: currentColor;
  border-radius: 0 0 40% 40%;
  position: absolute;
  bottom: 10%;
}

.rice-grain {
  width: 12%;
  height: 16%;
  background: currentColor;
  border-radius: 50%;
  position: absolute;
  top: 15%;
  opacity: 0.6;
}

.rice-grain.g1 {
  left: 25%;
}
.rice-grain.g2 {
  left: 45%;
}
.rice-grain.g3 {
  left: 65%;
}

/* 肉类 */
.icon-meat {
  width: 70%;
  height: 70%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.meat-body {
  width: 50%;
  height: 60%;
  background: currentColor;
  border-radius: 30% 50% 50% 30%;
  transform: rotate(-30deg);
}

.meat-bone {
  width: 30%;
  height: 15%;
  background: currentColor;
  border-radius: 10rpx;
  position: absolute;
  right: 10%;
  top: 35%;
  transform: rotate(-30deg);
}

/* 蔬菜 */
.icon-vegetable {
  width: 70%;
  height: 70%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vege-stem {
  width: 12%;
  height: 40%;
  background: currentColor;
  border-radius: 4rpx;
  position: absolute;
  bottom: 15%;
}

.vege-leaf {
  width: 40%;
  height: 35%;
  background: currentColor;
  border-radius: 50% 50% 50% 50%;
  position: absolute;
}

.vege-leaf.l1 {
  top: 10%;
  left: 15%;
  transform: rotate(-20deg);
}

.vege-leaf.l2 {
  top: 15%;
  right: 15%;
  transform: rotate(20deg);
}

/* 汤类 */
.icon-soup {
  width: 70%;
  height: 70%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.soup-bowl {
  width: 80%;
  height: 45%;
  background: currentColor;
  border-radius: 0 0 50% 50%;
  position: absolute;
  bottom: 15%;
}

.soup-steam {
  width: 8%;
  height: 25%;
  background: currentColor;
  border-radius: 4rpx;
  position: absolute;
  top: 5%;
  opacity: 0.5;
}

.soup-steam.s1 {
  left: 25%;
  transform: rotate(-10deg);
}
.soup-steam.s2 {
  right: 25%;
  transform: rotate(10deg);
}

/* 水果 */
.icon-fruit {
  width: 70%;
  height: 70%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fruit-body {
  width: 65%;
  height: 65%;
  background: currentColor;
  border-radius: 50%;
}

.fruit-stem {
  width: 10%;
  height: 20%;
  background: currentColor;
  border-radius: 2rpx;
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%) rotate(-15deg);
}

.fruit-leaf {
  width: 20%;
  height: 15%;
  background: currentColor;
  border-radius: 50% 50% 50% 0;
  position: absolute;
  top: 8%;
  left: 55%;
  transform: rotate(30deg);
}

/* 其他 - 餐具 */
.icon-other {
  width: 70%;
  height: 70%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.other-plate {
  width: 60%;
  height: 60%;
  border: 3rpx solid currentColor;
  border-radius: 50%;
  position: absolute;
}

.other-fork {
  width: 8%;
  height: 50%;
  background: currentColor;
  border-radius: 2rpx;
  position: absolute;
  left: 25%;
  top: 25%;
}
</style>
