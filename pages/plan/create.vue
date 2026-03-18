<template>
  <view class="container">
    <scroll-view class="form-scroll" scroll-y :show-scrollbar="false">
      <!-- 日历选择器 -->
      <view class="calendar-section">
        <view class="calendar-header">
          <view class="nav-btn" @tap="prevMonth">
            <view class="arrow left"></view>
          </view>
          <text class="month-title"
            >{{ currentYear }}年{{ currentMonth + 1 }}月</text
          >
          <view class="nav-btn" @tap="nextMonth">
            <view class="arrow right"></view>
          </view>
        </view>

        <!-- 星期标题 -->
        <view class="weekdays">
          <text class="weekday" v-for="day in weekDays" :key="day">{{
            day
          }}</text>
        </view>

        <!-- 日期网格 -->
        <view class="days-grid">
          <view
            v-for="(day, index) in calendarDays"
            :key="index"
            class="day-cell"
            :class="{
              empty: !day.date,
              'other-month': day.otherMonth,
              planned: day.isPlanned,
              selected: day.isSelected,
              'in-range': day.isInRange,
              start: day.isStart,
              end: day.isEnd,
              today: day.isToday,
              disabled: day.isDisabled,
            }"
            @tap="selectDate(day)"
          >
            <text class="day-number">{{ day.dayNum }}</text>
            <view class="plan-dot" v-if="day.isPlanned"></view>
          </view>
        </view>

        <!-- 图例 -->
        <view class="legend">
          <view class="legend-item">
            <view class="legend-dot planned"></view>
            <text class="legend-text">已有规划</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot selected"></view>
            <text class="legend-text">已选日期</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot in-range"></view>
            <text class="legend-text">日期范围</text>
          </view>
        </view>
      </view>

      <!-- 已选日期显示 -->
      <view class="selected-range" v-if="form.startDate && form.endDate">
        <view class="range-display">
          <text class="range-label">已选日期</text>
          <text class="range-value"
            >{{ form.startDate }} 至 {{ form.endDate }}</text
          >
          <text class="range-count">共 {{ dayCount }} 天</text>
        </view>
        <view class="clear-btn" @tap="clearSelection">
          <text class="clear-text">清除</text>
        </view>
      </view>

      <!-- 选择提示 -->
      <view class="select-tip" v-if="!form.startDate">
        <text class="tip-text">点击日历选择起始日期，再次点击选择结束日期</text>
      </view>

      <!-- 快捷选择 -->
      <view class="quick-select">
        <view
          class="quick-btn"
          :class="{ active: selectedQuick === 'week' }"
          @tap="quickSelectThisWeek"
          >本周</view
        >
        <view
          class="quick-btn"
          :class="{ active: selectedQuick === '3' }"
          @tap="quickSelect(3)"
          >3天</view
        >
        <view
          class="quick-btn"
          :class="{ active: selectedQuick === '5' }"
          @tap="quickSelect(5)"
          >5天</view
        >
        <view
          class="quick-btn"
          :class="{ active: selectedQuick === '7' }"
          @tap="quickSelect(7)"
          >7天</view
        >
        <view
          class="quick-btn"
          :class="{ active: selectedQuick === '14' }"
          @tap="quickSelect(14)"
          >14天</view
        >
      </view>

      <!-- 日期冲突提示 -->
      <view class="conflict-warning" v-if="conflictPlans.length > 0">
        <view class="warning-icon">
          <view class="icon-warn"></view>
        </view>
        <view class="warning-content">
          <text class="warning-title">日期冲突</text>
          <text class="warning-text">所选日期与以下规划有重叠：</text>
          <view class="conflict-list">
            <view
              class="conflict-item"
              v-for="plan in conflictPlans"
              :key="plan.id"
            >
              <text>{{ plan.startDate }} ~ {{ plan.endDate }}</text>
            </view>
          </view>
          <text class="warning-hint">创建后，冲突日期的安排将被覆盖</text>
        </view>
      </view>

      <!-- 规划设置 -->
      <view class="form-section">
        <view class="section-title">规划设置</view>
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">每周重新开始</text>
            <text class="setting-desc">每周一0点自动清空本周所有餐食安排</text>
          </view>
          <switch
            :checked="form.weeklyReset"
            @change="onWeeklyResetChange"
            color="#4CAF50"
          />
        </view>
      </view>
    </scroll-view>

    <!-- 提交 -->
    <view class="submit-bar">
      <button class="submit-btn" @tap="createPlan" :disabled="!canSubmit">
        创建规划
      </button>
    </view>
  </view>
