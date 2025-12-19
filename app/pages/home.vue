<template>
  <div class="dashboard">
    <!-- 顶部导航栏 -->
    <header class="top-nav">
      <div class="nav-container">
        <!-- 左侧Logo -->
        <div class="logo">
          <!-- 使用Element Plus图标替代SVG -->
          <div class="logo-icon">
            <el-icon size="28"><IconAward /></el-icon>
          </div>
          <span class="logo-text">健身助手</span>
        </div>
        
        <!-- 中间导航菜单 -->
        <nav class="nav-menu">
          <ul class="nav-list">
            <li class="nav-item active"><a href="/home" class="nav-link">首页</a></li>
            <li class="nav-item"><a href="/training" class="nav-link">训练库</a></li>
            <li class="nav-item"><a href="/diet" class="nav-link">饮食指南</a></li>
            <li class="nav-item"><a href="/data" class="nav-link">数据中心</a></li>
          </ul>
        </nav>
        
        <!-- 右侧功能区 -->
        <div class="nav-actions">
          <!-- 搜索框 -->
          <div class="search-box">
            <input type="text" placeholder="搜索" class="search-input" />
            <button class="search-btn">
              <el-icon size="16"><Search /></el-icon>
            </button>
          </div>
          
          <!-- 通知和消息图标 -->
          <div class="notification-icons">
            <button class="icon-btn message-btn">
              <el-icon size="20"><Message /></el-icon>
            </button>
            <button class="icon-btn comment-btn">
              <el-icon size="20"><Message /></el-icon>
            </button>
          </div>
          
          <!-- 用户头像 -->
          <div class="user-profile">
            <div class="user-avatar">
              <el-icon size="36"><User /></el-icon>
            </div>
          </div>
          
          <!-- 提醒图标 -->
          <button class="icon-btn notification-btn">
            <el-icon size="20"><Bell /></el-icon>
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <!-- 体重数据展示卡片 -->
        <div class="weight-card">
          <div class="weight-header">
            <h3 class="weight-title">个人体重数据</h3>
            <button class="edit-btn" @click="editWeightData">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          </div>
          
          <div class="weight-data">
            <!-- 当前体重 -->
            <div class="weight-item current-weight">
              <div class="weight-label">当前体重</div>
              <div class="weight-value">{{ currentWeight }}<span class="weight-unit">kg</span></div>
              <div class="weight-trend" :class="weightChange < 0 ? 'down' : 'up'">{{ weightChange < 0 ? '↓' : '↑' }} {{ Math.abs(weightChange) }}kg</div>
            </div>
            
            <!-- 体重对比图表 -->
            <div class="weight-chart">
              <div class="chart-lines">
                <div class="chart-line current-line">
                  <div class="line" style="height: 40%;"></div>
                  <div class="line-dot"></div>
                </div>
                <div class="chart-line target-line">
                  <div class="line" style="height: 30%;"></div>
                  <div class="line-dot"></div>
                </div>
              </div>
            </div>
            
            <!-- 目标体重 -->
            <div class="weight-item target-weight">
              <div class="weight-label">目标体重</div>
              <div class="weight-value">{{ targetWeight }}<span class="weight-unit">kg</span></div>
              <div class="weight-progress">目标</div>
            </div>
          </div>
          
          <!-- 体脂率信息 -->
          <div class="body-fat">
            <div class="fat-item">
              <span class="fat-label">体脂率</span>
              <span class="fat-value">{{ bodyFat }}%</span>
            </div>
          </div>
        </div>

        <!-- 训练计划卡片区域 -->
        <div class="training-plans">
          <h3 class="section-title">训练计划</h3>
          <div class="plan-cards">
            <!-- 计划卡片 1 -->
            <div class="plan-card" v-for="plan in trainingPlans" :key="plan.id" @click="startTrainingPlan(plan.id)">
              <div class="plan-header">
                <div :class="['plan-icon', plan.iconClass]"></div>
                <div v-if="plan.isNew" class="plan-badge">新</div>
              </div>
              <h4 class="plan-name">{{ plan.name }}</h4>
              <div class="plan-info">
                <div class="plan-detail">
                  <span class="detail-label">周期</span>
                  <span class="detail-value">{{ plan.period }}</span>
                </div>
                <div class="plan-detail">
                  <span class="detail-label">适合人群</span>
                  <span class="detail-value">{{ plan.targetPeople }}</span>
                </div>
              </div>
              <button class="start-plan-btn">开始计划</button>
            </div>
          </div>
        </div>

        <!-- 快捷功能入口 -->
        <div class="quick-actions">
          <div class="action-cards">
            <!-- 定制计划 -->
            <div class="action-card" @click="handleQuickAction('customPlan')">
              <div class="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
              </div>
              <span class="action-name">定制计划</span>
            </div>
            
            <!-- 记录饮食 -->
            <div class="action-card" @click="handleQuickAction('recordDiet')">
              <div class="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                </svg>
              </div>
              <span class="action-name">记录饮食</span>
            </div>
            
            <!-- 运动打卡 -->
            <div class="action-card" @click="handleQuickAction('exerciseCheckin')">
              <div class="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <span class="action-name">运动打卡</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部导航栏 -->
    <footer class="bottom-nav">
      <div class="nav-items">
        <div class="nav-item active">
          <div class="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <span class="nav-text">首页</span>
        </div>
        
        <div class="nav-item">
          <div class="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          <span class="nav-text">探索</span>
        </div>
        
        <div class="nav-item">
          <div class="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.656 11.092l-1.412-1.416L13 16.172l-2.24-2.24-1.424 1.424 3.664 3.664zM11 7h2v5.414L7.707 5.293 6.293 6.707 11 11.414z"/>
            </svg>
          </div>
          <span class="nav-text">工具</span>
        </div>
        
        <div class="nav-item">
          <div class="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <span class="nav-text">我的</span>
        </div>
      </div>
    </footer>
  </div>
  
  <!-- 体重数据编辑弹窗 -->
  <div v-if="isEditModalVisible" class="modal-overlay" @click="closeEditModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">编辑体重数据</h3>
        <button class="modal-close" @click="closeEditModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- 当前体重输入 -->
        <div class="form-group">
          <label for="currentWeight" class="form-label">当前体重 (kg)</label>
          <input 
            id="currentWeight"
            v-model.number="editCurrentWeight"
            type="number" 
            step="0.1"
            min="30"
            max="200"
            class="form-input"
            placeholder="请输入当前体重"
          />
        </div>
        
        <!-- 目标体重输入 -->
        <div class="form-group">
          <label for="targetWeight" class="form-label">目标体重 (kg)</label>
          <input 
            id="targetWeight"
            v-model.number="editTargetWeight"
            type="number" 
            step="0.1"
            min="30"
            max="200"
            class="form-input"
            placeholder="请输入目标体重"
          />
        </div>
        
        <!-- 体脂率输入 -->
        <div class="form-group">
          <label for="bodyFat" class="form-label">体脂率 (%)</label>
          <input 
            id="bodyFat"
            v-model.number="editBodyFat"
            type="number" 
            step="0.1"
            min="5"
            max="40"
            class="form-input"
            placeholder="请输入体脂率"
          />
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-cancel" @click="closeEditModal">取消</button>
        <button class="btn btn-primary" @click="saveWeightData">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 导入必要的函数
