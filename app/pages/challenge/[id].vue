<template>
  <div class="challenge-detail-page">
    <header class="top-nav">
      <div class="nav-container">
        <div class="logo" @click="navigateTo('/challenge')">
          <div class="logo-icon">
            <el-icon size="28"><HomeFilled /></el-icon>
          </div>
          <span class="logo-text">挑战详情</span>
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
              <a href="/challenge" class="nav-link">挑战中心</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
    
    <main class="main-content">
      <div class="content-container">
        <div class="back-button">
          <el-button @click="navigateTo('/challenge')" size="default">
            <el-icon><ArrowLeft /></el-icon>
            返回挑战列表
          </el-button>
        </div>
        
        <div v-if="loading" class="loading-container">
          <el-button type="primary" loading>加载中...</el-button>
        </div>
        <div v-else-if="error" class="error-container">
          <el-alert
            :title="error"
            type="error"
            show-icon
            :closable="false"
          >
            <template #default>
              <el-button type="primary" size="small" @click="navigateTo('/challenge')">返回列表</el-button>
            </template>
          </el-alert>
        </div>
        <div v-else-if="!challenge" class="empty-container">
          <el-empty description="挑战不存在">
            <el-button type="primary" @click="navigateTo('/challenge')">返回列表</el-button>
          </el-empty>
        </div>
        <div v-else class="challenge-detail">
          <h1>{{ challenge.title }}</h1>
          <div class="challenge-meta">
            <span :class="['challenge-badge', getStatusClass(challenge.status)]">
              {{ getStatusText(challenge.status) }}
            </span>
            <span class="challenge-date">
              {{ formatDate(challenge.start_date) }} - {{ formatDate(challenge.end_date) }}
            </span>
          </div>
          
          <div class="challenge-description">
            <h2>挑战说明</h2>
            <p>{{ challenge.description }}</p>
          </div>
          
          <div class="challenge-stats">
            <h2>挑战数据</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">参与人数</span>
                <span class="stat-value">{{ challenge.participant_count.toLocaleString() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">完成率</span>
                <span class="stat-value">{{ challenge.completion_rate }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">挑战时长</span>
                <span class="stat-value">{{ challenge.target_duration }}天</span>
              </div>
            </div>
          </div>
          
          <div class="challenge-actions">
            <el-button v-if="isParticipated" type="success" size="default" @click="handleCancelParticipation(challenge.id)">
              已报名
            </el-button>
            <el-button v-else-if="challenge.status !== 'completed'" type="primary" size="default" @click="handleJoinChallenge(challenge.id)">
              {{ getPrimaryButtonText(challenge.status) }}
            </el-button>
            <el-button v-else type="primary" size="default" @click="handleJoinChallenge(challenge.id)">
              {{ getPrimaryButtonText(challenge.status) }}
            </el-button>
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
            <el-icon><Aim /></el-icon>
          </div>
          <span class="nav-text">挑战</span>
        </div>
      </div>
    </footer>
    

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, navigateTo } from "nuxt/app";
import {
  HomeFilled,
  VideoPlay,
  Food,
  Aim,
  ArrowLeft
} from "@element-plus/icons-vue";
import { ElMessage, ElButton, ElDialog } from "element-plus";

const route = useRoute();
const challenge = ref(null);
const loading = ref(true);
const error = ref(null);
const isParticipated = ref(false); // 控制按钮显示的关键状态

// 弹窗相关变量
const currentChallengeId = ref(null);

// 检查路由参数
console.log('当前挑战 ID:', route.params.id);

// 获取挑战详情
const fetchChallengeDetail = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await fetch(`/api/challenge/${route.params.id}`);
    if (!response.ok) {
      throw new Error('挑战不存在');
    }
    const data = await response.json();
    if (data.code === 200) {
      challenge.value = data.data;
    } else {
      throw new Error(data.message || '获取挑战详情失败');
    }
  } catch (err) {
    console.error('请求失败:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// 检查用户报名状态
const checkParticipation = async () => {
  try {
    // 强制使用默认用户ID 3
    let currentUserId = 3;
    console.log('使用默认用户ID:', currentUserId);
    
    // 发送GET请求到API，检查用户是否已报名
    const response = await fetch(`/api/challenge/check?user_id=${currentUserId}&challenge_id=${route.params.id}`);
    
    const data = await response.json();
    
    if (data.code === 200) {
      isParticipated.value = data.data.isJoined;
    }
  } catch (err) {
    console.error('检查报名状态失败:', err);
  }
};

// 显示参与挑战弹窗
const handleJoinChallenge = (id) => {
  if (challenge.value && challenge.value.status === 'completed') {
    // 已结束的挑战，显示提示信息
    ElMessage.info('挑战已结束，无法参与');
  } else {
    // 未结束的挑战，显示参与弹窗
    currentChallengeId.value = id;
    // 禁用页面滚动
    document.body.style.overflow = 'hidden';
    
    // 显示确认弹窗
    ElMessageBox.confirm('你确定要参与这个挑战吗？', '参与挑战', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
      showCancelButton: true,
      confirmButtonClass: 'el-button--primary',
      cancelButtonClass: 'el-button--default',
    })
      .then(async () => {
        try {
            // 强制使用默认用户ID 3
            let currentUserId = 3;
            console.log('使用默认用户ID:', currentUserId);
            
            // 发送POST请求到API
            const response = await fetch(`/api/challenge/${currentChallengeId.value}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: currentUserId,
              }),
            });
          
          const data = await response.json();
          
          if (data.code === 200) {
            // 参与成功，更新报名状态
            isParticipated.value = true;
            ElMessage.success('参与挑战成功！');
            // 重新获取挑战详情（包含最新的人数）
            fetchChallengeDetail();
          } else {
            // 显示错误提示
            ElMessage.error(data.message || '参与挑战失败');
          }
        } catch (error) {
          console.error('请求失败:', error);
          ElMessage.error('网络错误，请稍后再试');
        } finally {
          // 恢复页面滚动
          document.body.style.overflow = '';
        }
      })
      .catch(() => {
        // 用户取消操作
        // 恢复页面滚动
        document.body.style.overflow = '';
      });
  }
};

// 取消报名
const handleCancelParticipation = (id) => {
  // 禁用页面滚动
  document.body.style.overflow = 'hidden';
  
  // 显示确认弹窗
  ElMessageBox.confirm('你确定要取消参与这个挑战吗？', '取消参与', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    center: true,
    showCancelButton: true,
    confirmButtonClass: 'el-button--primary',
    cancelButtonClass: 'el-button--default',
  })
    .then(async () => {
      try {
            // 强制使用默认用户ID 3
            let currentUserId = 3;
            console.log('使用默认用户ID:', currentUserId);
            
            // 发送DELETE请求到API
            const response = await fetch(`/api/challenge/${id}/participation`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: currentUserId,
              }),
            });
        
        const data = await response.json();
        
        if (data.code === 200) {
          // 取消报名成功，更新报名状态
          isParticipated.value = false;
          ElMessage.success('取消参与成功！');
          // 重新获取挑战详情（包含最新的人数）
          fetchChallengeDetail();
        } else {
          // 显示错误提示
          ElMessage.error(data.message || '取消参与失败');
        }
      } catch (error) {
        console.error('请求失败:', error);
        ElMessage.error('网络错误，请稍后再试');
      } finally {
        // 恢复页面滚动
        document.body.style.overflow = '';
      }
    })
    .catch(() => {
      // 用户取消操作
      // 恢复页面滚动
      document.body.style.overflow = '';
    });
};



// 组件挂载时获取数据
onMounted(() => {
  fetchChallengeDetail();
  checkParticipation();
});

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

// 获取状态标签类名
const getStatusClass = (status) => {
  switch (status) {
    case 'ongoing':
      return '';
    case 'upcoming':
      return 'upcoming';
    case 'completed':
      return 'completed';
    default:
      return '';
  }
};

// 获取状态标签文本
const getStatusText = (status) => {
  switch (status) {
    case 'ongoing':
      return '进行中';
    case 'upcoming':
      return '即将开始';
    case 'completed':
      return '已结束';
    default:
      return '未知状态';
  }
};

// 获取主要按钮文本
const getPrimaryButtonText = (status) => {
  switch (status) {
    case 'ongoing':
      return '立即参与';
    case 'upcoming':
      return '预约参与';
    case 'completed':
      return '查看结果';
    default:
      return '参与';
  }
};


</script>

<style scoped lang="scss">
.challenge-detail-page {
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

.back-button {
  margin-bottom: 24px;
}

.challenge-detail h1 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.challenge-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.challenge-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background-color: #ecf5ff;
  color: #409eff;
}

.challenge-badge.upcoming {
  background-color: #f0f9eb;
  color: #67c23a;
}

.challenge-badge.completed {
  background-color: #f5f7fa;
  color: #909399;
}

.challenge-date {
  font-size: 14px;
  color: #606266;
}

.challenge-description {
  margin-bottom: 32px;
}

.challenge-description h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.challenge-description p {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
}

.challenge-stats {
  margin-bottom: 32px;
}

.challenge-stats h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.challenge-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.error-container {
  padding: 60px 0;
}

.empty-container {
  padding: 60px 0;
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
  
  .challenge-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .challenge-actions {
    flex-direction: column;
  }
  
  .challenge-actions .el-button {
    width: 100%;
  }
}

/* 确保弹窗基于视口居中 */
:deep(.el-dialog) {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  z-index: 3000 !important;
}

:deep(.el-dialog__wrapper) {
  z-index: 2000 !important;
}
</style>