</template>

<script>
import store from "@/utils/store.js";

export default {
  data() {
    return {
      form: {
        startDate: "",
        endDate: "",
        weeklyReset: false,
      },
      conflictPlans: [],
      selectedQuick: "",
      isQuickSelecting: false,
      // 日历相关
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      weekDays: ["日", "一", "二", "三", "四", "五", "六"],
      plannedDates: new Set(),
      selectingEnd: false, // 是否正在选择结束日期
    };
  },
  computed: {
    dayCount() {
      if (!this.form.startDate || !this.form.endDate) return 0;
      const start = new Date(this.form.startDate);
      const end = new Date(this.form.endDate);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff : 0;
    },
    canSubmit() {
      return this.form.startDate && this.form.endDate && this.dayCount > 0;
    },
    calendarDays() {
      const days = [];
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      const startDayOfWeek = firstDay.getDay();
      const totalDays = lastDay.getDate();

      // 今天的日期字符串
      const todayStr = store.formatDate(new Date());

      // 上个月的天数填充
      const prevMonthLastDay = new Date(
        this.currentYear,
        this.currentMonth,
        0,
      ).getDate();
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const dayNum = prevMonthLastDay - i;
        const date = new Date(this.currentYear, this.currentMonth - 1, dayNum);
        const dateStr = store.formatDate(date);
        days.push({
          dayNum,
          date: dateStr,
          otherMonth: true,
          isPlanned: this.plannedDates.has(dateStr),
          isToday: false,
          isDisabled: this.plannedDates.has(dateStr),
        });
      }

      // 当月的天数
      for (let i = 1; i <= totalDays; i++) {
        const date = new Date(this.currentYear, this.currentMonth, i);
        const dateStr = store.formatDate(date);
        const isPlanned = this.plannedDates.has(dateStr);
        const isSelected = this.isDateSelected(dateStr);
        const isInRange = this.isDateInRange(dateStr);
        const isStart = dateStr === this.form.startDate;
        const isEnd = dateStr === this.form.endDate;

        days.push({
          dayNum: i,
          date: dateStr,
          otherMonth: false,
          isPlanned,
          isToday: dateStr === todayStr,
          isSelected: isSelected || isStart || isEnd,
          isInRange: isInRange && !isStart && !isEnd,
          isStart,
          isEnd,
          isDisabled: false,
        });
      }

      // 下个月的天数填充（补齐6行）
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(this.currentYear, this.currentMonth + 1, i);
        const dateStr = store.formatDate(date);
        days.push({
          dayNum: i,
          date: dateStr,
          otherMonth: true,
          isPlanned: this.plannedDates.has(dateStr),
          isToday: false,
          isDisabled: this.plannedDates.has(dateStr),
        });
      }

      return days;
    },
  },
  onLoad() {
    this.loadPlannedDates();
    // 默认选中本周
    this.quickSelectThisWeek();
  },
  methods: {
    loadPlannedDates() {
      this.plannedDates = store.getPlannedDates();
    },
    isDateSelected(dateStr) {
      return dateStr === this.form.startDate || dateStr === this.form.endDate;
    },
    isDateInRange(dateStr) {
      if (!this.form.startDate || !this.form.endDate) return false;
      return dateStr > this.form.startDate && dateStr < this.form.endDate;
    },
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    },
    selectDate(day) {
      if (!day.date || day.isDisabled) return;

      this.selectedQuick = "";

      // 如果没有开始日期，或者已经选完了，重新开始选择
      if (!this.form.startDate || (this.form.startDate && this.form.endDate)) {
        this.form.startDate = day.date;
        this.form.endDate = "";
        this.selectingEnd = true;
      } else if (this.selectingEnd) {
        // 正在选择结束日期
        if (day.date < this.form.startDate) {
          // 如果选择的日期在开始日期之前，交换
          this.form.endDate = this.form.startDate;
          this.form.startDate = day.date;
        } else {
          this.form.endDate = day.date;
        }
        this.selectingEnd = false;
        this.checkConflicts();
      }
    },
    clearSelection() {
      this.form.startDate = "";
      this.form.endDate = "";
      this.selectingEnd = false;
      this.conflictPlans = [];
      this.selectedQuick = "";
    },
    quickSelect(days) {
      this.isQuickSelecting = true;
      this.selectedQuick = String(days);
      const today = new Date();
      const start = store.formatDate(today);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + days - 1);
      this.form.startDate = start;
      this.form.endDate = store.formatDate(endDate);
      this.checkConflicts();
      this.$nextTick(() => {
        this.isQuickSelecting = false;
      });
    },
    quickSelectThisWeek() {
      this.isQuickSelecting = true;
      this.selectedQuick = "week";
      const today = new Date();
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      this.form.startDate = store.formatDate(monday);
      this.form.endDate = store.formatDate(sunday);
      this.checkConflicts();
      this.$nextTick(() => {
        this.isQuickSelecting = false;
      });
    },
    checkConflicts() {
      if (this.form.startDate && this.form.endDate) {
        this.conflictPlans = store.checkDateConflict(
          this.form.startDate,
          this.form.endDate,
        );
      } else {
        this.conflictPlans = [];
      }
    },
    onWeeklyResetChange(e) {
      this.form.weeklyReset = e.detail.value;
    },
    createPlan() {
      if (!this.canSubmit) return;

      const doCreate = () => {
        const plan = {
          startDate: this.form.startDate,
          endDate: this.form.endDate,
          weeklyReset: this.form.weeklyReset,
          days: {},
        };

        const dates = store.getDateRange(
          this.form.startDate,
          this.form.endDate,
        );
        dates.forEach((date) => {
          plan.days[date] = {
            breakfast: [],
            lunch: [],
            dinner: [],
          };
        });

        const newPlan = store.addPlan(plan);
        uni.showToast({ title: "创建成功", icon: "success" });

        setTimeout(() => {
          uni.redirectTo({
            url: "/pages/plan/detail?id=" + newPlan.id,
          });
        }, 500);
      };

      if (this.conflictPlans.length > 0) {
        const conflictDates = this.conflictPlans
          .map((p) => `${p.startDate}~${p.endDate}`)
          .join("、");
        uni.showModal({
          title: "日期冲突提醒",
          content: `所选日期与现有规划（${conflictDates}）存在重叠。\n\n新规划将替换冲突日期的所有餐食安排，确定要继续吗？`,
          confirmText: "确认替换",
          confirmColor: "#4CAF50",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              doCreate();
            }
          },
        });
      } else {
        doCreate();
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
  flex: 1;
  box-sizing: border-box;
  width: 100vw;
  padding: $spacing-md;
  padding-bottom: calc($spacing-2xl + 88rpx);
}

