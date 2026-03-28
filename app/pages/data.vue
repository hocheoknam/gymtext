<template>
  <div class="data-page">
    <header class="top-nav">
      <div class="nav-container">
        <div class="logo">
          <div class="logo-icon">
            <el-icon size="28"><HomeFilled /></el-icon>
          </div>
          <span class="logo-text">数据中心</span>
        </div>
        <nav class="nav-menu">
          <ul class="nav-list">
            <li class="nav-item">
              <a href="/home" class="nav-link">首页</a>
            </li>
            <li class="nav-item">
              <a href="/action" class="nav-link">训练库</a>
            </li>
            <li class="nav-item">
              <a href="/eat" class="nav-link">饮食指南</a>
            </li>
            <li class="nav-item active">
              <a href="/data" class="nav-link">数据中心</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
    
    <main class="main-content">
      <div class="content-container">
        <h1>数据中心</h1>
        <div class="body-stats-section">
          <h2>身体数据</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">身高</div>
              <div class="stat-value">{{ height }} cm</div>
              <button class="edit-btn" @click="openEditDialog('height')">
                <el-icon size="16"><Edit /></el-icon>
              </button>
            </div>
            <div class="stat-card">
              <div class="stat-label">体重</div>
              <div class="stat-value">{{ formatNumber(weight) }} kg</div>
              <button class="edit-btn" @click="openEditDialog('weight')">
                <el-icon size="16"><Edit /></el-icon>
              </button>
            </div>
            <div class="stat-card">
              <div class="stat-label">体脂率</div>
              <div class="stat-value">{{ formatNumber(body_fat) }}%</div>
              <button class="edit-btn" @click="openEditDialog('body_fat')">
                <el-icon size="16"><Edit /></el-icon>
              </button>
            </div>
            <div class="stat-card">
              <div class="stat-label">BMI</div>
              <div class="stat-value">{{ bmi || '0' }}</div>
            </div>
          </div>
        </div>
        
        <!-- 勋章展示区域 -->
        <div class="achievements-section">
          <h2>我的勋章</h2>
          <div v-if="userAchievements.length === 0" class="no-achievements">
            <p>您还没有获得任何勋章，完成挑战可以获得勋章！</p>
          </div>
          <div v-else class="achievements-list">
            <div v-for="(achievement, index) in userAchievements" :key="index" class="achievement-card">
              <div class="achievement-icon">
                {{ achievement.icon_url ? `<img src="${achievement.icon_url}" alt="${achievement.name}" />` : '🏆' }}
              </div>
              <div class="achievement-info">
                <h3>{{ achievement.name }}</h3>
                <p>{{ achievement.description }}</p>
                <p class="obtained-date">获得时间: {{ formatDate(achievement.obtained_at) }}</p>
              </div>
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
        <div class="nav-item" @click="navigateTo('/eat')">
          <div class="nav-icon">
            <el-icon><Food /></el-icon>
          </div>
          <span class="nav-text">饮食</span>
        </div>
        <div class="nav-item active">
          <div class="nav-icon">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <span class="nav-text">数据</span>
        </div>
      </div>
    </footer>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editingField === 'height' ? '编辑身高' : editingField === 'weight' ? '编辑体重' : '编辑体脂率'"
      width="300px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item :label="editingField === 'height' ? '身高 (cm)' : editingField === 'weight' ? '体重 (kg)' : '体脂率 (%)'">
          <el-input v-model.number="editForm.value" type="number" :step="editingField === 'height' ? 1 : 0.1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { navigateTo } from "nuxt/app";
import { ElMessage, ElMessageBox, ElDialog, ElInput, ElButton, ElForm, ElFormItem } from "element-plus";
import {
  HomeFilled,
  VideoPlay,
  Food,
  DataAnalysis,
  Edit
} from "@element-plus/icons-vue";

// 用户勋章列表
const userAchievements = ref([]);

// 身体数据
const height = ref(170); // 默认身高 (cm)
const weight = ref(65);  // 默认体重 (kg)
const body_fat = ref(18); // 默认体脂率

// 使用 computed 自动计算BMI
const bmi = computed(() => {
  // 1. 防止除以 0 或空值
  if (!height.value || !weight.value) return 0;

  // 2. 将身高转换为米 (例如 170cm -> 1.7m)
  const heightInMeters = height.value / 100;

  // 3. 计算 BMI = 体重 / 身高²
  const bmiValue = weight.value / (heightInMeters * heightInMeters);

  // 4. 保留 1 位小数返回
  return bmiValue.toFixed(1);
});

