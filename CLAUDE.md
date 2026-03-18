# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **uni-app + Vue 3** mobile app for meal planning and diet management (健康饮食规划小程序,名字为‘三餐记食’). The app allows users to manage dishes, create meal plans, and track their diet.

## Technology Stack

- **Framework**: uni-app (Vue 3)
- **Styling**: SCSS with design tokens
- **Icons**: IconPark (@icon-park/vue) - globally registered via `main.js`
- **State**: Local storage via `utils/store.js`
- **UI Components**: Custom components + z-paging for list pagination

## Key Commands

- **Run**: Open in HBuilderX and run to mini-program simulator
- **Build**: HBuilderX build to WeChat/mini-program

## Project Structure

```
pages/
├── index/          # Home - today's meal plan
├── dishes/         # Dish management (list, add)
├── plan/           # Meal plans (create, detail, history)

components/
├── icon.vue        # Original CSS-drawn icons (deprecated)
├── icon-park.vue   # IconPark wrapper component

styles/
├── variables.scss  # Design tokens (colors, spacing, typography, shadows)
├── animations.scss
├── dark-mode.scss

utils/
└── store.js        # Local storage wrapper
```

## Design System

All styling uses SCSS tokens from `styles/variables.scss`:

- **Colors**: `$color-primary`, `$color-success`, `$color-warning`, `$color-error`, etc.
- **Spacing**: `$spacing-xs` (8rpx), `$spacing-sm` (16rpx), `$spacing-md` (24rpx), etc.
- **Typography**: `$font-size-base` (28rpx), `$font-weight-medium`, etc.
- **Radius**: `$radius-sm`, `$radius-md`, `$radius-lg`, `$radius-full`

## Using IconPark

The `<icon-park>` component is globally registered. Usage:

```vue
<icon-park name="breakfast" :size="48" />
<icon-park name="search" color="#666" />
<icon-park name="add" />
<icon-park name="user" />
<icon-park name="calendar" />
```

Available icons: breakfast, lunch, dinner, fire, add, delete, edit, check, close, search, calendar, camera, dish, rice, meat, vegetable, soup, fruit, user, setting, home, and more.

## Page Structure

Each page uses custom navigation (navigationStyle: "custom") with:
- Custom header with back button
- Scroll-view with optimized props: `scroll-y`, `scroll-with-animation`, `enable-flex`, `show-scrollbar="false"`

## Layout Guidelines

See `memory/layout-guidelines.md` for detailed layout rules:
- 8pt grid spacing system
- Minimum touch target: 88rpx
- Card padding: 24rpx
- Scroll-view optimization settings