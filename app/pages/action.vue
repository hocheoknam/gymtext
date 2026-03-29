<template>
  <div class="action-page">
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
          <div class="logo-icon">
            <el-icon size="28"><HomeFilled /></el-icon>
          </div>
          <span class="logo-text">训练中心</span>
        </div>
        <nav class="nav-menu">
          <ul class="nav-list">
            <li class="nav-item">
              <a href="/home" class="nav-link">首页</a>
            </li>
            <li class="nav-item active">
              <a href="/action" class="nav-link">训练库</a>
            </li>
            <li class="nav-item">
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
        <h1>训练库</h1>
        <p>欢迎来到训练库页面，这里将展示各种训练内容。</p>

        <!-- 筛选条件 -->
        <div class="filters" style="margin: 20px 0;">
          <!-- 分类筛选 -->
          <div class="filter-item">
            <label>分类：</label>
            <el-select v-model="activeCategory" placeholder="选择分类" style="width: 150px; margin-right: 10px;">
              <el-option v-for="category in categories" :key="category.value" :label="category.label" :value="category.value" />
            </el-select>
          </div>
          
          <!-- 难度筛选 -->
          <div class="filter-item">
            <label>难度：</label>
            <el-select v-model="activeLevel" placeholder="选择难度" style="width: 150px; margin-right: 10px;">
              <el-option v-for="level in levels" :key="level.value" :label="level.label" :value="level.value" />
            </el-select>
          </div>
          
          <!-- 器械筛选 -->
          <div class="filter-item">
            <label>器械：</label>
            <el-select v-model="activeEquipment" placeholder="选择器械" style="width: 150px;">
              <el-option v-for="equipment in equipments" :key="equipment.value" :label="equipment.label" :value="equipment.value" />
            </el-select>
          </div>
        </div>

        <!-- 训练列表 严格匹配数据库字段 -->
        <div class="exercise-list" v-if="filteredExercises.length">
          <div class="exercise-item" v-for="item in filteredExercises" :key="item.id">
            <h3>{{ item.name }}</h3>
            <p>分类：{{ item.category }}</p>
            <p>难度：{{ item.level }}</p>
            <p>器械：{{ item.equipment }}</p>
            <p>目标肌群：{{ item.target_muscle }}</p>
            <p>动作规范：{{ item.sets_reps }}</p>
            <p class="desc">{{ item.description }}</p>
          </div>
        </div>

        <div v-else>
          <p>暂无训练数据</p>
        </div>
      </div>
    </main>
    

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { navigateTo } from "nuxt/app";
import { HomeFilled, VideoPlay, Tools, User, ArrowLeft } from "@element-plus/icons-vue";

const exerciseList = ref([]);
const activeCategory = ref("");
const activeLevel = ref("");
const activeEquipment = ref("");

// 自动从数据库加载分类、难度、器械
const categories = ref([{ label: "全部", value: "" }]);
const levels = ref([{ label: "全部", value: "" }]);
const equipments = ref([{ label: "全部", value: "" }]);

// 过滤后的训练列表
const filteredExercises = computed(() => {
  return exerciseList.value.filter(item => {
    const categoryMatch = !activeCategory.value || item.category === activeCategory.value;
    const levelMatch = !activeLevel.value || item.level === activeLevel.value;
    const equipmentMatch = !activeEquipment.value || item.equipment === activeEquipment.value;
    return categoryMatch && levelMatch && equipmentMatch;
  });
});

onMounted(async () => {
  try {
    const res = await fetch("/api/exercise_logs");
    const result = await res.json();
    
    if (result.code === 200) {
      exerciseList.value = result.data;

      // 自动提取数据库里的真实分类、难度、器械
      const categorySet = new Set();
      const levelSet = new Set();
      const equipmentSet = new Set();

      exerciseList.value.forEach(item => {
        if (item.category) categorySet.add(item.category);
        if (item.level) levelSet.add(item.level);
        if (item.equipment) equipmentSet.add(item.equipment);
      });

      // 赋值给下拉框
      categories.value = [
        { label: "全部", value: "" },
        ...Array.from(categorySet).map(c => ({ label: c, value: c }))
      ];
      levels.value = [
        { label: "全部", value: "" },
        ...Array.from(levelSet).map(l => ({ label: l, value: l }))
      ];
      equipments.value = [
        { label: "全部", value: "" },
        ...Array.from(equipmentSet).map(e => ({ label: e, value: e }))
      ];
    }
  } catch (err) {
    console.error("请求失败", err);
  }
});
</script>

<style scoped lang="scss">
.action-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.top-nav {
  background-color: #ffffff;
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
  cursor: pointer;
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: #409eff;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.nav-menu {
  display: flex;
  align-items: center;
}

.nav-list {
  display: flex;
  gap: 32px;
  list-style: none;
}

.nav-item {
  position: relative;
}

.nav-link {
  text-decoration: none;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s;
  display: inline-block;
  padding: 4px 0;
}

.nav-link:hover {
  color: #409eff;
}

.nav-item.active .nav-link {
  color: #409eff;
  position: relative;
}

.nav-item.active .nav-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #409eff;
  border-radius: 1px;
}

.main-content {
  flex: 1;
  padding: 24px 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.content-container h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.content-container p {
  font-size: 16px;
  color: #606266;
  line-height: 1.5;
}

/* 筛选条件样式 */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 10px;
  margin: 20px 0;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* 训练样式 */
.exercise-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.exercise-item {
  padding: 20px;
  background: #f9fafb;
  border-radius: 10px;
  border-left: 4px solid #409eff;
}
.exercise-item h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #333;
}
.exercise-item p {
  margin: 6px 0;
  font-size: 14px;
  color: #555;
}
.desc {
  color: #888 !important;
  margin-top: 10px !important;
}



@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .content-container {
    padding: 20px;
  }
  
  .main-content {
    padding-bottom: 24px;
  }
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