// 编辑对话框状态
const editDialogVisible = ref(false);
const editingField = ref('');
const editForm = ref({ value: '' });

// 格式化数值，保留最多两位小数，去除末尾的零
function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return '0';
  
  // 先保留两位小数
  let formatted = parsed.toFixed(2);
  
  // 去除末尾的零
  if (formatted.includes('.')) {
    formatted = formatted.replace(/\.?0+$/, '');
  }
  
  return formatted;
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
}

// 显示勋章获得弹窗
function showAchievementPopup(achievement) {
  ElMessageBox.alert(
    `<div style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
      <h3>恭喜你获得新勋章！</h3>
      <p>${achievement.name}</p>
      <p style="color: #666; font-size: 14px;">${achievement.description}</p>
    </div>`,
    '新勋章解锁',
    {
      confirmButtonText: '太棒了',
      dangerouslyUseHTMLString: true
    }
  );
}

// 更新用户勋章列表
function updateUserAchievements(achievements) {
  userAchievements.value = achievements;
  console.log('用户勋章列表已更新:', achievements);
}

// 打开编辑对话框
function openEditDialog(field) {
  editingField.value = field;
  switch (field) {
    case 'height':
      editForm.value.value = height.value;
      break;
    case 'weight':
      editForm.value.value = weight.value;
      break;
    case 'body_fat':
      editForm.value.value = body_fat.value;
      break;
  }
  editDialogVisible.value = true;
}

// 保存编辑的数据
async function saveEdit() {
  if (!editForm.value.value) {
    ElMessage.error('请输入值');
    return;
  }
  
  const value = parseFloat(editForm.value.value);
  if (isNaN(value)) {
    ElMessage.error('请输入有效的数值');
    return;
  }
  
  // 获取用户ID
  let userId = localStorage.getItem('userId');
  if (!userId) {
    // 从Token解析
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        userId = tokenPayload.user_id || tokenPayload.id || tokenPayload.userId;
      } catch (error) {
        console.error('解析Token失败:', error);
        ElMessage.error('无法获取用户信息');
        return;
      }
    }
  }
  
  if (!userId) {
    userId = 3; // 默认用户ID
  }
  
  try {
    // 无论修改哪个字段，都保存到数据库
    const response = await $fetch('/api/body-metrics', {
      method: 'POST',
      body: {
        user_id: userId,
        // 改为 weight_kg 以匹配数据库
        weight_kg: editingField.value === 'weight' ? value : weight.value,
        // 改为 body_fat 以匹配数据库
        body_fat: editingField.value === 'body_fat' ? value : body_fat.value,
        // 改为 height_cm 以匹配数据库
        height_cm: editingField.value === 'height' ? value : height.value,
        measurement_date: new Date().toISOString()
      }
    });
    
    if (response.code === 200) {
      ElMessage.success('数据保存成功');
      // 同时保存身高到本地存储作为备份
      if (editingField.value === 'height') {
        localStorage.setItem('userHeight', value);
      }
      
      // 保存成功后重新加载数据，确保与数据库同步
      await loadBodyMetrics();
    } else {
      ElMessage.error('数据保存失败');
    }
    
    // 更新本地数据
    switch (editingField.value) {
      case 'height':
        height.value = value;
        break;
      case 'weight':
        weight.value = value;
        break;
      case 'body_fat':
        body_fat.value = value;
        break;
    }
    
    // BMI会自动重新计算，因为它是一个计算属性
    
    editDialogVisible.value = false;
  } catch (error) {
    console.error('保存数据失败:', error);
    ElMessage.error('保存失败，请稍后重试');
  }
}

