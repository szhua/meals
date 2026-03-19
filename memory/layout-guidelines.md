# 布局规范 - Meals App

## 设计令牌使用

### 间距系统 (8pt 基准)

所有间距必须使用设计令牌，禁止硬编码数值：

```scss
$spacing-xs: 8rpx;   // 极小间距
$spacing-sm: 16rpx;  // 小间距
$spacing-md: 24rpx;  // 标准间距
$spacing-lg: 32rpx;  // 大间距
$spacing-xl: 48rpx;  // 超大间距
$spacing-2xl: 64rpx; // 极大间距
```

### 圆角系统

```scss
$radius-sm: 8rpx;     // 小圆角
$radius-md: 12rpx;    // 中圆角
$radius-lg: 16rpx;    // 大圆角
$radius-xl: 24rpx;    // 超大圆角
$radius-full: 9999rpx; // 完全圆角
```

### 触摸目标

所有可交互元素最小尺寸为 `88rpx` (44pt)：

```scss
$touch-target-min: 88rpx;
```

## 布局一致性规则

### 1. 卡片间距

- 卡片内边距：`$spacing-md` (24rpx)
- 卡片之间间距：`$spacing-md` (24rpx)
- 区块之间间距：`$spacing-lg` (32rpx)

### 2. 列表项

- 列表项内边距：`$spacing-md`
- 列表项之间间距：`$spacing-md`
- 图片尺寸：统一使用 `160rpx x 160rpx`

### 3. 按钮

- 标准按钮高度：`88rpx` (满足触摸目标)
- 按钮内边距：至少 `$spacing-sm` 上下
- 按钮圆角：`$radius-full` (完全圆角) 或 `$radius-md`

### 4. 表单元素

- 输入框高度：`80rpx`
- 输入框内边距：左右 `$spacing-md`
- 标签与输入框间距：`$spacing-xs`

### 5. 日历网格

- 日期单元格：正方形，最小 `88rpx`
- 单元格间距：`4rpx`
- 星期标题 padding：`$spacing-xs` 上下

### 6. 导航元素

- 导航按钮尺寸：`64rpx x 64rpx`
- 分类筛选 item padding：`18rpx $spacing-md`

## Scroll-view 优化配置

所有 scroll-view 必须配置以下属性：

```html
<scroll-view
  scroll-y
  :scroll-with-animation="true"
  :enable-flex="true"
  :enable-avoid-clip="true"
  :show-scrollbar="false"
  :enable-passive="true"
  scroll-anchoring
>
```

## 过渡动画

- 标准过渡：`transition: transform 0.2s, background 0.2s`
- 禁止使用：`transition: all 0.xs`
- 按压效果：`transform: scale(0.95)`

## 颜色使用

所有颜色必须使用设计令牌：

```scss
// 正确
background: $color-bg-primary;
color: $color-text-secondary;

// 错误
background: #ffffff;
color: #666;
```

## 字体层级

```scss
$font-size-2xl: 56rpx;  // 大标题
$font-size-xl: 44rpx;   // 标题
$font-size-lg: 36rpx;   // 小标题
$font-size-md: 32rpx;   // 强调正文
$font-size-base: 28rpx; // 正文基准
$font-size-sm: 24rpx;   // 标签、小字
$font-size-xs: 22rpx;   // 辅助说明
```

## 常见布局模式

### 卡片布局

```scss
.card {
  background: $color-bg-primary;
  border-radius: $radius-lg;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;
  transition: transform 0.2s, box-shadow 0.2s;
}
```

### Section 布局

```scss
.section {
  margin-bottom: $spacing-lg;

  .section-title {
    font-size: $font-size-md;
    font-weight: $font-weight-medium;
    margin-bottom: $spacing-md;
  }
}
```

### Flex 布局

```scss
.row {
  display: flex;
  align-items: center;
  gap: $spacing-md; // 使用 gap 而非 margin
}
```

## 检查清单

每次完成布局后检查：

- [ ] 所有间距使用设计令牌
- [ ] 所有颜色使用设计令牌
- [ ] 触摸目标 ≥ 88rpx
- [ ] 过渡动画不使用 `all`
- [ ] scroll-view 配置完整
- [ ] 卡片间距一致
- [ ] 字体大小符合层级