import { ref, onMounted } from 'vue'
// 导入Element Plus图标组件
import { 
  HomeFilled, Search, Message, Bell, User, Edit,
  ArrowDown, ArrowUp,
  Aim, VideoPlay,
  ShoppingCart,
  Calendar, List
} from '@element-plus/icons-vue';

// 定义响应式数据
const currentWeight = ref(68)
const targetWeight = ref(65)
const bodyFat = ref(18)
const weightChange = ref(-0.5)

// 体重编辑弹窗相关状态
const isEditModalVisible = ref(false)
const editCurrentWeight = ref(68)
const editTargetWeight = ref(65)
const editBodyFat = ref(18)

// 训练计划数据
const trainingPlans = ref([
  {
    id: 1,
    name: '新手增肌计划',
    period: '4周',
    targetPeople: '健身新手',
    // 移除不存在的SVG引用，使用CSS类代替
    iconClass: 'plan-icon-1',
    isNew: true
  },
  {
    id: 2,
    name: '减脂塑形计划',
    period: '6周',
    targetPeople: '减脂人群',
    iconClass: 'plan-icon-2',
    isNew: true
  },
  {
    id: 3,
    name: '上肢力量计划',
    period: '8周',
    targetPeople: '中级健身者',
    iconClass: 'plan-icon-3',
    isNew: false
  },
  {
    id: 4,
    name: '全身训练计划',
    period: '12周',
    targetPeople: '进阶训练者',
    iconClass: 'plan-icon-4',
    isNew: false
  }
])

