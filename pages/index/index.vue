<template>
	<!-- 未登录遮罩 -->
	<view class="login-mask" v-if="!isLoggedIn">
		<view class="login-content">
			<view class="login-illustration">
				<view class="login-plate"></view>
			</view>
			<text class="login-title">欢迎使用三餐记食</text>
			<text class="login-desc" v-if="isLoggingIn">正在进入...</text>
			<text class="login-desc" v-else>点击开始您的健康饮食之旅</text>
			<view class="login-btn" v-if="!isLoggingIn" @tap="handleLogin">
				<text class="login-btn-text">立即开始</text>
			</view>
			<view class="login-loading" v-else>
				<view class="loading-spinner"></view>
			</view>
		</view>
	</view>

	<!-- 主内容区域 -->
	<view class="containers">
		<z-paging ref="paging" style="flex: 1;" :loadingMoreEnabled="false" v-model="dataList" @query="queryList"
			:fixed="false">
			<view class="index-container">
				<!-- 欢迎区域 - 时间感知问候 -->
				<view class="welcome-section">
					<view class="greeting-row">
						<view class="greeting-text">
							<text class="greeting-emoji">{{ greeting.emoji }}</text>
							<text class="greeting-main">{{ greeting.text }}<text
									v-if="userInfo?.nickname">，{{ userInfo.nickname }}</text></text>
						</view>
						<view class="header-actions">
							<!-- 分享按钮 -->
							<view class="share-btn" @tap="handleShare">
								<icon-park name="share" size="36" />
							</view>
							<!-- 连续打卡徽章 -->
							<view class="streak-badge" v-if="streak.current > 0" @tap="showStreakDetail">
								<view class="streak-fire">
									<view class="flame flame-1"></view>
									<view class="flame flame-2"></view>
								</view>
								<text class="streak-count">{{ streak.current }}</text>
								<text class="streak-label">天</text>
							</view>
						</view>
					</view>
					<text class="welcome-subtitle">{{ greeting.message }}</text>
					<text class="today-date">{{ todayDate }}</text>
				</view>

				<!-- 今日规划 -->
				<view class="today-section" v-if="todayPlan">
					<view class="section-header">
						<text class="section-title">今日规划</text>
						<text class="section-more" @tap="goToDetail">查看详情</text>
					</view>

					<!-- 三餐卡片 -->
					<view class="today-meals">
						<view class="meal-card" :class="{ complete: todayMeals.breakfast.length > 0 }">
							<view class="meal-header">
								<view class="meal-icon-wrap breakfast">
									<icon-park name="breakfast" size="28" />
								</view>
								<text class="meal-name">早餐</text>
								<view class="meal-check" v-if="todayMeals.breakfast.length > 0">
									<view class="check-icon"></view>
								</view>
							</view>
							<view class="meal-dishes" v-if="todayMeals.breakfast.length">
								<text v-for="id in todayMeals.breakfast" :key="id"
									class="dish-text">{{ getDishName(id) }}</text>
							</view>
							<text v-else class="empty-meal">点击添加菜品</text>
						</view>

						<view class="meal-card" :class="{ complete: todayMeals.lunch.length > 0 }">
							<view class="meal-header">
								<view class="meal-icon-wrap lunch">
									<icon-park name="lunch" size="28" />
								</view>
								<text class="meal-name">午餐</text>
								<view class="meal-check" v-if="todayMeals.lunch.length > 0">
									<view class="check-icon"></view>
								</view>
							</view>
							<view class="meal-dishes" v-if="todayMeals.lunch.length">
								<text v-for="id in todayMeals.lunch" :key="id"
									class="dish-text">{{ getDishName(id) }}</text>
							</view>
							<text v-else class="empty-meal">点击添加菜品</text>
						</view>

						<view class="meal-card" :class="{ complete: todayMeals.dinner.length > 0 }">
							<view class="meal-header">
								<view class="meal-icon-wrap dinner">
									<icon-park name="dinner" size="28" />
								</view>
								<text class="meal-name">晚餐</text>
								<view class="meal-check" v-if="todayMeals.dinner.length > 0">
									<view class="check-icon"></view>
								</view>
							</view>
							<view class="meal-dishes" v-if="todayMeals.dinner.length">
								<text v-for="id in todayMeals.dinner" :key="id"
									class="dish-text">{{ getDishName(id) }}</text>
							</view>
							<text v-else class="empty-meal">点击添加菜品</text>
						</view>
					</view>

					<!-- 进度指示器 -->
					<view class="progress-bar">
						<view class="progress-track">
							<view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
						</view>
						<text class="progress-text">{{ progressText }}</text>
					</view>

					<!-- 营养汇总 -->
					<view class="nutrition-bar">
						<view class="nutrition-item">
							<text class="nutrition-value">{{ totalNutrition.calories }}</text>
							<text class="nutrition-label">千卡</text>
						</view>
						<view class="nutrition-item">
							<text class="nutrition-value">{{ totalNutrition.protein }}</text>
							<text class="nutrition-label">蛋白质</text>
						</view>
						<view class="nutrition-item">
							<text class="nutrition-value">{{ totalNutrition.carbs }}</text>
							<text class="nutrition-label">碳水</text>
						</view>
						<view class="nutrition-item">
							<text class="nutrition-value">{{ totalNutrition.fat }}</text>
							<text class="nutrition-label">脂肪</text>
						</view>
					</view>
				</view>

				<!-- 无规划提示 -->
				<view class="no-plan" v-if="!todayPlan">
					<view class="no-plan-illustration">
						<view class="plate-empty">
							<view class="plate-ring"></view>
							<view class="plate-inner"></view>
						</view>
						<view class="floating-food f1">
							<view class="food-dot"></view>
						</view>
						<view class="floating-food f2">
							<view class="food-dot"></view>
						</view>
						<view class="floating-food f3">
							<view class="food-dot"></view>
						</view>
					</view>
					<text class="no-plan-title">今天还没有饮食规划</text>
					<text class="no-plan-hint">创建一个规划，开启健康饮食之旅吧</text>
					<view class="create-plan-btn" @tap="createPlan">
						<text class="btn-text">创建规划</text>
						<view class="btn-shine"></view>
					</view>
				</view>

				<!-- 快捷入口 -->
				<view class="quick-section">
					<text class="section-title">快捷功能</text>
					<view class="quick-grid">
						<view class="quick-item" @tap="goToDishes">
							<view class="quick-icon-wrap">
								<icon-park name="dish" size="40" />
							</view>
							<text class="quick-name">菜品库</text>
							<text class="quick-count">{{ dishCount }} 道菜</text>
						</view>
						<view class="quick-item" @tap="createPlan">
							<view class="quick-icon-wrap add">
								<icon-park name="add" size="40" />
							</view>

							<text class="quick-name">新建规划</text>
							<text class="quick-desc">安排饮食</text>
						</view>
						<view class="quick-item" @tap="goToHistory">
							<view class="quick-icon-wrap">
								<icon-park name="calendar" size="40" />
							</view>
							<text class="quick-name">历史规划</text>
							<text class="quick-count">{{ planCount }} 个</text>
						</view>
					</view>
				</view>
			</view>
		</z-paging>

		<!-- 庆祝动画容器 -->
		<view class="celebration-container" v-if="showCelebration">
			<view class="confetti" v-for="i in 20" :key="i" :class="'c' + i"></view>
			<view class="celebration-text">
				<view class="celebration-icon">
					<view class="star s1"></view>
					<view class="star s2"></view>
					<view class="star s3"></view>
					<view class="star s4"></view>
				</view>
				<text class="celebration-title">太棒了!</text>
				<text class="celebration-msg">今天的三餐都安排好了</text>
			</view>
		</view>

		<!-- 连续打卡详情弹窗 -->
		<view class="streak-modal" v-if="showStreakModal" @tap="closeStreakModal">
			<view class="streak-modal-content" @tap.stop>
				<view class="streak-modal-header">
					<view class="streak-big-fire">
						<view class="flame flame-1"></view>
						<view class="flame flame-2"></view>
					</view>
					<text class="streak-modal-title">坚持的力量</text>
				</view>
				<view class="streak-stats">
					<view class="streak-stat-item">
						<text class="stat-value">{{ streak.current }}</text>
						<text class="stat-label">当前连续</text>
					</view>
					<view class="streak-stat-divider"></view>
					<view class="streak-stat-item">
						<text class="stat-value">{{ streak.longest }}</text>
						<text class="stat-label">最长记录</text>
					</view>
				</view>
				<text class="streak-encourage">{{ getStreakMessage() }}</text>
				<view class="streak-close-btn" @tap="closeStreakModal">
					<text>继续加油</text>
				</view>
			</view>
		</view>

		<!-- 首次使用引导 -->
		<view class="welcome-guide" v-if="showWelcomeGuide" @tap="closeWelcomeGuide">
			<view class="welcome-guide-content" @tap.stop>
				<view class="welcome-illustration">
					<view class="welcome-plate">
						<view class="welcome-plate-ring"></view>
						<view class="welcome-utensils">
							<view class="fork"></view>
							<view class="spoon"></view>
						</view>
					</view>
				</view>
				<text class="welcome-title">欢迎使用餐饮规划</text>
				<text class="welcome-desc">帮你轻松规划每周饮食，养成健康饮食习惯</text>
				<view class="welcome-steps">
					<view class="welcome-step">
						<view class="step-number">1</view>
						<text class="step-text">添加你常做的菜品</text>
					</view>
					<view class="welcome-step">
						<view class="step-number">2</view>
						<text class="step-text">创建饮食规划周期</text>
					</view>
					<view class="welcome-step">
						<view class="step-number">3</view>
						<text class="step-text">安排每日三餐菜单</text>
					</view>
				</view>
				<view class="welcome-actions">
					<view class="welcome-btn primary" @tap="goToDishesAndClose">
						<text class="welcome-btn-text">开始添加菜品</text>
					</view>
					<text class="welcome-skip" @tap="closeWelcomeGuide">先逛逛看</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import api from "@/api/index.js";
	import zPaging from "@/uni_modules/z-paging/components/z-paging/z-paging.vue";

	// 工具函数
	function formatDate(date) {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		return `${y}-${m}-${d}`;
	}

	function getGreeting() {
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 9) {
			return {
				text: "早上好",
				emoji: "🌅",
				message: "新的一天，从健康早餐开始",
			};
		} else if (hour >= 9 && hour < 12) {
			return {
				text: "上午好",
				emoji: "☀️",
				message: "上午时光，记得准备午餐哦",
			};
		} else if (hour >= 12 && hour < 14) {
			return {
				text: "中午好",
				emoji: "🍱",
				message: "午餐时间，好好享用美食",
			};
		} else if (hour >= 14 && hour < 18) {
			return {
				text: "下午好",
				emoji: "🌤️",
				message: "下午茶时光，来点水果吧",
			};
		} else if (hour >= 18 && hour < 22) {
			return {
				text: "晚上好",
				emoji: "🌙",
				message: "晚餐时间，吃得健康一点",
			};
		} else {
			return {
				text: "夜深了",
				emoji: "🌙",
				message: "早点休息，明天继续",
			};
		}
	}

	export default {
		components: {
			zPaging,
		},
		data() {
			return {
				dataList: [],
				todayPlan: null,
				dishes: [],
				plans: [],
				streak: {
					current: 0,
					longest: 0,
					lastDate: "",
					checkIns: [],
				},
				greeting: {
					text: "",
					emoji: "",
					message: "",
				},
				todayNutrition: {
					calories: 0,
					protein: 0,
					carbs: 0,
					fat: 0,
				},
				showCelebration: false,
				showStreakModal: false,
				hasShownCelebration: false,
				showWelcomeGuide: false,
				userInfo: null,
				isLoggedIn: false,
				isLoggingIn: true,
			};
		},
		computed: {
			todayDate() {
				const today = new Date();
				const weekDays = [
					"星期日",
					"星期一",
					"星期二",
					"星期三",
					"星期四",
					"星期五",
					"星期六",
				];
				return `${today.getMonth() + 1}月${today.getDate()}日 ${weekDays[today.getDay()]}`;
			},
			todayMeals() {
				if (!this.todayPlan)
					return {
						breakfast: [],
						lunch: [],
						dinner: [],
					};
				const today = formatDate(new Date());
				return (
					this.todayPlan.days[today] || {
						breakfast: [],
						lunch: [],
						dinner: [],
					}
				);
			},
			totalNutrition() {
				return this.todayNutrition;
			},
			dishCount() {
				return this.dishes.length;
			},
			planCount() {
				return this.plans.length;
			},
			progressPercent() {
				let complete = 0;
				if (this.todayMeals.breakfast.length > 0) complete++;
				if (this.todayMeals.lunch.length > 0) complete++;
				if (this.todayMeals.dinner.length > 0) complete++;
				return (complete / 3) * 100;
			},
			progressText() {
				const complete = Math.floor(this.progressPercent / 33.33);
				if (complete === 0) return "开始安排今日三餐吧";
				if (complete === 1) return "已安排 1/3，继续加油";
				if (complete === 2) return "已安排 2/3，还差一点";
				return "三餐已全部安排完成";
			},
			isAllMealsComplete() {
				return (
					this.todayMeals.breakfast.length > 0 &&
					this.todayMeals.lunch.length > 0 &&
					this.todayMeals.dinner.length > 0
				);
			},
		},
		onShow() {
			this.checkLoginState();
		},
		// 分享功能
		onShareAppMessage() {
			return {
				title: '三餐记食 - 健康饮食规划助手',
				path: '/pages/index/index'
			};
		},
		// 分享到朋友圈
		onShareTimeline() {
			return {
				title: '三餐记食 - 健康饮食规划助手'
			};
		},
		watch: {
			isAllMealsComplete(val) {
				if (val && !this.hasShownCelebration) {
					this.triggerCelebration();
				}
			},
		},
		methods: {
			// 检查登录状态
			async checkLoginState() {
				this.isLoggingIn = true;
				const token = uni.getStorageSync('token');

				if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
					try {
						// 尝试获取用户信息验证token有效性
						const res = await api.getUserInfo();
						if (res.data) {
							this.userInfo = res.data;
							uni.setStorageSync('userInfo', res.data);
							this.isLoggedIn = true;
							this.isLoggingIn = false;
							// 登录成功后加载数据
							this.loadData();
							return;
						}
					} catch (error) {
						console.log('Token无效，需要重新登录');
						uni.removeStorageSync('token');
						uni.removeStorageSync('userInfo');
					}
				}

				// 无有效token，尝试静默登录
				try {
					// #ifdef MP-WEIXIN
					const loginRes = await api.wxLogin();
					if (loginRes.data) {
						this.userInfo = loginRes.data.userInfo;
						this.isLoggedIn = true;
						this.isLoggingIn = false;
						this.loadData();
						return;
					}
					// #endif
				} catch (error) {
					console.error('自动登录失败:', error);
				}

				// 登录失败，显示登录按钮
				this.isLoggingIn = false;
				this.isLoggedIn = false;
			},

			// 手动登录
			async handleLogin() {
				this.isLoggingIn = true;
				try {
					// #ifdef MP-WEIXIN
					const res = await api.wxLogin();
					if (res.data) {
						this.userInfo = res.data.userInfo;
						this.isLoggedIn = true;
						this.isLoggingIn = false;
						this.loadData();
					}
					// #endif

					// #ifndef MP-WEIXIN
					uni.showToast({
						title: '请在微信小程序中使用',
						icon: 'none'
					});
					this.isLoggingIn = false;
					// #endif
				} catch (error) {
					console.error('登录失败:', error);
					uni.showToast({
						title: '登录失败，请重试',
						icon: 'none'
					});
					this.isLoggingIn = false;
				}
			},

			async loadData() {
				try {
					// 并行请求所有数据
					const [todayPlanRes, dishesRes, plansRes, streakRes] = await Promise.all([
						api.getTodayPlan(),
						api.getDishes(),
						api.getPlans(),
						api.getStreak(),
					]);

					this.todayPlan = todayPlanRes.data;
					this.dishes = dishesRes.data.list || [];
					this.plans = plansRes.data.list || [];
					this.streak = streakRes.data || {
						current: 0,
						longest: 0,
						lastDate: "",
						checkIns: [],
					};
					this.greeting = getGreeting();

					// 计算今日营养
					if (this.todayPlan && this.todayMeals) {
						const allDishIds = [
							...this.todayMeals.breakfast,
							...this.todayMeals.lunch,
							...this.todayMeals.dinner,
						].filter(Boolean);

						if (allDishIds.length > 0) {
							const nutritionRes = await api.calculateNutrition(allDishIds);
							this.todayNutrition = nutritionRes.data || {
								calories: 0,
								protein: 0,
								carbs: 0,
								fat: 0,
							};
						}
					}

					// 检查是否首次使用（无菜品且无规划）
					const hasSeenWelcome = uni.getStorageSync("hasSeenWelcome");
					if (
						!hasSeenWelcome &&
						this.dishes.length === 0 &&
						this.plans.length === 0
					) {
						this.showWelcomeGuide = true;
					}

					// 检查是否刚完成三餐
					if (this.isAllMealsComplete && !this.hasShownCelebration) {
						// 延迟一点显示，让用户先看到页面
						setTimeout(() => {
							this.triggerCelebration();
						}, 500);
					}
				} catch (error) {
					console.error("加载数据失败:", error);
					uni.showToast({
						title: "加载失败，请重试",
						icon: "none"
					});
				}
			},
			getDishName(id) {
				const dish = this.dishes.find((d) => d.id === id);
				return dish ? dish.name : "";
			},
			goToDetail() {
				if (this.todayPlan) {
					uni.navigateTo({
						url: "/pages/plan/detail?id=" + this.todayPlan.id,
					});
				}
			},
			goToDishes() {
				uni.navigateTo({
					url: "/pages/dishes/list",
				});
			},
			goToHistory() {
				uni.navigateTo({
					url: "/pages/plan/history",
				});
			},
			createPlan() {
				uni.navigateTo({
					url: "/pages/plan/create",
				});
			},
			async triggerCelebration() {
				this.showCelebration = true;
				this.hasShownCelebration = true;

				// 更新打卡记录
				try {
					const res = await api.checkIn();
					this.streak = res.data;
				} catch (error) {
					console.error("打卡失败:", error);
				}

				// 3秒后隐藏
				setTimeout(() => {
					this.showCelebration = false;
				}, 3000);
			},
			showStreakDetail() {
				this.showStreakModal = true;
			},
			closeStreakModal() {
				this.showStreakModal = false;
			},
			closeWelcomeGuide() {
				this.showWelcomeGuide = false;
				uni.setStorageSync("hasSeenWelcome", true);
			},
			goToDishesAndClose() {
				this.closeWelcomeGuide();
				uni.navigateTo({
					url: "/pages/dishes/list",
				});
			},
			getStreakMessage() {
				if (this.streak.current === 0) {
					return "开始你的健康之旅吧！";
				} else if (this.streak.current < 3) {
					return "好的开始！继续保持";
				} else if (this.streak.current < 7) {
					return "你已经连续打卡 " + this.streak.current + " 天了，真棒！";
				} else if (this.streak.current < 14) {
					return "太厉害了！坚持就是胜利";
				} else if (this.streak.current < 30) {
					return "你是健康饮食达人！";
				} else {
					return "传奇！你的坚持令人敬佩！";
				}
			},
			// z-paging 分页查询
			queryList(pageNo, pageSize) {
				// 这里可以处理分页逻辑，如果后端支持分页
				// 目前数据都在 onShow 中加载，这里可以留空或添加额外处理
				this.$refs.paging.complete([1]);
			},
			// 分享小程序
			handleShare() {
				// #ifdef MP-WEIXIN
				// 微信小程序使用 button 组件触发分享
				// 这里提示用户使用右上角分享
				uni.showToast({
					title: '点击右上角分享给好友',
					icon: 'none',
					duration: 2000
				});
				// #endif

				// #ifndef MP-WEIXIN
				uni.showToast({
					title: '请在微信小程序中使用',
					icon: 'none'
				});
				// #endif
			},
		},
	};
