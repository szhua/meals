<template>
	<view class="container-his">
		<z-paging ref="paging" :fixed="false" style="flex: 1;" :show-empty="true" @query="queryList" v-model="datas">
			<view class="section" v-if="currentPlan">
				<view class="section-title">当前规划</view>
				<view class="plan-card current" @tap="goToDetail(currentPlan.id)">
					<view class="plan-info">
						<text class="plan-date">{{ currentPlan.startDate }} ~ {{ currentPlan.endDate }}</text>
						<text class="plan-days">{{ calculateDays(currentPlan) }}天</text>
					</view>
					<view class="plan-badge" v-if="currentPlan.weeklyReset">周清空</view>
				</view>
			</view>

			<!-- 未来规划 -->
			<view class="section" v-if="futurePlans.length > 0">
				<view class="section-title">未来规划</view>
				<view v-for="plan in futurePlans" :key="plan.id" class="plan-card future" @tap="goToDetail(plan.id)">
					<view class="plan-info">
						<text class="plan-date">{{ plan.startDate }} ~ {{ plan.endDate }}</text>
						<text class="plan-days">{{ calculateDays(plan) }}天</text>
					</view>
					<view class="plan-actions">
						<text class="action-btn delete" @tap.stop="confirmDelete(plan)">删除</text>
					</view>
				</view>
			</view>

			<!-- 历史规划 -->
			<view class="section">
				<view class="section-header">
					<text class="section-title">历史规划</text>
				</view>
				<view v-if="historyPlans.length === 0 && (currentPlan || futurePlans.length > 0)" class="empty">
					<text class="empty-text">暂无历史规划</text>
				</view>
				<view v-for="plan in historyPlans" :key="plan.id" class="plan-card" @tap="goToDetail(plan.id)">
					<view class="plan-info">
						<text class="plan-date">{{ plan.startDate }} ~ {{ plan.endDate }}</text>
						<text class="plan-days">{{ calculateDays(plan) }}天</text>
					</view>
					<view class="plan-actions">
						<text class="action-btn delete" @tap.stop="confirmDelete(plan)">删除</text>
					</view>
				</view>
			</view>

			<!-- 首次使用空状态 -->
			<view v-if="plans.length === 0" class="first-time-empty">
				<view class="empty-illustration">
					<view class="calendar-icon">
						<view class="calendar-top"></view>
						<view class="calendar-body">
							<view class="calendar-grid">
								<view class="calendar-dot" v-for="i in 6" :key="i"></view>
							</view>
						</view>
					</view>
				</view>
				<text class="empty-title">还没有任何规划</text>
				<text class="empty-desc">创建你的第一个饮食规划，开始健康生活</text>
				<view class="empty-actions">
					<view class="empty-btn primary" @tap="createPlan">
						<text class="btn-icon">+</text>
						<text class="btn-text">创建规划</text>
					</view>
				</view>
				<text class="empty-tip">建议先在菜品库添加一些常用菜品</text>
			</view>

			<!-- 创建按钮 -->
			<view class="create-btn" v-if="plans.length > 0" @tap="createPlan">
				<text class="create-text">+ 创建新规划</text>
			</view>
		</z-paging>
	</view>
</template>