// 生命周期钩子
onMounted(() => {
  // 页面加载时可以执行的初始化操作
  console.log('健身仪表盘页面已加载')
})

// 开始训练计划
const startTrainingPlan = (planId) => {
  console.log('开始训练计划:', planId)
  // 可以添加跳转到训练详情页面的逻辑
  // navigateTo(`/training/${planId}`)
}

// 处理快捷功能点击
const handleQuickAction = async (actionType) => {
  console.log('点击快捷功能:', actionType)
  // 根据不同的功能类型执行不同的逻辑
  switch (actionType) {
    case 'recordDiet':
      // 跳转到饮食记录页面
      await navigateTo('/yingyang')
      break
    case 'customPlan':
      // 跳转到计划页面
      await navigateTo('/jihua')
      break
    case 'exerciseCheckin':
      // 跳转到活动页面
      await navigateTo('/huodong')
      break
    case 'kibpk':
      // 其他功能的处理逻辑可以在这里添加
      console.log('该功能尚未实现')
      break
    default:
      console.log('未知的功能类型')
  }
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑
  console.log('执行搜索')
}

// 处理通知点击
const handleNotification = () => {
  console.log('查看通知')
}

// 处理消息点击
const handleMessage = () => {
  console.log('查看消息')
}

// 处理个人资料点击
const handleProfile = () => {
  console.log('查看个人资料')
}

// 编辑体重数据
const editWeightData = () => {
  // 在打开弹窗前，将当前数据复制到编辑表单中
  editCurrentWeight.value = currentWeight.value
  editTargetWeight.value = targetWeight.value
  editBodyFat.value = bodyFat.value
  // 显示编辑弹窗
  isEditModalVisible.value = true
  console.log('打开体重数据编辑弹窗')
}

// 关闭编辑弹窗
const closeEditModal = function() {
    isEditModalVisible.value = false;
  };

// 保存体重数据修改
const saveWeightData = function() {
  // 数据验证
  var isValid = true;
  var errorMessage = '';
  
  // 验证当前体重
  if (!editCurrentWeight.value || editCurrentWeight.value < 30 || editCurrentWeight.value > 200) {
    isValid = false;
    errorMessage = '请输入有效的当前体重（30-200kg）';
  }
  // 验证目标体重
  else if (!editTargetWeight.value || editTargetWeight.value < 30 || editTargetWeight.value > 200) {
    isValid = false;
    errorMessage = '请输入有效的目标体重（30-200kg）';
  }
  // 验证体脂率
  else if (!editBodyFat.value || editBodyFat.value < 5 || editBodyFat.value > 40) {
    isValid = false;
    errorMessage = '请输入有效的体脂率（5-40%）';
  }
  
  if (!isValid) {
    alert(errorMessage);
    return;
  }
  
  // 计算体重变化
  var newWeightChange = editCurrentWeight.value - currentWeight.value;
  
  // 更新数据
  currentWeight.value = editCurrentWeight.value;
  targetWeight.value = editTargetWeight.value;
  bodyFat.value = editBodyFat.value;
  weightChange.value = newWeightChange;
  
  // 关闭弹窗
  isEditModalVisible.value = false;
}
</script>

<style scoped lang="scss">
// 全局样式重置
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

// 仪表盘整体容器
.dashboard {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

// 顶部导航栏样式
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

// Logo样式
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

// 导航菜单样式
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
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #409eff;
  border-radius: 1px;
}

// 导航右侧功能区样式
.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 16px;
  padding: 6px 12px;
  width: 200px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #606266;
  padding: 4px 0;
}

