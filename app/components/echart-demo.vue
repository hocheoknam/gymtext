<!-- components/EChartDemo.vue -->
<template>
  <div
    ref="chartRef"
    style="
      width: 100%;
      height: 400px;
      border: 1px dashed #ccc; /* 可视化容器边界 */
    "
  ></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from "vue";

const chartRef = ref(null);
let myChart = null;

onMounted(async () => {
  // 等待 DOM 真正就绪
  await nextTick();

  // 调试：打印 ref 是否有值
  console.log("[EChart] chartRef.value:", chartRef.value);

  // 检查 ECharts 是否加载
  if (!window.echarts) {
    console.error("❌ ECharts not loaded! Check CDN.");
    return;
  }

  // 检查 DOM 元素是否存在
  if (!chartRef.value) {
    console.error("❌ chartRef is null!");
    return;
  }

  // 获取元素尺寸（关键！）
  const rect = chartRef.value.getBoundingClientRect();
  console.log("[EChart] Container size:", rect.width, "x", rect.height);

  if (rect.width <= 0 || rect.height <= 0) {
    console.warn("⚠️ Chart container has no size!");
  }

  // 初始化图表
  try {
    myChart = window.echarts.init(chartRef.value);
    console.log("✅ ECharts initialized");

    const weightData = [
      { date: "2025-12-01", weight: 72.5 },
      { date: "2025-12-05", weight: 72.0 },
      { date: "2025-12-10", weight: 71.3 },
      { date: "2025-12-15", weight: 70.8 },
      { date: "2025-12-20", weight: 70.2 },
    ];

    myChart.setOption({
      title: { text: "体重变化趋势", left: "center" },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: weightData.map((d) => d.date),
      },
      yAxis: {
        type: "value",
        name: "体重 (kg)",
      },
      series: [
        {
          type: "line",
          data: weightData.map((d) => d.weight),
          smooth: true,
        },
      ],
    });
  } catch (err) {
    console.error("💥 ECharts init error:", err);
  }
});

onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose();
    console.log("🧹 ECharts disposed");
  }
});
</script>