<script>
	import api from "@/api/index.js";
	import zPaging from "@/uni_modules/z-paging/components/z-paging/z-paging.vue";

	// 格式化日期
	function formatDate(date) {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		return `${y}-${m}-${d}`;
	}

	export default {
		components: {
			zPaging,
		},
		data() {
			return {
				datas: [],
				plans: [],
			};
		},
		computed: {
			currentPlan() {
				const today = formatDate(new Date());
				return this.plans.find((p) => today >= p.startDate && today <= p.endDate);
			},
			futurePlans() {
				const today = formatDate(new Date());
				return this.plans.filter((p) => p.startDate > today);
			},
			historyPlans() {
				const today = formatDate(new Date());
				return this.plans.filter((p) => p.endDate < today);
			},
		},
		onShow() {
			this.loadPlans();
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
				this.loadPlans();
				// 本地数据，直接完成
				this.$refs.paging?.complete([1]);
			},
			async loadPlans() {
				try {
					const res = await api.getPlans();
					this.plans = (res.data.list || []).sort((a, b) => {
						return new Date(b.startDate) - new Date(a.startDate);
					});
				} catch (error) {
					console.error("加载规划列表失败:", error);
					this.plans = [];
				}
			},
			calculateDays(plan) {
				const start = new Date(plan.startDate);
				const end = new Date(plan.endDate);
				return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
			},
			goToDetail(id) {
				uni.navigateTo({
					url: "/pages/plan/detail?id=" + id,
				});
			},
			createPlan() {
				uni.navigateTo({
					url: "/pages/plan/create",
				});
			},
			confirmDelete(plan) {
				uni.showModal({
					title: "删除规划",
					content: `确定要删除「${plan.startDate} ~ ${plan.endDate}」吗？\n删除后无法恢复，规划内的菜品安排将清空。`,
					confirmColor: "#f44336",
					confirmText: "删除",
					cancelText: "取消",
					success: async (res) => {
						if (res.confirm) {
							try {
								await api.deletePlan(plan.id);
								await this.loadPlans();
								uni.showToast({
									title: "已删除",
									icon: "success"
								});
							} catch (error) {
								console.error("删除规划失败:", error);
								uni.showToast({
									title: "删除失败",
									icon: "none"
								});
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

	.container-his {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: $color-bg-secondary;
		padding: $spacing-md;
		padding-bottom: calc($spacing-2xl + 88rpx);
	}

	.section {
		margin-bottom: $spacing-lg;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: $spacing-md;
	}

	.section-title {
		font-size: $font-size-md;
		font-weight: $font-weight-medium;
		color: $color-text-primary;
		margin-bottom: $spacing-md;
	}

	.empty {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 200rpx;
		background: $color-bg-primary;
		border-radius: $radius-lg;
	}

	.empty-text {
		color: $color-text-tertiary;
		font-size: $font-size-base;
	}

	.empty-hint {
		color: $color-text-placeholder;
		font-size: $font-size-sm;
		margin-top: $spacing-sm;
	}

	.plan-card {
		background: $color-bg-primary;
		border-radius: $radius-lg;
		padding: $spacing-lg;
		margin-bottom: $spacing-md;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: transform 0.25s, box-shadow 0.25s;
		position: relative;
		overflow: hidden;
		animation: card-enter 0.4s ease-out backwards;
		min-height: $touch-target-min;
	}

	@keyframes card-enter {
		0% {
			opacity: 0;
			transform: translateY(20rpx);
		}

		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	// 为每个卡片添加递增的延迟
	.plan-card:nth-child(1) {
		animation-delay: 0s;
	}

	.plan-card:nth-child(2) {
		animation-delay: 0.05s;
	}

	.plan-card:nth-child(3) {
		animation-delay: 0.1s;
	}

	.plan-card:nth-child(4) {
		animation-delay: 0.15s;
	}

	.plan-card:nth-child(5) {
		animation-delay: 0.2s;
	}

	.plan-card::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		background: rgba(0, 0, 0, 0.02);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		transition:
			width 0.3s,
			height 0.3s;
	}

	.plan-card:active::after {
		width: 400%;
		height: 400%;
	}

	.plan-card:active {
		transform: scale(0.98);
	}

	.plan-card.current {
		background: linear-gradient(135deg, $color-primary 0%, #8bc34a 100%);
		animation: card-enter 0.4s ease-out backwards, current-glow 3s ease-in-out infinite;
	}

	@keyframes current-glow {

		0%,
		100% {
			box-shadow: 0 4rpx 20rpx rgba(34, 197, 94, 0.3);
		}

		50% {
			box-shadow: 0 4rpx 30rpx rgba(34, 197, 94, 0.5);
		}
	}

	.plan-card.future {
		background: linear-gradient(135deg, $color-info 0%, #2563eb 100%);
		animation: card-enter 0.4s ease-out backwards, future-shimmer 3s ease-in-out infinite;
	}

	@keyframes future-shimmer {

		0%,
		100% {
			background-position: 0% 50%;
		}

		50% {
			background-position: 100% 50%;
		}
	}

	.plan-card.future .plan-date {
		color: $color-bg-primary;
		text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
	}

	.plan-card.future .plan-days {
		color: rgba(255, 255, 255, 0.9);
		text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
	}

	.plan-info {
		display: flex;
		flex-direction: column;
	}

	.plan-date {
		font-size: $font-size-base;
		color: $color-text-primary;
		font-weight: $font-weight-medium;
	}

	.plan-card.current .plan-date {
		color: $color-bg-primary;
	}

	.plan-days {
		font-size: $font-size-sm;
		color: $color-text-tertiary;
		margin-top: $spacing-xs;
		font-variant-numeric: tabular-nums;
	}

	.plan-card.current .plan-days {
		color: rgba(255, 255, 255, 0.8);
	}

	.plan-badge {
		font-size: $font-size-xs;
		color: $color-bg-primary;
		background: rgba(255, 255, 255, 0.3);
		padding: 8rpx 16rpx;
		border-radius: $radius-full;
	}

	.plan-actions {
		display: flex;
		gap: $spacing-md;
	}

	.action-btn {
		font-size: $font-size-sm;
		padding: 12rpx 24rpx;
		border-radius: $radius-sm;
		transition: transform 0.2s, background 0.2s;
		min-height: $touch-target-min;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-btn.delete {
		color: $color-error;
		background: #ffebee;
	}

	.plan-card.current .plan-actions .action-btn.delete,
	.plan-card.future .plan-actions .action-btn.delete {
		background: rgba(255, 255, 255, 0.3);
		color: $color-bg-primary;
	}

	.plan-card.current .plan-actions .action-btn.delete:active,
	.plan-card.future .plan-actions .action-btn.delete:active {
		background: rgba(255, 255, 255, 0.5);
	}

	.action-btn.delete:active {
		background: #fecaca;
		transform: scale(0.92);
	}

	// 空状态动画
	.empty {
		animation: empty-fade 0.5s ease-out;
	}

	@keyframes empty-fade {
		0% {
			opacity: 0;
			transform: scale(0.95);
		}

		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	.create-btn {
		left: $spacing-md;
		right: $spacing-md;
		bottom: $spacing-2xl;
		height: 88rpx;
		width: calc(100% - calc($spacing-md * 2));
		background: linear-gradient(135deg,
				$color-primary 0%,
				$color-primary-dark 100%);
		border-radius: $radius-full;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: $shadow-primary;
		transition: transform 0.2s, box-shadow 0.2s;
		position: relative;
		overflow: hidden;
	}

	.create-btn::before {
		content: "";
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg,
				transparent,
				rgba(255, 255, 255, 0.2),
				transparent);
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

	.create-btn:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 10rpx rgba(34, 197, 94, 0.3);
	}

	.create-text {
		color: $color-bg-primary;
		font-size: $font-size-md;
		position: relative;
		z-index: 1;
	}

	/* ==================== 首次使用空状态 ==================== */
	.first-time-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 40rpx;
		animation: empty-fade 0.5s ease-out;
	}

	.empty-illustration {
		margin-bottom: 40rpx;
	}

	.calendar-icon {
		width: 160rpx;
		height: 180rpx;
		position: relative;
		animation: calendar-float 3s ease-in-out infinite;
	}

	@keyframes calendar-float {

		0%,
		100% {
			transform: translateY(0);
		}

		50% {
			transform: translateY(-10rpx);
		}
	}

	.calendar-top {
		height: 40rpx;
		background: $color-primary;
		border-radius: 16rpx 16rpx 0 0;
		position: relative;
	}

	.calendar-top::before,
	.calendar-top::after {
		content: '';
		position: absolute;
		top: -12rpx;
		width: 12rpx;
		height: 24rpx;
		background: $color-primary-dark;
		border-radius: 6rpx;
	}

	.calendar-top::before {
		left: 30rpx;
	}

	.calendar-top::after {
		right: 30rpx;
	}

	.calendar-body {
		height: 140rpx;
		background: $color-bg-primary;
		border: 4rpx solid $color-border;
		border-top: none;
		border-radius: 0 0 16rpx 16rpx;
		padding: 16rpx;
		box-sizing: border-box;
	}

	.calendar-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12rpx;
	}

	.calendar-dot {
		width: 100%;
		aspect-ratio: 1;
		background: $color-bg-tertiary;
		border-radius: 6rpx;
		animation: dot-pulse 2s ease-in-out infinite;
	}

	.calendar-dot:nth-child(1) {
		animation-delay: 0s;
	}

	.calendar-dot:nth-child(2) {
		animation-delay: 0.1s;
	}

	.calendar-dot:nth-child(3) {
		animation-delay: 0.2s;
	}

	.calendar-dot:nth-child(4) {
		animation-delay: 0.3s;
	}

	.calendar-dot:nth-child(5) {
		animation-delay: 0.4s;
	}

	.calendar-dot:nth-child(6) {
		animation-delay: 0.5s;
	}

	@keyframes dot-pulse {

		0%,
		100% {
			background: $color-bg-tertiary;
		}

		50% {
			background: $color-primary-bg;
		}
	}

	.first-time-empty .empty-title {
		font-size: $font-size-lg;
		color: $color-text-primary;
		font-weight: $font-weight-semibold;
		margin-bottom: 12rpx;
	}

	.first-time-empty .empty-desc {
		font-size: $font-size-sm;
		color: $color-text-tertiary;
		text-align: center;
		margin-bottom: 40rpx;
		line-height: 1.6;
	}

	.first-time-empty .empty-actions {
		width: 100%;
		max-width: 500rpx;
		margin-bottom: 40rpx;
	}

	.first-time-empty .empty-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24rpx 40rpx;
		border-radius: $radius-lg;
		transition: all 0.2s;
		position: relative;
		overflow: hidden;
	}

	.first-time-empty .empty-btn::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		transition: width 0.3s, height 0.3s;
	}

	.first-time-empty .empty-btn:active::after {
		width: 300%;
		height: 300%;
	}

	.first-time-empty .empty-btn.primary {
		background: linear-gradient(135deg, $color-primary 0%, $color-primary-dark 100%);
		box-shadow: $shadow-primary;
	}

	.first-time-empty .empty-btn.primary .btn-text {
		color: $color-bg-primary;
		font-weight: $font-weight-medium;
	}

	.first-time-empty .empty-btn:active {
		transform: scale(0.98);
	}

	.first-time-empty .btn-icon {
		font-size: $font-size-xl;
		color: $color-bg-primary;
		margin-right: 12rpx;
		font-weight: 300;
	}

	.first-time-empty .btn-text {
		font-size: $font-size-base;
	}

	.first-time-empty .empty-tip {
		font-size: $font-size-xs;
		color: $color-text-placeholder;
		padding: 16rpx 24rpx;
		background: $color-bg-tertiary;
		border-radius: $radius-md;
	}
</style>