<template>
  <div class="challenge-detail-page">
    <!-- 返回首页链接 -->
    <div class="back-to-home">
      <router-link to="/home" style="color: #409EFF; text-decoration: none;">
        <el-icon><ArrowLeft /></el-icon>
        <span style="margin-left: 5px;">返回首页</span>
      </router-link>
    </div>
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
            <span :class="['challenge-badge', getStatusClass(getChallengeStatus(challenge.start_date, challenge.target_duration).text)]">
              {{ getChallengeStatus(challenge.start_date, challenge.target_duration).text }}
            </span>
            <span class="challenge-date">
              {{ getDateRange(challenge.start_date, challenge.target_duration) }}
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
            <el-button v-if="isParticipated && getChallengeStatus(challenge.start_date, challenge.target_duration).text === '进行中'" :type="isCheckedIn ? 'success' : 'primary'" size="default" @click="handleCheckIn" :loading="checkInLoading">
              {{ isCheckedIn ? '打卡完成🚀继续保持' : '打卡' }}
            </el-button>
            <el-button v-else-if="isParticipated" type="success" size="default" @click="handleCancelParticipation(challenge.id)">
              已报名
            </el-button>
            <el-button v-else-if="getChallengeStatus(challenge.start_date, challenge.target_duration).text !== '已结束'" type="primary" size="default" @click="handleJoinChallenge(challenge.id)">
              {{ getPrimaryButtonText(challenge.start_date, challenge.target_duration) }}
            </el-button>
            <el-button v-else type="primary" size="default" @click="handleJoinChallenge(challenge.id)">
              {{ getPrimaryButtonText(challenge.start_date, challenge.target_duration) }}
            </el-button>
          </div>
        </div>
      </div>
    </main>
    

    

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, navigateTo } from "nuxt/app";
import {
  HomeFilled,
  VideoPlay,
  Food,
  Aim,
  ArrowLeft
} from "@element-plus/icons-vue";
import { ElMessage, ElButton, ElDialog, ElMessageBox } from "element-plus";
import dayjs from 'dayjs';

// 日期处理工具函数
const formatDate = (dateString) => {
  if (!dateString) return '';
  return dayjs(dateString).format('YYYY/MM/DD');
};

// 计算日期范围
const getDateRange = (startDate, duration) => {
  if (!startDate || !duration) return '';
  const start = dayjs(startDate);
  const end = start.add(duration - 1, 'day');
  return `${start.format('YYYY/MM/DD')} - ${end.format('YYYY/MM/DD')}`;
};

// 获取挑战状态
const getChallengeStatus = (startDate, targetDuration) => {
  if (!startDate || !targetDuration) return { text: '未知状态', type: 'info' };
  const today = dayjs().startOf('day');
  const start = dayjs(startDate).startOf('day');
  const end = start.add(targetDuration - 1, 'day');

  if (today.isBefore(start)) {
    return { text: '即将开始', type: 'info' };
  } else if (today.isAfter(end)) {
    return { text: '已结束', type: 'info' };
  } else {
    // 只要今天在开始日期和结束日期之间，都应该是「进行中」或「立即打卡」
    return { text: '进行中', type: 'success' };
  }
};

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

const route = useRoute();
const challenge = ref(null);
const loading = ref(true);
const error = ref(null);
const isParticipated = ref(false); // 控制按钮显示的关键状态
const isCheckedIn = ref(false); // 控制打卡状态
const checkInLoading = ref(false); // 控制打卡按钮加载状态

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
    const currentUserId = getCurrentUserId();
    
    // 检查用户是否已参与
    const response = await fetch(`/api/challenge/check?user_id=${currentUserId}&challenge_id=${route.params.id}`);
    
    const data = await response.json();
    
    if (data.code === 200) {
      isParticipated.value = data.data.isJoined;
    }
  } catch (err) {
    console.error('检查报名状态失败:', err);
  }
};

// 用户挑战状态
const challengeStatus = ref(''); // 可能的值：'not_participated', 'participated', 'completed'
const userAchievements = ref([]);

