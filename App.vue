<script>
export default {
	onLaunch: function() {
		console.log('App Launch')
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	}
}
</script>

<style lang="scss">
	@import "@/styles/variables.scss";

	/* 全局字体设置 */
	page {
		font-family: $font-family-base;
		font-size: $font-size-base;
		line-height: $line-height-normal;
		color: $color-text-primary;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-rendering: optimizeLegibility;
	}

	/* 标题层级 */
	.heading-display {
		font-size: $font-size-3xl;
		font-weight: $font-weight-bold;
		line-height: $line-height-tight;
		letter-spacing: $letter-spacing-tight;
	}

	.heading-lg {
		font-size: $font-size-2xl;
		font-weight: $font-weight-bold;
		line-height: $line-height-tight;
	}

	.heading-md {
		font-size: $font-size-xl;
		font-weight: $font-weight-bold;
		line-height: $line-height-tight;
	}

	.heading-sm {
		font-size: $font-size-lg;
		font-weight: $font-weight-semibold;
		line-height: $line-height-tight;
	}

	/* 正文层级 */
	.body-lg {
		font-size: $font-size-md;
		font-weight: $font-weight-normal;
		line-height: $line-height-normal;
	}

	.body-base {
		font-size: $font-size-base;
		font-weight: $font-weight-normal;
		line-height: $line-height-normal;
	}

	.body-sm {
		font-size: $font-size-sm;
		font-weight: $font-weight-normal;
		line-height: $line-height-normal;
	}

	/* 标签层级 */
	.label {
		font-size: $font-size-sm;
		font-weight: $font-weight-medium;
		line-height: $line-height-normal;
		letter-spacing: $letter-spacing-wide;
	}

	.caption {
		font-size: $font-size-xs;
		font-weight: $font-weight-normal;
		line-height: $line-height-normal;
		color: $color-text-tertiary;
	}

	/* 数字展示 - 使用等宽数字 */
	.number-display {
		font-variant-numeric: tabular-nums;
		font-feature-settings: "tnum" 1;
	}
</style>
