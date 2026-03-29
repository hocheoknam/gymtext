<template>
  <div class="challenge-page">
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
          <span class="logo-text">挑战中心</span>
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
        <h1>挑战中心</h1>
        <p>欢迎来到挑战中心页面，这里将展示各种健身挑战活动。</p>
        
        <!-- 挑战活动列表 -->
        <div v-if="loading" class="loading-container">
          <el-button type="primary" loading>加载中...</el-button>
        </div>
        <div v-else-if="challenges.length === 0" class="empty-container">
          <el-empty description="暂无挑战活动">
            <el-button type="primary">刷新</el-button>
          </el-empty>
        </div>
        <div v-else class="challenge-list">
          <div v-for="challenge in challenges" :key="challenge.id" class="challenge-card">
            <div class="challenge-header">
              <h2>{{ challenge.title }}</h2>
              <span :class="['challenge-badge', getStatusClass(challenge.status)]">{{ getStatusText(challenge.status) }}</span>
            </div>
            <div class="challenge-content">
              <p>{{ challenge.description }}</p>
              <div class="challenge-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: calculateProgress(challenge).percentage + '%' }"></div>
                </div>
                <span class="progress-text">{{ calculateProgress(challenge).text }}</span>
              </div>
              <div class="challenge-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ challenge.participant_count.toLocaleString() }}</span>
                  <span class="stat-label">参与人数</span>
                </div>
                <div class="stat-item">
                  <template v-if="challenge.status === 'upcoming'">
                    <span class="stat-label">开始时间：{{ formatDate(challenge.start_date) }}</span>
                  </template>
                  <template v-else>
                    <span class="stat-value">{{ challenge.completion_rate }}%</span>
                    <span class="stat-label">完成率</span>
                  </template>
                </div>
              </div>
            </div>
            <div class="challenge-actions">
              <el-button v-if="joinedStatus[challenge.id] && challenge.status === 'ongoing'" :type="checkedInStatus[challenge.id] ? 'success' : 'primary'" size="default" @click="navigateTo(`/challenge/${challenge.id}`)">
              {{ checkedInStatus[challenge.id] ? '已打卡' : '打卡' }}
            </el-button>
              <el-button v-else-if="joinedStatus[challenge.id]" type="success" size="default" @click="handleCancelParticipation(challenge.id)">
              已参与
            </el-button>
            <el-button v-else-if="challenge.status !== 'completed'" type="primary" size="default" @click="handleOpenDialog(challenge.id, challenge.status)">{{ getPrimaryButtonText(challenge.status) }}</el-button>
            <el-button v-else size="default" @click="handleOpenDialog(challenge.id, challenge.status)">{{ getPrimaryButtonText(challenge.status) }}</el-button>
              <NuxtLink :to="`/challenge/${challenge.id}`">
                <el-button size="default">查看详情</el-button>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </main>
    

    

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { navigateTo } from "nuxt/app";
import {
  HomeFilled,
  VideoPlay,
  Food,
  Aim,
  ArrowLeft
} from "@element-plus/icons-vue";
import { ElButton, ElDialog, ElMessage, ElMessageBox } from "element-plus";

// 统一的用户ID获取函数
const getCurrentUserId = () => {
  let currentUserId = null;
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      // 解析Token
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      // 尝试从不同字段获取用户ID
      currentUserId = tokenPayload.user_id || tokenPayload.id || tokenPayload.userId;
      console.log('从Token中解析出的用户ID:', currentUserId);
    } catch (error) {
      console.error('解析Token失败:', error);
      // 尝试直接从localStorage获取用户ID
      currentUserId = localStorage.getItem('user_id');
      console.log('从localStorage直接获取的用户ID:', currentUserId);
    }
  } else {
    // 尝试直接从localStorage获取用户ID
    currentUserId = localStorage.getItem('user_id');
    console.log('从localStorage直接获取的用户ID:', currentUserId);
  }
  
  // 如果没有获取到用户ID，使用默认值1（与打卡时保持一致）
  if (!currentUserId) {
    currentUserId = 1;
    console.log('使用默认用户ID:', currentUserId);
  }
  
  return currentUserId;
};

// 挑战活动数据
const challenges = ref([]);
const loading = ref(true);

// 存储每个挑战的报名状态，格式：{ challengeId: true/false }
const joinedStatus = ref({});
// 存储每个挑战的打卡状态，格式：{ challengeId: true/false }
const checkedInStatus = ref({});

// 弹窗相关变量
const currentChallengeId = ref(null);