// 加载身体数据
async function loadBodyMetrics() {
  // 获取用户ID
  let userId = localStorage.getItem('userId');
  if (!userId) {
    // 从Token解析
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        userId = tokenPayload.user_id || tokenPayload.id || tokenPayload.userId;
      } catch (error) {
        console.error('解析Token失败:', error);
      }
    }
  }
  
  if (!userId) {
    userId = 3; // 默认用户ID
  }
  
  console.log('加载身体数据，用户ID:', userId);
  
  try {
    // 从API获取体重和体脂率数据
    const response = await $fetch(`/api/body-metrics?user_id=${userId}`);
    console.log('API响应:', response);
    
    if (response.code === 200 && response.data && response.data.length > 0) {
      // 按日期降序排序，获取最新的记录
      const sortedData = [...response.data].sort((a, b) => {
        return new Date(b.measurement_date) - new Date(a.measurement_date);
      });
      
      const latestRecord = sortedData[0];
      console.log('最新记录:', latestRecord);
      
      weight.value = latestRecord.weight;
      body_fat.value = latestRecord.body_fat;
      // 如果有身高数据，更新身高
      if (latestRecord.height) {
        height.value = latestRecord.height;
        localStorage.setItem('userHeight', latestRecord.height);
      }
    }
  } catch (error) {
    console.error('获取身体数据失败:', error);
  }
  
  // 从本地存储获取身高
  const savedHeight = localStorage.getItem('userHeight');
  if (savedHeight) {
    height.value = parseFloat(savedHeight);
  }
  
  console.log('最终数据:', {
    height: height.value,
    weight: weight.value,
    body_fat: body_fat.value
  });
}

// 在用户完成挑战时调用
async function completeChallenge(challengeId) {
  // 1. 标记挑战为完成
  // ... 这里是完成挑战的逻辑 ...
  
  // 2. 获取用户ID
  let userId = localStorage.getItem('userId');
  if (!userId) {
    // 从Token解析
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        userId = tokenPayload.user_id || tokenPayload.id || tokenPayload.userId;
      } catch (error) {
        console.error('解析Token失败:', error);
        ElMessage.error('无法获取用户信息');
        return;
      }
    }
  }
  
  if (!userId) {
    ElMessage.error('用户未登录');
    return;
  }
  
  // 3. 调用勋章接口
  const achievementCode = 'challenge_finisher';
  
  try {
    const response = await $fetch('/api/award-achievement', {
      method: 'POST',
      body: {
        userId: userId,
        achievementCode: achievementCode
      }
    });

    if (response.code === 200) {
      console.log('勋章已更新！', response.data);
      // 显示勋章获得弹窗
      showAchievementPopup(response.data.newlyObtained);
      
      // 可以更新用户的勋章列表
      updateUserAchievements(response.data.allAchievements);
    }
  } catch (err) {
    console.error('颁发失败', err);
    ElMessage.error('勋章颁发失败，请稍后重试');
  }
}

// 加载用户勋章列表
async function loadUserAchievements() {
  // 获取用户ID
  let userId = localStorage.getItem('userId');
  if (!userId) {
    // 从Token解析
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        userId = tokenPayload.user_id || tokenPayload.id || tokenPayload.userId;
      } catch (error) {
        console.error('解析Token失败:', error);
        return;
      }
    }
  }
  
  if (!userId) {
    return;
  }
  
  // 这里可以添加获取用户勋章列表的API调用
  // 例如：
  // try {
  //   const response = await $fetch(`/api/user-achievements?user_id=${userId}`);
  //   if (response.code === 200) {
  //     userAchievements.value = response.data;
  //   }
  // } catch (error) {
  //   console.error('获取勋章列表失败:', error);
  // }
}

// 生命周期钩子
onMounted(() => {
  loadBodyMetrics();
  loadUserAchievements();
});
</script>

<style scoped lang="scss">
.data-page {
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

/* 身体数据区域 */
.body-stats-section {
  margin-bottom: 40px;
}

.body-stats-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.edit-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: transparent;
  border: none;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.edit-btn:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

/* 勋章展示区域 */
.achievements-section {
  margin-top: 40px;
}

.achievements-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.no-achievements {
  text-align: center;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #909399;
}

.achievements-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.achievement-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.achievement-icon {
  font-size: 48px;
  min-width: 60px;
  text-align: center;
}

.achievement-icon img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.achievement-info {
  flex: 1;
}

.achievement-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.achievement-info p {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.4;
}

.obtained-date {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.bottom-nav {
  background-color: #ffffff;
  border-top: 1px solid #ebeef5;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
}

.nav-items {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 56px;
}

.bottom-nav .nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  padding: 8px 16px;
  color: #909399;
  transition: color 0.3s;
}

.bottom-nav .nav-item.active {
  color: #409eff;
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  font-size: 12px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .content-container {
    padding: 20px;
  }
  
  .bottom-nav {
    display: block;
  }
  
  .main-content {
    padding-bottom: 72px;
  }
  
  .achievements-list {
    grid-template-columns: 1fr;
  }
}
</style>