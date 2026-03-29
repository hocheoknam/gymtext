<template>
  <div class="eat-page">
    <!-- 返回首页链接 -->
    <div class="back-to-home">
      <router-link to="/home" style="color: #409EFF; text-decoration: none;">
        <el-icon><ArrowLeft /></el-icon>
        <span style="margin-left: 5px;">返回首页</span>
      </router-link>
    </div>
    <header class="top-nav">
      <div class="nav-container">
        <div class="logo">
          <el-icon size="28"><HomeFilled /></el-icon>
          <span class="logo-text">饮食中心</span>
        </div>
        <nav class="nav-menu">
          <ul class="nav-list">
            <li class="nav-item"><a href="/home" class="nav-link">首页</a></li>
            <li class="nav-item"><a href="/action" class="nav-link">训练库</a></li>
            <li class="nav-item active"><a href="/eat" class="nav-link">饮食指南</a></li>
            <li class="nav-item"><a href="/data" class="nav-link">数据中心</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <div class="content-container">
        <h1>饮食指南</h1>
        <p>常见食物营养成分表（每100g）</p>

        <!-- 分类筛选：现在由数据动态生成 -->
        <div class="category-filter" style="margin:20px 0;">
          <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
            <!-- 全部选项 -->
            <el-tab-pane label="全部" name="all">全部</el-tab-pane>
            
            <!-- 动态生成的分类选项 -->
            <el-tab-pane 
              v-for="cat in categories" 
              :key="cat.value" 
              :label="cat.label" 
              :name="cat.value" 
            >
              {{ cat.label }}
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="food-list" style="margin-top:20px;">
          <!-- 食物卡片列表 -->
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

          <!-- 空状态提示 -->
          <div v-if="foodItems.length > 0 && filteredFoodItems.length === 0" class="empty-tip">
            该分类下暂无食物数据
          </div>
          
          <!-- 如果连总数据都没有 -->
          <div v-if="foodItems.length === 0" class="empty-tip">
            正在加载数据或暂无数据...
          </div>
        </div>
      </div>
    </main>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { navigateTo } from "nuxt/app";
import { HomeFilled, VideoPlay, Food, User, ArrowLeft } from "@element-plus/icons-vue";
import type { TabPaneName } from 'element-plus';

// 定义食物数据结构
interface FoodItem {
  id: number;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
}

// 定义分类选项结构
interface CategoryOption {
  label: string;
  value: string;
}

const foodItems = ref<FoodItem[]>([]);
// 初始化为空数组，等待数据加载后动态填充
const categories = ref<CategoryOption[]>([]);

// 使用 string 类型以兼容 el-tabs 的 name 属性
const activeCategory = ref<string>("all");

// 核心修改：计算属性增加容错处理 (trim)
const filteredFoodItems = computed(() => {
  if (activeCategory.value === "all") {
    return foodItems.value;
  }

  const targetCategory = activeCategory.value.trim();

  return foodItems.value.filter(item => {
    // 确保 item.category 存在，并去除首尾空格后进行比较
    const itemCategory = (item.category || "").trim();
    return itemCategory === targetCategory;
  });
});

const handleCategoryChange = (val: TabPaneName) => {
  // TabPaneName 可能是 string 或 number，这里统一转为 string 赋值
  activeCategory.value = String(val);
  console.log("切换分类为:", val);
};

onMounted(async () => {
  try {
    // 获取数据
    const res: any = await $fetch("/api/food-items");
    const data: FoodItem[] = (res.data || []) as FoodItem[];
    
    if (!data || data.length === 0) {
      foodItems.value = [];
      return;
    }

    foodItems.value = data;

    // 【关键步骤】动态提取分类
    // 使用 Set 自动去重
    const categorySet = new Set<string>();
    
    data.forEach(item => {
      if (item.category) {
        // 存入时去除空格，保证一致性
        categorySet.add(item.category.trim());
      }
    });

    // 将 Set 转换为数组并映射为 el-tab-pane 需要的格式
    categories.value = Array.from(categorySet).map(cat => ({
      label: cat,
      value: cat
    }));

    // 可选：按拼音或字母顺序排序分类，让界面更整洁
    // categories.value.sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN'));

  } catch (err) {
    console.error("获取食物数据失败", err);
    // 这里可以添加一个用户友好的错误提示，比如使用 ElMessage
  }
});
</script>

<style scoped lang="scss">
.eat-page { min-height: 100vh; background: #f5f7fa; display: flex; flex-direction: column; }
.top-nav { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top:0; z-index:100; }
.nav-container { max-width:1200px; margin:0 auto; padding:0 20px; height:60px; display:flex; align-items:center; justify-content:space-between; }
.logo { display:flex; align-items:center; gap:8px; }
.logo-text { font-size:18px; font-weight:600; }
.nav-list { display:flex; gap:32px; list-style:none; }
.nav-link { text-decoration:none; color:#606266; }
.nav-link:hover, .nav-item.active .nav-link { color:#409eff; }

.main-content { flex:1; padding:24px 0; }
.content-container { max-width:1200px; margin:0 auto; padding:40px; background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.08); }

.food-list { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px; margin-top:20px; }
.food-card { padding:16px; border:1px solid #eee; border-radius:10px; transition: transform 0.2s; }
.food-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.food-card h3 { margin:0 0 10px; font-size:16px; color:#303133; }
.nutrients { display:flex; flex-direction:column; gap:4px; font-size:14px; color:#666; }
.empty-tip { grid-column: 1 / -1; text-align: center; padding:40px 0; color:#909399; font-size: 16px; }



@media (max-width:768px) {
  .nav-menu { display:none; }
  .main-content { padding-bottom:24px; }
  .content-container { padding: 20px; }
}

/* 返回首页链接样式 */
.back-to-home {
  margin: 20px;
  padding: 10px;
  border-radius: 8px;
  background-color: #f0f9ff;
  display: inline-block;
  transition: all 0.3s ease;
}

.back-to-home:hover {
  background-color: #e6f7ff;
  transform: translateX(-2px);
}

.back-to-home a {
  display: flex;
  align-items: center;
  color: #409EFF !important;
  font-weight: bold;
  text-decoration: none !important;
}

.back-to-home a:hover {
  color: #66b1ff !important;
}

.back-to-home .el-icon {
  font-size: 18px;
  margin-right: 5px;
}

.back-to-home {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>