</script>

<style lang="scss">
	@import "@/styles/variables.scss";

	.containers {
		height: 100vh;
		display: flex;
		flex-direction: column;

	}

	.index-container {
		box-sizing: border-box;
		background: $color-bg-secondary;
		padding: $spacing-lg;
		padding-top: calc(var(--status-bar-height) + $spacing-lg);
	}

	/* ==================== 欢迎区域 ==================== */
	.welcome-section {
		padding: $spacing-lg 0;
	}

	.greeting-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: $spacing-sm;
	}

	.share-btn {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: $color-bg-primary;
		border-radius: 50%;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
		transition: all 0.2s;
		color: $color-text-secondary;
	}

	.share-btn:active {
		transform: scale(0.9);
		background: $color-bg-tertiary;
	}

	.greeting-text {
		display: flex;
		align-items: center;
	}

	.greeting-emoji {
		font-size: $font-size-2xl;
		margin-right: 12rpx;
	}

	.greeting-main {
		font-size: $font-size-2xl;
		font-weight: $font-weight-bold;
		color: $color-text-primary;
	}

	.welcome-subtitle {
		font-size: $font-size-base;
		color: $color-text-secondary;
		margin-top: 12rpx;
		display: block;
	}

	.today-date {
		font-size: $font-size-sm;
		color: $color-text-tertiary;
		margin-top: 8rpx;
		display: block;
	}

	/* 连续打卡徽章 */
	.streak-badge {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
		padding: 12rpx 20rpx;
		border-radius: 24rpx;
		gap: 6rpx;
		position: relative;
		overflow: hidden;
	}

	.streak-badge::before {
		content: "";
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg,
				transparent,
				rgba(255, 255, 255, 0.4),
				transparent);
		animation: shine 3s infinite;
	}

	@keyframes shine {
		0% {
			left: -100%;
		}

		50%,
		100% {
			left: 100%;
		}
	}

	.streak-fire {
		width: 32rpx;
		height: 40rpx;
		position: relative;
	}

	.flame {
		position: absolute;
		bottom: 0;
		width: 100%;
		background: linear-gradient(0deg, #ef4444 0%, #f59e0b 100%);
		border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
	}

	.flame-1 {
		height: 100%;
		width: 70%;
		left: 15%;
	}

	.flame-2 {
		height: 70%;
		width: 50%;
		left: 25%;
		opacity: 0.7;
	}

	.streak-count {
		font-size: $font-size-md;
		font-weight: $font-weight-bold;
		color: #d97706;
	}

	.streak-label {
		font-size: $font-size-xs;
		color: #d97706;
	}

	/* ==================== 今日规划 ==================== */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: $spacing-md;
	}

	.section-title {
		font-size: $font-size-md;
		font-weight: $font-weight-semibold;
		color: $color-text-primary;
	}

	.section-more {
		font-size: $font-size-sm;
		color: $color-primary;
		font-weight: $font-weight-medium;
		padding: 8rpx 16rpx;
		background: $color-primary-bg;
		border-radius: 8rpx;
		transition: all 0.2s;
	}

	.section-more:active {
		transform: scale(0.95);
		background: #dcfce7;
	}

	.today-section {
		background: $color-bg-primary;
		border-radius: $radius-xl;
		padding: $spacing-lg;
		margin-bottom: $spacing-lg;
		box-shadow: $shadow-md;
	}

	.today-meals {
		display: flex;
		gap: $spacing-md;
		margin-bottom: $spacing-md;
	}

	.meal-card {
		flex: 1;
		background: $color-bg-secondary;
		border-radius: $radius-lg;
		padding: $spacing-md;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		position: relative;
		overflow: hidden;
	}

	.meal-card:active {
		transform: scale(0.95);
	}

	.meal-card.complete {
		background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
	}

	.meal-card.complete::after {
		content: "";
		position: absolute;
		top: 0;
		right: 0;
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 0 40rpx 40rpx 0;
		border-color: transparent #22c55e transparent transparent;
	}

	.meal-header {
		display: flex;
		align-items: center;
		margin-bottom: $spacing-sm;
		position: relative;
		z-index: 1;
	}

	.meal-icon-wrap {
		width: 48rpx;
		height: 48rpx;
		border-radius: $radius-md;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: $spacing-xs;
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

	.meal-name {
		font-size: $font-size-base;
		font-weight: $font-weight-semibold;
		color: $color-text-primary;
		flex: 1;
	}

	.meal-check {
		width: 32rpx;
		height: 32rpx;
		background: $color-success;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.check-icon {
		width: 12rpx;
		height: 8rpx;
		border-left: 3rpx solid $color-bg-primary;
		border-bottom: 3rpx solid $color-bg-primary;
		transform: rotate(-45deg);
		margin-top: -4rpx;
	}

	.meal-dishes {
		display: flex;
		flex-direction: column;
		gap: $spacing-xs;
	}

	.dish-text {
		font-size: $font-size-sm;
		color: $color-text-secondary;
		line-height: $line-height-tight;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.empty-meal {
		font-size: $font-size-sm;
		color: $color-text-tertiary;
	}

	/* 进度条 */
	.progress-bar {
		display: flex;
		align-items: center;
		gap: $spacing-md;
		margin-bottom: $spacing-md;
	}

	.progress-track {
		flex: 1;
		height: 12rpx;
		background: $color-bg-tertiary;
		border-radius: $radius-sm;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg,
				$color-primary 0%,
				$color-primary-dark 100%);
		border-radius: $radius-sm;
		transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.progress-fill::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(90deg,
				transparent,
				rgba(255, 255, 255, 0.3),
				transparent);
		animation: progress-shine 2s infinite;
	}

	@keyframes progress-shine {
		0% {
			transform: translateX(-100%);
		}

		100% {
			transform: translateX(100%);
		}
	}

	.progress-text {
		font-size: $font-size-xs;
		color: $color-text-secondary;
		white-space: nowrap;
	}

	/* 营养汇总 */
	.nutrition-bar {
		display: flex;
		justify-content: space-around;
		padding-top: $spacing-md;
		border-top: 1rpx solid $color-divider;
	}

	.nutrition-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.nutrition-icon-wrap {
		margin-bottom: $spacing-xs;
	}

	.nutrition-value {
		font-size: $font-size-xl;
		font-weight: $font-weight-bold;
		color: $color-primary;
		font-variant-numeric: tabular-nums;
	}

	.nutrition-label {
		font-size: $font-size-xs;
		color: $color-text-secondary;
		margin-top: 4rpx;
	}

	/* ==================== 无规划 ==================== */
	.no-plan {
		background: $color-bg-primary;
		border-radius: $radius-xl;
		padding: $spacing-2xl $spacing-lg;
		text-align: center;
		margin-bottom: $spacing-2xl;
		box-shadow: $shadow-md;
	}

	.no-plan-illustration {
		width: 160rpx;
		height: 160rpx;
		margin: 0 auto 32rpx;
		position: relative;
	}

	.plate-empty {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.plate-ring {
		width: 100%;
		height: 100%;
		border: 8rpx dashed #d1d5db;
		border-radius: 50%;
		animation: plate-rotate 20s linear infinite;
	}

	@keyframes plate-rotate {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	.plate-inner {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 60%;
		height: 60%;
		border: 4rpx dashed #e5e7eb;
		border-radius: 50%;
		animation: plate-rotate 15s linear infinite reverse;
	}

	.floating-food {
		position: absolute;
		animation: float 3s ease-in-out infinite;
	}

	.floating-food.f1 {
		top: 0;
		left: 20%;
		animation-delay: 0s;
	}

	.floating-food.f2 {
		top: 30%;
		right: -10%;
		animation-delay: 0.5s;
	}

	.floating-food.f3 {
		bottom: 10%;
		left: -10%;
		animation-delay: 1s;
	}

	@keyframes float {

		0%,
		100% {
			transform: translateY(0);
		}

		50% {
			transform: translateY(-16rpx);
		}
	}

	.food-dot {
		width: 24rpx;
		height: 24rpx;
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		border-radius: 50%;
		box-shadow: 0 4rpx 12rpx rgba(34, 197, 94, 0.3);
	}

	.no-plan-title {
		font-size: $font-size-md;
		color: $color-text-primary;
		font-weight: $font-weight-semibold;
		display: block;
		margin-bottom: 12rpx;
	}

	.no-plan-hint {
		font-size: $font-size-sm;
		color: $color-text-secondary;
		display: block;
		margin-bottom: $spacing-lg;
	}

	.create-plan-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 24rpx 64rpx;
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		border-radius: 32rpx;
		position: relative;
		overflow: hidden;
		box-shadow: 0 8rpx 24rpx rgba(34, 197, 94, 0.4);
		transition: all 0.2s;
	}

	.create-plan-btn:active {
		transform: scale(0.95);
		box-shadow: 0 4rpx 12rpx rgba(34, 197, 94, 0.4);
	}

	.btn-text {
		font-size: $font-size-md;
		font-weight: $font-weight-semibold;
		color: $color-bg-primary;
		position: relative;
		z-index: 1;
	}

	.btn-shine {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg,
				transparent,
				rgba(255, 255, 255, 0.3),
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

	/* ==================== 快捷入口 ==================== */
	.quick-section {
		margin-top: 16rpx;
	}

	.quick-grid {
		display: flex;
		gap: 20rpx;
		margin-top: 20rpx;
	}

	.quick-item {
		flex: 1;
		background: #ffffff;
		border-radius: 20rpx;
		padding: 32rpx 20rpx;
		text-align: center;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		transition: all 0.2s;
	}

	.quick-item:active {
		transform: scale(0.96);
		background: #f9fafb;
	}

	.quick-icon-wrap {
		width: 80rpx;
		height: 80rpx;
		margin: 0 auto 16rpx;
		border-radius: 20rpx;
		background: #f0fdf4;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #22c55e;
	}

	.quick-icon-wrap.add {
		background: #f0fdf4;
		color: #ffffff;
	}

	.quick-name {
		font-size: $font-size-base;
		color: $color-text-primary;
		font-weight: $font-weight-medium;
		display: block;
		margin-bottom: 8rpx;
	}

	.quick-count,
	.quick-desc {
		font-size: $font-size-sm;
		color: $color-text-secondary;
	}

	/* ==================== 庆祝动画 ==================== */
	.celebration-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fade-in 0.3s;
	}

	@keyframes fade-in {
		0% {
			opacity: 0;
		}

		100% {
			opacity: 1;
		}
	}

	.confetti {
		position: absolute;
		width: 16rpx;
		height: 16rpx;
		background: #22c55e;
		animation: confetti-fall 3s ease-out forwards;
	}

	.confetti.c1 {
		left: 10%;
		animation-delay: 0s;
		background: #22c55e;
	}

	.confetti.c2 {
		left: 15%;
		animation-delay: 0.1s;
		background: #f59e0b;
	}

	.confetti.c3 {
		left: 20%;
		animation-delay: 0.2s;
		background: #3b82f6;
	}

	.confetti.c4 {
		left: 25%;
		animation-delay: 0.15s;
		background: #ec4899;
	}

	.confetti.c5 {
		left: 35%;
		animation-delay: 0.05s;
		background: #22c55e;
	}

	.confetti.c6 {
		left: 45%;
		animation-delay: 0.25s;
		background: #8b5cf6;
	}

	.confetti.c7 {
		left: 55%;
		animation-delay: 0.1s;
		background: #f59e0b;
	}

	.confetti.c8 {
		left: 65%;
		animation-delay: 0.2s;
		background: #22c55e;
	}

	.confetti.c9 {
		left: 70%;
		animation-delay: 0.15s;
		background: #3b82f6;
	}

	.confetti.c10 {
		left: 75%;
		animation-delay: 0s;
		background: #ec4899;
	}

	.confetti.c11 {
		left: 80%;
		animation-delay: 0.1s;
		background: #22c55e;
	}

	.confetti.c12 {
		left: 85%;
		animation-delay: 0.2s;
		background: #f59e0b;
	}

	.confetti.c13 {
		left: 12%;
		animation-delay: 0.25s;
		background: #8b5cf6;
	}

	.confetti.c14 {
		left: 22%;
		animation-delay: 0.05s;
		background: #22c55e;
	}

	.confetti.c15 {
		left: 42%;
		animation-delay: 0.15s;
		background: #3b82f6;
	}

	.confetti.c16 {
		left: 52%;
		animation-delay: 0s;
		background: #ec4899;
	}

	.confetti.c17 {
		left: 62%;
		animation-delay: 0.1s;
		background: #22c55e;
	}

	.confetti.c18 {
		left: 72%;
		animation-delay: 0.2s;
		background: #f59e0b;
	}

	.confetti.c19 {
		left: 82%;
		animation-delay: 0.05s;
		background: #8b5cf6;
	}

	.confetti.c20 {
		left: 92%;
		animation-delay: 0.15s;
		background: #22c55e;
	}

	@keyframes confetti-fall {
		0% {
			top: -20rpx;
			transform: rotate(0deg) scale(1);
			opacity: 1;
		}

		100% {
			top: 100%;
			transform: rotate(720deg) scale(0.5);
			opacity: 0;
		}
	}

	.celebration-text {
		display: flex;
		flex-direction: column;
		align-items: center;
		animation: celebration-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	@keyframes celebration-pop {
		0% {
			transform: scale(0);
			opacity: 0;
		}

		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.celebration-icon {
		width: 120rpx;
		height: 120rpx;
		margin-bottom: 16rpx;
		position: relative;
	}

	.star {
		position: absolute;
		width: 0;
		height: 0;
		border-left: 20rpx solid transparent;
		border-right: 20rpx solid transparent;
		border-bottom: 40rpx solid #ffd700;
	}

	.star::after {
		content: "";
		position: absolute;
		top: 12rpx;
		left: -20rpx;
		width: 0;
		height: 0;
		border-left: 20rpx solid transparent;
		border-right: 20rpx solid transparent;
		border-top: 40rpx solid #ffd700;
	}

	.star.s1 {
		top: 20rpx;
		left: 40rpx;
		transform: scale(0.8);
		animation: star-pulse 1s ease-in-out infinite;
	}

	.star.s2 {
		top: 10rpx;
		left: 70rpx;
		transform: scale(0.6);
		animation: star-pulse 1s ease-in-out 0.2s infinite;
	}

	.star.s3 {
		top: 50rpx;
		left: 20rpx;
		transform: scale(0.5);
		animation: star-pulse 1s ease-in-out 0.4s infinite;
	}

	.star.s4 {
		top: 60rpx;
		left: 60rpx;
		transform: scale(0.7);
		animation: star-pulse 1s ease-in-out 0.1s infinite;
	}

	@keyframes star-pulse {

		0%,
		100% {
			opacity: 1;
			transform: scale(var(--star-scale, 0.7));
		}

		50% {
			opacity: 0.7;
			transform: scale(calc(var(--star-scale, 0.7) * 1.1));
		}
	}

	.celebration-title {
		font-size: $font-size-2xl;
		font-weight: $font-weight-bold;
		color: $color-bg-primary;
		margin-bottom: 12rpx;
	}

	.celebration-msg {
		font-size: $font-size-base;
		color: rgba(255, 255, 255, 0.9);
	}

	/* ==================== 连续打卡弹窗 ==================== */
	.streak-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.streak-modal-content {
		width: 80%;
		background: #ffffff;
		border-radius: 32rpx;
		padding: 48rpx 32rpx;
		text-align: center;
		animation: modal-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	@keyframes modal-pop {
		0% {
			transform: scale(0.8);
			opacity: 0;
		}

		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.streak-modal-header {
		margin-bottom: 32rpx;
	}

	.streak-big-fire {
		width: 80rpx;
		height: 100rpx;
		margin: 0 auto 16rpx;
		position: relative;
	}

	.streak-big-fire .flame-1 {
		height: 100%;
		width: 70%;
		left: 15%;
	}

	.streak-big-fire .flame-2 {
		height: 70%;
		width: 50%;
		left: 25%;
	}

	.streak-modal-title {
		font-size: $font-size-lg;
		font-weight: $font-weight-bold;
		color: $color-text-primary;
	}

	.streak-stats {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 40rpx;
		padding: $spacing-md 0;
		border-top: 1rpx solid $color-divider;
		border-bottom: 1rpx solid $color-divider;
		margin-bottom: $spacing-md;
	}

	.streak-stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.streak-stat-item .stat-value {
		font-size: $font-size-2xl;
		font-weight: $font-weight-bold;
		color: $color-warning;
		font-variant-numeric: tabular-nums;
	}

	.streak-stat-item .stat-label {
		font-size: $font-size-sm;
		color: $color-text-secondary;
		margin-top: 8rpx;
	}

	.streak-stat-divider {
		width: 2rpx;
		height: 60rpx;
		background: #e5e7eb;
	}

	.streak-encourage {
		font-size: $font-size-base;
		color: #374151;
		margin-bottom: $spacing-lg;
		line-height: $line-height-normal;
	}

	.streak-close-btn {
		padding: 20rpx 48rpx;
		background: linear-gradient(135deg,
				$color-primary 0%,
				$color-primary-dark 100%);
		border-radius: 24rpx;
		display: inline-block;
	}

	.streak-close-btn text {
		color: $color-bg-primary;
		font-size: $font-size-base;
		font-weight: $font-weight-medium;
	}

	/* ==================== 首次使用引导 ==================== */
	.welcome-guide {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fade-in 0.3s;
	}

	.welcome-guide-content {
		width: 85%;
		background: $color-bg-primary;
		border-radius: 32rpx;
		padding: 48rpx 32rpx;
		text-align: center;
		animation: welcome-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	@keyframes welcome-pop {
		0% {
			transform: scale(0.8) translateY(40rpx);
			opacity: 0;
		}

		100% {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
	}

	.welcome-illustration {
		margin-bottom: 32rpx;
	}

	.welcome-plate {
		width: 160rpx;
		height: 160rpx;
		margin: 0 auto;
		position: relative;
	}

	.welcome-plate-ring {
		width: 100%;
		height: 100%;
		border: 8rpx solid $color-primary;
		border-radius: 50%;
		animation: plate-pulse 2s ease-in-out infinite;
	}

	@keyframes plate-pulse {

		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}

		50% {
			transform: scale(1.05);
			opacity: 0.8;
		}
	}

	.welcome-utensils {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		gap: 16rpx;
	}

	.fork,
	.spoon {
		width: 8rpx;
		height: 60rpx;
		background: $color-primary;
		border-radius: 4rpx;
		position: relative;
	}

	.fork::before {
		content: "";
		position: absolute;
		top: -16rpx;
		left: -8rpx;
		width: 24rpx;
		height: 20rpx;
		border: 4rpx solid $color-primary;
		border-bottom: none;
		border-radius: 8rpx 8rpx 0 0;
		background: transparent;
	}

	.spoon::before {
		content: "";
		position: absolute;
		top: -20rpx;
		left: -8rpx;
		width: 24rpx;
		height: 24rpx;
		background: $color-primary;
		border-radius: 50%;
	}

	.welcome-title {
		font-size: $font-size-xl;
		font-weight: $font-weight-bold;
		color: $color-text-primary;
		display: block;
		margin-bottom: 12rpx;
	}

	.welcome-desc {
		font-size: $font-size-sm;
		color: $color-text-secondary;
		display: block;
		margin-bottom: 40rpx;
	}

	.welcome-steps {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		margin-bottom: 40rpx;
	}

	.welcome-step {
		display: flex;
		align-items: center;
		padding: 16rpx 20rpx;
		background: $color-bg-tertiary;
		border-radius: $radius-lg;
	}

	.step-number {
		width: 44rpx;
		height: 44rpx;
		background: $color-primary;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: $font-size-base;
		font-weight: $font-weight-bold;
		color: $color-bg-primary;
		margin-right: 16rpx;
	}

	.step-text {
		font-size: $font-size-base;
		color: $color-text-primary;
	}

	.welcome-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
	}

	.welcome-btn {
		width: 100%;
		padding: 24rpx 0;
		border-radius: $radius-lg;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.welcome-btn.primary {
		background: linear-gradient(135deg,
				$color-primary 0%,
				$color-primary-dark 100%);
		box-shadow: $shadow-primary;
	}

	.welcome-btn.primary .welcome-btn-text {
		color: $color-bg-primary;
		font-weight: $font-weight-semibold;
	}

	.welcome-btn-text {
		font-size: $font-size-md;
	}

	.welcome-skip {
		font-size: $font-size-sm;
		color: $color-text-tertiary;
		padding: 12rpx 24rpx;
	}

	/* ==================== 登录遮罩 ==================== */
	.login-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
	}

	.login-content {
		width: 80%;
		text-align: center;
		padding: 48rpx 32rpx;
	}

	.login-illustration {
		margin-bottom: 40rpx;
	}

	.login-plate {
		width: 160rpx;
		height: 160rpx;
		margin: 0 auto;
		border: 8rpx solid $color-primary;
		border-radius: 50%;
		position: relative;
		animation: login-pulse 2s ease-in-out infinite;
	}

	.login-plate::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 60%;
		height: 60%;
		border: 4rpx solid $color-primary;
		border-radius: 50%;
		opacity: 0.5;
	}

	@keyframes login-pulse {

		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}

		50% {
			transform: scale(1.05);
			opacity: 0.8;
		}
	}

	.login-title {
		font-size: $font-size-2xl;
		font-weight: $font-weight-bold;
		color: $color-text-primary;
		display: block;
		margin-bottom: 16rpx;
	}

	.login-desc {
		font-size: $font-size-base;
		color: $color-text-secondary;
		display: block;
		margin-bottom: 40rpx;
	}

	.login-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 28rpx 80rpx;
		background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
		border-radius: 48rpx;
		box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
		transition: all 0.2s;
	}

	.login-btn:active {
		transform: scale(0.95);
		box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.3);
	}

	.login-btn-text {
		font-size: $font-size-md;
		font-weight: $font-weight-semibold;
		color: #ffffff;
	}

	.login-loading {
		display: flex;
		justify-content: center;
		padding: 20rpx 0;
	}

	.loading-spinner {
		width: 48rpx;
		height: 48rpx;
		border: 4rpx solid $color-bg-tertiary;
		border-top-color: $color-primary;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}
</style>