// 日历样式
.calendar-section {
  background: $color-bg-primary;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
}

.nav-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-bg-tertiary;
  border-radius: $radius-md;
  transition:
    transform 0.2s,
    background 0.2s;
  position: relative;
  overflow: hidden;
}

.nav-btn::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: $color-primary-bg;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.3s,
    height 0.3s;
}

.nav-btn:active {
  transform: scale(0.92);
}

.nav-btn:active::after {
  width: 150%;
  height: 150%;
}

.nav-btn:active .arrow {
  border-color: $color-primary;
}

.arrow {
  width: 16rpx;
  height: 16rpx;
  border-top: 4rpx solid $color-text-secondary;
  border-right: 4rpx solid $color-text-secondary;
}

.arrow.left {
  transform: rotate(-135deg);
}

.arrow.right {
  transform: rotate(45deg);
}

.month-title {
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  transition: opacity 0.2s;
  min-width: 180rpx;
  text-align: center;
}

.weekdays {
  display: flex;
  margin-bottom: $spacing-sm;
}

.weekday {
  flex: 1;
  text-align: center;
  font-size: $font-size-sm;
  color: $color-text-tertiary;
  padding: $spacing-xs 0;
}

.days-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4rpx;
}

.day-cell {
  width: calc((100% - 24rpx) / 7);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: $radius-md;
  transition:
    transform 0.15s,
    background 0.15s;
  min-height: 88rpx;
}