.search-btn {
  background: transparent;
  border: none;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.search-btn:hover {
  color: #409eff;
}

.notification-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  background: transparent;
  border: none;
  color: #606266;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  position: relative;
}

.icon-btn:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.user-profile {
  cursor: pointer;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #409eff;
}

// 主内容区域样式
.main-content {
  flex: 1;
  padding: 24px 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

// 体重数据卡片样式
.weight-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.weight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.weight-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.edit-btn {
  background: transparent;
  border: none;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.edit-btn:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

.weight-data {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.weight-item {
  text-align: center;
  flex: 1;
}

.weight-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.weight-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.weight-unit {
  font-size: 16px;
  font-weight: 400;
  color: #606266;
}

.weight-trend {
  font-size: 12px;
  font-weight: 500;
}

.weight-trend.down {
  color: #67c23a;
}

.weight-trend.up {
  color: #f56c6c;
}

.weight-progress {
  font-size: 12px;
  font-weight: 500;
  color: #e6a23c;
}

.weight-chart {
  flex: 2;
  height: 100px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 20px;
  padding: 0 20px;
}

.chart-lines {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  width: 100%;
}

.chart-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.line {
  width: 4px;
  background-color: #409eff;
  border-radius: 2px;
  transition: height 0.3s ease;
}

.current-line .line {
  background-color: #409eff;
}

.target-line .line {
  background-color: #e6a23c;
}

.line-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #409eff;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.current-line .line-dot {
  background-color: #409eff;
}

.target-line .line-dot {
  background-color: #e6a23c;
}

.body-fat {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.fat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fat-label {
  font-size: 14px;
  color: #606266;
}

.fat-value {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

// 训练计划区域样式
.training-plans {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.plan-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.plan-card {
  background-color: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
  cursor: pointer;
}

.plan-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.plan-header {
  position: relative;
  margin-bottom: 12px;
}

.plan-icon {
  width: 100%;
  height: 120px;
  border-radius: 8px 8px 0 0;
  background-color: #f0f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 48px;
}

.plan-icon-1 {
  background-color: #f0f9ff;
  color: #409eff;
}

.plan-icon-2 {
  background-color: #f0fdf4;
  color: #67c23a;
}

.plan-icon-3 {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.plan-icon-4 {
  background-color: #fef0f0;
  color: #f56c6c;
}

.plan-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f56c6c;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.plan-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.plan-info {
  margin-bottom: 16px;
}

.plan-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detail-label {
  font-size: 12px;
  color: #909399;
}

.detail-value {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.start-plan-btn {
  width: 100%;
  background-color: #409eff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.start-plan-btn:hover {
  background-color: #66b1ff;
}

// 快捷功能入口样式
.quick-actions {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

// 弹窗样式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.modal-close:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  color: #303133;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.3s;
  outline: none;
}

.form-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.form-input::placeholder {
  color: #c0c4cc;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
  background-color: #f5f7fa;
  border-radius: 0 0 12px 12px;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  outline: none;
}

.btn-cancel {
  background-color: #ffffff;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-cancel:hover {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

.btn-primary {
  background-color: #409eff;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #409eff;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ecf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
}

.action-name {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

// 底部导航栏样式
.bottom-nav {
  background-color: #ffffff;
  border-top: 1px solid #ebeef5;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  display: none; // 默认在桌面端隐藏
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

// 响应式设计
@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
  }
  
  .nav-menu {
    display: none;
  }
  
  .search-box {
    width: 150px;
  }
  
  .content-container {
    padding: 0 16px;
  }
  
  .weight-data {
    flex-direction: column;
    gap: 16px;
  }
  
  .weight-chart {
    width: 100%;
    max-width: 300px;
  }
  
  .plan-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-cards {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .action-card {
    padding: 12px 8px;
  }
  
  .action-icon {
    width: 40px;
    height: 40px;
  }
  
  .bottom-nav {
    display: block;
  }
  
  .main-content {
    padding-bottom: 72px; // 为底部导航留出空间
  }
}

@media (max-width: 480px) {
  .plan-cards {
    grid-template-columns: 1fr;
  }
  
  .search-box {
    display: none;
  }
  
  .nav-actions {
    gap: 8px;
  }
}
</style>








