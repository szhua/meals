<template>
  <image
    class="icon-park"
    :style="{ width: sizeNumber + 'rpx', height: sizeNumber + 'rpx' }"
    :src="iconSrc"
    mode="aspectFit"
  />
</template>

<script>
import { defineComponent, computed } from "vue";
import {
  SunOne,
  Sun,
  Moon,
  Fire,
  Rice,
  Add,
  RadishOne,
  Close,
  Calendar,
  Search,
  CameraOne,
  Chicken,
  Info,
  BowlOne,
  AvocadoOne,
  Vegetables,
  Candy,
  Delete,
} from "@icon-park/svg";

// 默认颜色映射
const defaultColorMap = {
  breakfast: "#F59E0B",
  rice: "#6B7280",
  lunch: "#3B82F6",
  dinner: "#8B5CF6",
  fire: "#EF4444",
  dish: "#35a75a",
  calendar: "#22C55E",
  search: "#6B7280",
  camera: "#6B7280",
  add: "#3B82F6",
  close: "#6B7280",
  delete: "#EF4444",
  meat: "#EF4444",
  vegetable: "#22C55E",
  soup: "#F59E0B",
  fruit: "#22C55E",
  other: "#6B7280",
};

// 图标映射
const iconMap = {
  breakfast: SunOne,
  lunch: Sun,
  dinner: Moon,
  fire: Fire,
  rice: Rice,
  add: Add,
  dish: RadishOne,
  close: Close,
  calendar: Calendar,
  search: Search,
  camera: CameraOne,
  meat: Chicken,
  soup: BowlOne,
  fruit: AvocadoOne,
  vegetable: Vegetables,
  other: Candy,
  delete: Delete,
};

// 将 SVG 字符串转换为 base64 data URI
function svgToBase64(svgString) {
  // 编码 SVG 字符串
  const encoded = encodeURIComponent(svgString)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml,${encoded}`;
}

export default defineComponent({
  name: "IconPark",
  props: {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: [Number, String],
      default: 32,
    },
    color: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const sizeNumber = computed(() => {
      if (typeof props.size === "number") return props.size;
      return parseInt(props.size, 10) || 32;
    });

    const iconName = computed(() => {
      return props.name.toLowerCase();
    });

    const iconColor = computed(() => {
      if (props.color) return props.color;
      return defaultColorMap[props.name.toLowerCase()] || "#6B7280";
    });

    const iconSrc = computed(() => {
      const iconFn = iconMap[iconName.value] || Info;
      // @icon-park/svg 返回 SVG 字符串
      const svgString = iconFn({
        size: sizeNumber.value,
        fill: iconColor.value,
      });
      return svgToBase64(svgString);
    });

    return {
      sizeNumber,
      iconName,
      iconColor,
      iconSrc,
    };
  },
});
</script>

<style lang="scss" scoped>
.icon-park {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
</style>