// 检查用户挑战状态
const checkChallengeStatus = async () => {
  try {
    const currentUserId = getCurrentUserId(); // 使用统一的用户ID获取函数
    
    const response = await fetch(`/api/challenge/check?user_id=${currentUserId}&challenge_id=${route.params.id}`);
    const data = await response.json();
    
    if (data.code === 200) {
      isParticipated.value = data.data.isJoined;
      if (data.data.isJoined) {
        // 检查是否完成
        if (data.data.isCompleted) {
          challengeStatus.value = 'completed';
          // 检查是否已经获得勋章
          await checkAchievement();
        } else {
          challengeStatus.value = 'participated';
        }
      } else {
        challengeStatus.value = 'not_participated';
      }
    }
  } catch (error) {
    console.error('检查挑战状态失败:', error);
  }
};

// 检查用户是否已获得勋章
const checkAchievement = async () => {
  try {
    const currentUserId = getCurrentUserId();
    
    // 获取用户成就
    const response = await fetch(`/api/user-achievements?user_id=${currentUserId}`);
    const data = await response.json();
    
    if (data.code === 200) {
      userAchievements.value = data.data;
    }
  } catch (error) {
    console.error('获取勋章列表失败:', error);
  }
};

// 颁发勋章
const awardAchievement = async () => {
  try {
    const currentUserId = getCurrentUserId(); // 使用统一的用户ID获取函数
    const achievementCode = 'challenge_finisher';
    
    const response = await fetch('/api/award-achievement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: currentUserId,
        achievementCode: achievementCode
      }),
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
      ElMessage.success('恭喜获得挑战勋章！');
      // 更新勋章列表
      userAchievements.value = data.data.allAchievements;
    }
  } catch (error) {
    console.error('颁发勋章失败:', error);
  }
};

// 检查打卡状态
const checkCheckInStatus = async () => {
  try {
    console.log('开始检查打卡状态');
    const currentUserId = getCurrentUserId();
    const challengeId = route.params.id;
    
    // 直接获取token
    const token = localStorage.getItem('token');
    
    console.log('检查打卡状态参数:', { challengeId, currentUserId, token: token ? '存在' : '不存在' });
    
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
    
    console.log('检查打卡状态API响应状态:', response.status);
    const data = await response.json();
    console.log('检查打卡状态API响应数据:', data);
    
    if (data.code === 200) {
      console.log('检查打卡状态成功，设置isCheckedIn为:', data.data?.todayCheckedIn || false);
      isCheckedIn.value = data.data?.todayCheckedIn || false;
    } else {
      console.log('检查打卡状态失败，响应码:', data.code, '消息:', data.message);
    }
  } catch (error) {
    console.error('检查打卡状态失败:', error);
    // 即使出错，也尝试直接检查今天是否已打卡
    try {
      const currentUserId = getCurrentUserId();
      const challengeId = route.params.id;
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
        console.log('直接检查打卡状态响应:', data);
        
        if (data.code === 400 && data.message.includes('今天已经打卡过了')) {
          console.log('检测到今天已打卡，设置isCheckedIn为true');
          isCheckedIn.value = true;
        }
      }
    } catch (checkError) {
      console.error('直接检查打卡状态失败:', checkError);
    }
  }
};

// 处理打卡
const handleCheckIn = async () => {
  try {
    console.log('开始打卡操作');
    checkInLoading.value = true;
    const currentUserId = getCurrentUserId();
    const challengeId = route.params.id;
    
    // 查看localStorage中的所有内容
    console.log('localStorage内容:', Object.fromEntries(Object.entries(localStorage)));
    
    // 直接获取token
    const token = localStorage.getItem('token');
    
    console.log('打卡参数:', { challengeId, currentUserId, token: token ? '存在' : '不存在', tokenValue: token });
    
    if (!token) {
      ElMessage.error('请先登录');
      return;
    }
    
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
    
    console.log('打卡API响应状态:', response.status);
    const data = await response.json();
    console.log('打卡API响应数据:', data);
    
    if (data.code === 200) {
      console.log('打卡成功，设置isCheckedIn为true');
      isCheckedIn.value = true;
      ElMessage.success('打卡成功！');
    } else {
      console.log('打卡失败:', data.message);
      ElMessage.error(data.message || '打卡失败');
    }
  } catch (error) {
    console.error('打卡失败:', error);
    ElMessage.error('网络错误，请稍后再试');
  } finally {
    checkInLoading.value = false;
    console.log('打卡操作完成');
  }
};