.day-cell.empty {
  visibility: hidden;
}

.day-cell.other-month .day-number {
  color: $color-text-placeholder;
}

.day-number {
  font-size: $font-size-base;
  color: $color-text-primary;
  transition: color 0.15s;
}

.day-cell.today .day-number {
  color: $color-primary;
  font-weight: $font-weight-semibold;
}

.day-cell.today::after {
  content: "";
  position: absolute;
  bottom: 8rpx;
  width: 8rpx;
  height: 8rpx;
  background: $color-primary;
  border-radius: 50%;
  animation: today-pulse 2s ease-in-out infinite;
}

@keyframes today-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 6rpx rgba(34, 197, 94, 0);
  }
}

.day-cell.planned {
  background: rgba(239, 68, 68, 0.08);
}

.day-cell.planned .day-number {
  color: $color-error;
}

.plan-dot {
  position: absolute;
  bottom: 6rpx;
  width: 8rpx;
  height: 8rpx;
  background: $color-error;
  border-radius: 50%;
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

.day-cell.today .plan-dot {
  display: none;
}

.day-cell.disabled {
  opacity: 0.5;
}

.day-cell:not(.disabled):not(.selected):not(.in-range):active {
  background: $color-primary-bg;
  transform: scale(0.92);
}

.day-cell.selected {
  background: $color-primary;
  animation: date-select 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes date-select {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.day-cell.selected .day-number {
  color: $color-bg-primary;
  font-weight: $font-weight-medium;
}

.day-cell.selected .plan-dot {
  display: none;
}

.day-cell.start {
  border-radius: $radius-md;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  animation: range-start 0.3s ease-out;
}

@keyframes range-start {
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.day-cell.end {
  border-radius: $radius-md;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  animation: range-end 0.3s ease-out;
}

@keyframes range-end {
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.day-cell.start.end {
  border-radius: $radius-md;
}

.day-cell.in-range {
  background: $color-primary-bg;
  border-radius: 0;
}

.day-cell.in-range .day-number {
  color: $color-primary;
}

// 日期范围连接动画
.day-cell.in-range {
  animation: range-fill 0.2s ease-out backwards;
}

@keyframes range-fill {
  0% {
    opacity: 0;
    background: transparent;
  }
}

// 图例
.legend {
  display: flex;
  gap: 32rpx;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid $color-divider;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.legend-dot.planned {
  background: $color-error;
}

.legend-dot.selected {
  background: $color-primary;
}

.legend-dot.in-range {
  background: $color-primary-bg;
  border: 2rpx solid $color-primary;
}

.legend-text {
  font-size: $font-size-xs;
  color: $color-text-tertiary;
}

// 已选日期显示
.selected-range {
  background: $color-primary-bg;
  border-radius: $radius-lg;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  0% {
    opacity: 0;
    transform: translateY(20rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.range-display {
  display: flex;
  flex-direction: column;
}

.range-label {
  font-size: $font-size-sm;
  color: $color-text-tertiary;
  margin-bottom: $spacing-xs;
}

.range-value {
  font-size: $font-size-base;
  color: $color-primary;
  font-weight: $font-weight-medium;
}

.range-count {
  font-size: $font-size-xs;
  color: $color-text-secondary;
  margin-top: $spacing-xs;
}

.clear-btn {
  padding: $spacing-sm $spacing-md;
  background: rgba(34, 197, 94, 0.15);
  border-radius: $radius-sm;
  transition:
    transform 0.2s,
    background 0.2s;
  position: relative;
  overflow: hidden;
  min-height: $touch-target-min;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:active {
  transform: scale(0.95);
  background: rgba(34, 197, 94, 0.25);
}

.clear-text {
  font-size: $font-size-sm;
  color: $color-primary;
}

.select-tip {
  background: $color-primary-bg;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  text-align: center;
}

.tip-text {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.quick-select {
  display: flex;
  justify-content: space-between;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.quick-btn {
  flex: 1;
  text-align: center;
  padding: $spacing-md 0;
  background: $color-bg-primary;
  border-radius: $radius-md;
  font-size: $font-size-base;
  color: $color-primary;
  border: 1rpx solid $color-primary;
  transition:
    transform 0.2s,
    background 0.2s;
  position: relative;
  overflow: hidden;
  min-height: $touch-target-min;
}

.quick-btn::after {
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

.quick-btn:active {
  background: $color-primary-bg;
  transform: scale(0.95);
}

.quick-btn:active::after {
  width: 200%;
  height: 200%;
}

.quick-btn.active {
  background: linear-gradient(
    135deg,
    $color-primary 0%,
    $color-primary-dark 100%
  );
  color: $color-bg-primary;
  border-color: transparent;
}

.quick-btn.active:active {
  background: linear-gradient(135deg, $color-primary-dark 0%, #3d8b40 100%);
}

.conflict-warning {
  background: $color-warning-bg;
  border: 1rpx solid $color-warning-border;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  display: flex;
  gap: $spacing-md;
  animation: warning-slide 0.4s ease-out;
}

@keyframes warning-slide {
  0% {
    opacity: 0;
    transform: translateX(-20rpx);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.warning-icon {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-warn {
  width: 8rpx;
  height: 24rpx;
  background: #ea580c;
  border-radius: 4rpx;
  position: relative;
}

.icon-warn::before {
  content: "";
  position: absolute;
  bottom: -12rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 8rpx;
  height: 8rpx;
  background: #ea580c;
  border-radius: 50%;
}

.warning-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.warning-title {
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: #ea580c;
  margin-bottom: $spacing-xs;
}

.warning-text {
  font-size: $font-size-sm;
  color: #9a3412;
  margin-bottom: $spacing-sm;
}

.conflict-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  margin-bottom: $spacing-sm;
}

.conflict-item {
  background: rgba(234, 88, 12, 0.1);
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
}

.conflict-item text {
  font-size: $font-size-sm;
  color: #c2410c;
}

.warning-hint {
  font-size: $font-size-xs;
  color: #fb923c;
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
  margin-bottom: $spacing-lg;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-info {
  display: flex;
  flex-direction: column;
}

.setting-label {
  font-size: $font-size-base;
  color: $color-text-primary;
}

.setting-desc {
  font-size: $font-size-xs;
  color: $color-text-tertiary;
  margin-top: $spacing-xs;
}

.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: $spacing-md;
  background: $color-bg-primary;
  border-top: 1rpx solid $color-divider;
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

/* 减少动态效果支持 */
@media (prefers-reduced-motion: reduce) {
  .submit-btn::before {
    animation: none;
  }

  .nav-btn,
  .day-cell,
  .clear-btn,
  .quick-btn,
  .submit-btn {
    transition: none;
  }

  .nav-btn:active,
  .day-cell:active,
  .clear-btn:active,
  .quick-btn:active,
  .submit-btn:active {
    transform: none;
  }
}

.submit-btn:active {
  transform: scale(0.98);
  box-shadow: $shadow-primary;
}

.submit-btn[disabled] {
  background: $color-text-tertiary;
}

.submit-btn[disabled]::before {
  display: none;
}
</style>
