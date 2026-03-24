<template>
  <div class="eat-page">
    <header class="top-nav">
      <div class="nav-container">
        <div class="logo">
          <div class="logo-icon">
            <el-icon size="28"><HomeFilled /></el-icon>
          </div>
          <span class="logo-text">饮食中心</span>
        </div>
        <nav class="nav-menu">
          <ul class="nav-list">
            <li class="nav-item">
              <a href="/home" class="nav-link">首页</a>
            </li>
            <li class="nav-item">
              <a href="/action" class="nav-link">训练库</a>
            </li>
            <li class="nav-item active">
              <a href="/eat" class="nav-link">饮食指南</a>
            </li>
            <li class="nav-item">
              <a href="/data" class="nav-link">数据中心</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
    
    <main class="main-content">
      <div class="content-container">
        <h1>饮食指南</h1>
        <p>常见食物营养成分表（每100g）</p>

        <!-- 分类筛选 -->
        <div class="category-filter" style="margin: 20px 0;">
          <el-tabs v-model="activeCategory" @tab-click="handleCategoryChange">
            <el-tab-pane label="全部" value="all">全部</el-tab-pane>
            <el-tab-pane v-for="category in categories" :key="category.value" :label="category.label" :value="category.value">
              {{ category.label }}
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 食物营养列表 -->
        <div class="food-list" style="margin-top: 20px;">
          <div 
            v-for="item in filteredFoodItems" 
            :key="item.id" 
            class="food-card"
          >
            <h3>{{ item.name }}</h3>
            <div class="nutrients">
              <span>🔥 热量：{{ item.calories_per_100g }} kcal</span>
              <span>💪 蛋白质：{{ item.protein_per_100g }} g</span>
              <span>🥩 脂肪：{{ item.fat_per_100g }} g</span>
              <span>🍞 碳水：{{ item.carbs_per_100g }} g</span>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <footer class="bottom-nav">
      <div class="nav-items">
        <div class="nav-item" @click="navigateTo('/home')">
          <div class="nav-icon">
            <el-icon><HomeFilled /></el-icon>
          </div>
          <span class="nav-text">首页</span>
        </div>
        <div class="nav-item" @click="navigateTo('/action')">
          <div class="nav-icon">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <span class="nav-text">训练</span>
        </div>
        <div class="nav-item active">
          <div class="nav-icon">
            <el-icon><Food /></el-icon>
          </div>
          <span class="nav-text">饮食</span>
        </div>
        <div class="nav-item">
          <div class="nav-icon">
            <el-icon><User /></el-icon>
          </div>
          <span class="nav-text">我的</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { navigateTo } from "nuxt/app";
import {
  HomeFilled,
  VideoPlay,
  Food,
  User
} from "@element-plus/icons-vue";

// ✅ 定义食物类型（修复 TS 报错）
interface FoodItem {
  id: number;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
}

// 食物列表（指定类型，修复报错）
const foodItems = ref<FoodItem[]>([]);

// 分类（和数据库一致）
const categories = ref([
  { label: "主食", value: "主食" },
  { label: "蔬菜", value: "蔬菜" },
  { label: "水果", value: "水果" },
  { label: "肉类", value: "肉类" },
  { label: "蛋类", value: "蛋类" },
  { label: "乳制品", value: "乳制品" },
  { label: "豆制品", value: "豆制品" },
  { label: "坚果", value: "坚果" },
]);

const activeCategory = ref("all");

// 过滤
const filteredFoodItems = computed(() => {
  if (activeCategory.value === "all") return foodItems.value;
  return foodItems.value.filter(item => item.category === activeCategory.value);
});

function handleCategoryChange(tab: any) {
  activeCategory.value = tab.props.value;
}

// =============================================
// 👇 关键修复：正确获取数据 + 无 TS 错误
// =============================================
onMounted(async () => {
  try {
    const res = await $fetch("/api/food-items");
    // ✅ 正确写法：后端返回 { code, data, message }
    foodItems.value = (res as any).data || [];
  } catch (err) {
    console.error("获取食物失败", err);
  }
});
</script>

<style scoped lang="scss">
.eat-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.top-nav {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-icon {
  color: #409eff;
}
.logo-text {
  font-size: 18px;
  font-weight: 600;
}

.nav-list {
  display: flex;
  gap: 32px;
  list-style: none;
}
.nav-link {
  text-decoration: none;
  color: #606266;
}
.nav-link:hover,
.nav-item.active .nav-link {
  color: #409eff;
}

.main-content {
  flex: 1;
  padding: 24px 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.food-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 20px;
}
.food-card {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 10px;
}
.food-card h3 {
  margin: 0 0 10px;
  font-size: 16px;
}
.nutrients {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.bottom-nav {
  background: #fff;
  border-top: 1px solid #ebeef5;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
.nav-items {
  display: flex;
  justify-content: space-around;
  height: 56px;
}
.bottom-nav .nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}
.bottom-nav .nav-item.active {
  color: #409eff;
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  .main-content {
    padding-bottom: 72px;
  }
}
</style>