// 显示参与挑战弹窗
const handleJoinChallenge = (id) => {
  if (challenge.value && getChallengeStatus(challenge.value.start_date, challenge.value.target_duration).text === '已结束') {
    // 已结束的挑战，显示结果
    showChallengeResult();
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
            // 参与成功，更新报名状态
            isParticipated.value = true;
            challengeStatus.value = 'participated';
            ElMessage.success('参与挑战成功！');
            // 重新获取挑战详情（包含最新的人数）
            fetchChallengeDetail();
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

// 显示挑战结果
const showChallengeResult = async () => {
  try {
    // 检查挑战状态
    await checkChallengeStatus();
    
    // 根据状态显示不同的结果
    if (challengeStatus.value === 'completed') {
      // 已完成，显示勋章
      if (userAchievements.value.length === 0) {
        // 还没有勋章，颁发勋章
        await awardAchievement();
      }
      
      // 显示成功弹窗
      ElMessageBox.alert(
        `<div style="text-align: center;">
          <h3>挑战完成！</h3>
          <p>恭喜你完成了挑战，获得了勋章！</p>
          ${userAchievements.value.length > 0 ? `
            <div style="margin: 20px 0;">
              <img src="${userAchievements.value[0].icon_url || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=golden%20trophy%20medal&size=512x512'}" style="width: 100px; height: 100px; border-radius: 50%;" />
              <p style="margin-top: 10px; font-weight: bold;">${userAchievements.value[0].name}</p>
              <p style="color: #666;">${userAchievements.value[0].description}</p>
            </div>
          ` : ''}
        </div>`,
        '挑战结果',
        {
          confirmButtonText: '确定',
          dangerouslyUseHTMLString: true
        }
      );
    } else if (challengeStatus.value === 'participated') {
      // 参与了但未完成
      ElMessageBox.alert(
        `<div style="text-align: center;">
          <h3>挑战未完成</h3>
          <p>虽然你参与了挑战，但未能完成所有任务</p>
          <p style="margin-top: 10px; color: #666;">下次继续努力！</p>
        </div>`,
        '挑战结果',
        {
          confirmButtonText: '确定',
          dangerouslyUseHTMLString: true
        }
      );
    } else {
      // 未参与
      ElMessageBox.alert(
        `<div style="text-align: center;">
          <h3>未参与挑战</h3>
          <p>你还没有参与这个挑战</p>
          <p style="margin-top: 10px; color: #666;">下次记得积极参与哦！</p>
        </div>`,
        '挑战结果',
        {
          confirmButtonText: '确定',
          dangerouslyUseHTMLString: true
        }
      );
    }
  } catch (error) {
    console.error('显示挑战结果失败:', error);
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
  checkChallengeStatus();
  checkCheckInStatus();
});



// 获取状态标签类名
const getStatusClass = (statusText) => {
  switch (statusText) {
    case '进行中':
      return '';
    case '即将开始':
      return 'upcoming';
    case '已结束':
      return 'completed';
    default:
      return '';
  }
};

// 获取主要按钮文本
const getPrimaryButtonText = (startDate, targetDuration) => {
  const status = getChallengeStatus(startDate, targetDuration).text;
  switch (status) {
    case '进行中':
      return '立即参与';
    case '即将开始':
      return '预约参与';
    case '已结束':
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



/* 返回首页链接样式 */
.back-to-home {
  margin: 10px 20px;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: #f0f9ff;
  display: inline-block;
  transition: all 0.3s ease;
}

.back-to-home:hover {
  background-color: #ecf5ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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