// 检查打卡状态
const checkCheckInStatus = async (challengeId) => {
  try {
    const currentUserId = getCurrentUserId();
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('未登录，跳过检查打卡状态');
      return;
    }
    
    // 尝试使用GET请求
    const response = await fetch(`/api/checkin?challenge_id=${challengeId}&user_id=${currentUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
      checkedInStatus.value[challengeId] = data.data?.todayCheckedIn || false;
    }
  } catch (error) {
    console.error('检查打卡状态失败:', error);
    // 即使出错，也尝试直接检查今天是否已打卡
    try {
      const currentUserId = getCurrentUserId();
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await fetch('/api/checkin/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            challenge_id: challengeId,
            user_id: currentUserId,
            proof: '完成了今天的训练'
          })
        });
        
        const data = await response.json();
        
        if (data.code === 400 && data.message.includes('今天已经打卡过了')) {
          checkedInStatus.value[challengeId] = true;
        }
      }
    } catch (checkError) {
      console.error('直接检查打卡状态失败:', checkError);
    }
  }
};

// 从API获取挑战活动数据
const fetchChallenges = async () => {
  try {
    loading.value = true;
    const response = await fetch('/api/challenge');
    const data = await response.json();
    if (data.code === 200) {
      challenges.value = data.data;
      
      // 遍历每个挑战，检查当前用户是否已报名和打卡
      for (const challenge of challenges.value) {
        await checkChallengeStatus(challenge.id);
        await checkCheckInStatus(challenge.id);
      }
    } else {
      console.error('获取挑战活动失败:', data.message);
    }
  } catch (error) {
    console.error('请求失败:', error);
  } finally {
    loading.value = false;
  }
};

// 检查单个挑战的报名状态
const checkChallengeStatus = async (challengeId) => {
  try {
    // 使用统一的用户ID获取函数
    const currentUserId = getCurrentUserId();
    console.log('使用用户ID:', currentUserId);
    
    // 发送GET请求到API，检查用户是否已报名
    console.log('准备发送检查报名状态请求:', {
      challengeId: challengeId,
      userId: parseInt(currentUserId)
    });
    const response = await fetch(`/api/challenge/check?user_id=${parseInt(currentUserId)}&challenge_id=${challengeId}`);
    console.log('检查报名状态请求响应状态:', response.status);
    const data = await response.json();
    console.log('检查报名状态请求响应数据:', data);
    
    if (data.code === 200) {
      joinedStatus.value[challengeId] = data.data.isJoined;
    }
  } catch (error) {
    console.error('检查报名状态失败:', error);
  }
};



// 组件挂载时获取数据
onMounted(() => {
  fetchChallenges();
});

// 计算挑战进度
const calculateProgress = (challenge) => {
  if (challenge.status === 'ongoing') {
    // 计算已进行天数
    const startDate = new Date(challenge.start_date);
    const today = new Date();
    const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const totalDays = challenge.target_duration;
    return {
      percentage: Math.min(Math.round((daysPassed / totalDays) * 100), 100),
      text: `${daysPassed}/${totalDays}天`
    };
  } else if (challenge.status === 'completed') {
    return {
      percentage: 100,
      text: `${challenge.target_duration}/${challenge.target_duration}天`
    };
  } else {
    return {
      percentage: 0,
      text: `0/${challenge.target_duration}天`
    };
  }
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

// 显示参与挑战弹窗
const handleOpenDialog = (id, status) => {
  if (status === 'completed') {
    // 已结束的挑战，直接跳转到详情页
    navigateTo(`/challenge/${id}`);
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
          // 使用统一的用户ID获取函数
          const currentUserId = getCurrentUserId();
          console.log('使用用户ID:', currentUserId);
          
          // 发送POST请求到API
          console.log('准备发送参与挑战请求:', {
            challengeId: currentChallengeId.value,
            userId: parseInt(currentUserId)
          });
          const response = await fetch(`/api/challenge/${currentChallengeId.value}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: parseInt(currentUserId),
            }),
          });
          console.log('参与挑战请求响应状态:', response.status);
          const data = await response.json();
          console.log('参与挑战请求响应数据:', data);
          
          if (data.code === 200) {
            ElMessage.success('参与挑战成功！');
            // 重新获取挑战列表（包含最新的人数）
            fetchChallenges();
            // 跳转到加入成功页面
            navigateTo(`/challenge/${currentChallengeId.value}/success`);
          } else {
            // 显示错误提示
            ElMessage.error(data.message || '参与挑战失败');
          }
        } catch (error) {
          console.error('参与挑战失败:', error);
          ElMessage.error('网络请求失败，请重试');
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
        // 使用统一的用户ID获取函数
        const currentUserId = getCurrentUserId();
        console.log('使用用户ID:', currentUserId);
        
        // 发送DELETE请求到API
        console.log('准备发送取消参与挑战请求:', {
          challengeId: id,
          userId: parseInt(currentUserId)
        });
        const response = await fetch(`/api/challenge/${id}/participation`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: parseInt(currentUserId),
          }),
        });
        console.log('取消参与挑战请求响应状态:', response.status);
        const data = await response.json();
        console.log('取消参与挑战请求响应数据:', data);
        
        if (data.code === 200) {
          ElMessage.success('取消参与成功！');
          // 重新获取挑战列表（包含最新的人数）
          fetchChallenges();
        } else {
          // 显示错误提示
          ElMessage.error(data.message || '取消参与失败');
        }
      } catch (error) {
        console.error('取消参与挑战失败:', error);
        ElMessage.error('网络请求失败，请重试');
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

// 格式化日期函数
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};
</script>

<style scoped lang="scss">
.challenge-page {
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




/* 加载和空状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.empty-container {
  padding: 40px 0;
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
  
  /* 响应式调整 */
  .challenge-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .challenge-actions {
    flex-direction: column;
  }
  
  .challenge-actions el-button {
    width: 100%;
  }
  
  .loading-container,
  .empty-container {
    padding: 20px 0;
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