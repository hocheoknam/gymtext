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
        <div class="header-section" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2>挑战中心</h2>
          <el-button v-if="userRole === 'admin'" type="primary" @click="dialogVisible = true">
            + 发布新挑战
          </el-button>
        </div>
        <p>欢迎来到挑战中心页面，这里将展示各种健身挑战活动。</p>
        
        <!-- 发布挑战弹窗 -->
        <el-dialog
          v-model="dialogVisible"
          title="🚀 发布全新健身挑战"
          width="500px"
          destroy-on-close
          class="challenge-dialog"
        >
          <el-form :model="form" label-position="top" class="p-4">
            <el-form-item label="挑战主题" required>
              <el-input v-model="form.title" placeholder="如：14天夏日燃脂营" prefix-icon="Trophy" />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="挑战目标 (天)">
                  <el-input-number v-model="form.duration_days" :min="1" :step="7" class="w-full" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="开始日期">
                  <el-date-picker
                    v-model="form.start_date"
                    type="date"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD"
                    class="w-full"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="挑战描述">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                placeholder="写下挑战的规则或激励语..."
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-form>

          <template #footer>
            <div class="flex justify-end gap-2 px-4 pb-4">
              <el-button @click="dialogVisible = false">取消</el-button>
              <el-button
                type="primary"
                :loading="submitting"
                @click="submitChallenge"
                class="px-8"
              >
                确认发布
              </el-button>
            </div>
          </template>
        </el-dialog>
        
        <!-- 挑战活动列表 -->
        <div v-if="loading" class="loading-container">
          <el-button type="primary" loading>加载中...</el-button>
        </div>
        <div v-else-if="challenges.length === 0" class="empty-container">
          <el-empty description="暂无挑战活动">
            <el-button type="primary">刷新</el-button>
          </el-empty>
        </div>
        <div v-else>
          <!-- 进行中挑战 -->
          <div v-if="groupedChallenges.ongoing.length > 0" class="challenge-section">
            <h3 class="section-title">进行中</h3>
            <div class="challenge-list">
              <div v-for="challenge in groupedChallenges.ongoing" :key="challenge.id" class="challenge-card">
                <div class="challenge-header">
                  <h2>{{ challenge.title }}</h2>
                  <span :class="['challenge-badge', getStatusClass(getStatusText(challenge.start_date, challenge.target_duration))]">{{ getStatusText(challenge.start_date, challenge.target_duration) }}</span>
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
                      <span class="stat-value">{{ challenge.completion_rate }}%</span>
                      <span class="stat-label">完成率</span>
                    </div>
                  </div>
                </div>
                <div class="challenge-actions">
                  <el-button v-if="joinedStatus[challenge.id]" :type="checkedInStatus[challenge.id] ? 'success' : 'primary'" size="default" @click="navigateTo(`/challenge/${challenge.id}`)">
                    {{ checkedInStatus[challenge.id] ? '已打卡' : '打卡' }}
                  </el-button>
                  <el-button v-else type="primary" size="default" @click="handleOpenDialog(challenge.id, challenge.start_date, challenge.target_duration)">{{ getPrimaryButtonText(challenge.start_date, challenge.target_duration) }}</el-button>
                  <NuxtLink :to="`/challenge/${challenge.id}`">
                    <el-button size="default">查看详情</el-button>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- 即将开始挑战 -->
          <div v-if="groupedChallenges.upcoming.length > 0" class="challenge-section">
            <h3 class="section-title">即将开始</h3>
            <div class="challenge-list">
              <div v-for="challenge in groupedChallenges.upcoming" :key="challenge.id" class="challenge-card">
                <div class="challenge-header">
                  <h2>{{ challenge.title }}</h2>
                  <span :class="['challenge-badge', getStatusClass(getStatusText(challenge.start_date, challenge.target_duration))]">{{ getStatusText(challenge.start_date, challenge.target_duration) }}</span>
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
                      <span class="stat-label">开始时间：{{ formatDate(challenge.start_date) }}</span>
                    </div>
                  </div>
                </div>
                <div class="challenge-actions">
                  <el-button v-if="joinedStatus[challenge.id]" type="success" size="default" @click="handleCancelParticipation(challenge.id)">
                    已参与
                  </el-button>
                  <el-button v-else type="primary" size="default" @click="handleOpenDialog(challenge.id, challenge.start_date, challenge.target_duration)">{{ getPrimaryButtonText(challenge.start_date, challenge.target_duration) }}</el-button>
                  <NuxtLink :to="`/challenge/${challenge.id}`">
                    <el-button size="default">查看详情</el-button>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- 已结束挑战 -->
          <div v-if="groupedChallenges.completed.length > 0" class="challenge-section">
            <h3 class="section-title">已结束</h3>
            <div class="challenge-list">
              <div v-for="challenge in groupedChallenges.completed" :key="challenge.id" class="challenge-card">
                <div class="challenge-header">
                  <h2>{{ challenge.title }}</h2>
                  <span :class="['challenge-badge', getStatusClass(getStatusText(challenge.start_date, challenge.target_duration))]">{{ getStatusText(challenge.start_date, challenge.target_duration) }}</span>
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
                      <span class="stat-value">{{ challenge.completion_rate }}%</span>
                      <span class="stat-label">完成率</span>
                    </div>
                  </div>
                </div>
                <div class="challenge-actions">
                  <el-button size="default" @click="handleOpenDialog(challenge.id, challenge.start_date, challenge.target_duration)">{{ getPrimaryButtonText(challenge.start_date, challenge.target_duration) }}</el-button>
                  <NuxtLink :to="`/challenge/${challenge.id}`">
                    <el-button size="default">查看详情</el-button>
                  </NuxtLink>
                </div>
              </div>
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
import { ElButton, ElDialog, ElMessage, ElMessageBox, ElNotification } from "element-plus";
import dayjs from 'dayjs';

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

// 分组挑战
const groupedChallenges = computed(() => {
  const today = dayjs().startOf('day');
  
  return {
    ongoing: challenges.value.filter(challenge => {
      const start = dayjs(challenge.start_date).startOf('day');
      const end = start.add(challenge.target_duration - 1, 'day');
      return !today.isBefore(start) && !today.isAfter(end);
    }),
    upcoming: challenges.value.filter(challenge => {
      const start = dayjs(challenge.start_date).startOf('day');
      return today.isBefore(start);
    }),
    completed: challenges.value.filter(challenge => {
      const start = dayjs(challenge.start_date).startOf('day');
      const end = start.add(challenge.target_duration - 1, 'day');
      return today.isAfter(end);
    })
  };
});

// 存储每个挑战的报名状态，格式：{ challengeId: true/false }
const joinedStatus = ref({});
// 存储每个挑战的打卡状态，格式：{ challengeId: true/false }
const checkedInStatus = ref({});

// 弹窗相关变量
const currentChallengeId = ref(null);

// 用户角色和发布挑战相关变量
const userRole = ref('');
const dialogVisible = ref(false);
const submitting = ref(false);

// 表單初始數據
const form = ref({
  title: '',
  description: '',
  duration_days: 7,
  start_date: ''
});

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



// 提交挑戰到後端
const submitChallenge = async () => {
  if(!form.value.title || !form.value.start_date) {
    return ElMessage.error('请填写完整的标题和日期');
  }

  submitting.value = true;
  try {
    // 准备提交数据，确保字段名与后端一致
    const submitData = {
      title: form.value.title,
      description: form.value.description,
      target_duration: form.value.duration_days, // 转换为后端需要的字段名
      start_date: form.value.start_date,
      userRole: userRole.value // 將管理員身份傳給後端校驗
    };

    const res = await $fetch('/api/create_challenge', {
      method: 'POST',
      body: submitData
    });

    if (res.code === 200) {
      ElNotification({
        title: '发布成功',
        message: '新挑战已同步至所有用户的挑战中心',
        type: 'success',
      });
      dialogVisible.value = false;
      // 重置表單
      form.value = { title: '', description: '', duration_days: 7, start_date: '' };
      // 重新獲取列表，讓新挑戰立刻顯示
      fetchChallenges();
    }
  } catch (err) {
    ElMessage.error('发布失败，请检查网络');
  } finally {
    submitting.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  const info = localStorage.getItem('user_info');
  console.log("目前讀取到的用戶資訊字符串:", info);
  
  if (info) {
    const userInfo = JSON.parse(info);
    userRole.value = userInfo.role;
    console.log("當前角色是:", userRole.value);
  } else {
    console.error("LocalStorage 裡找不到 user_info！按鈕不會顯示。");
  }
  fetchChallenges();
});

// 计算挑战进度
const calculateProgress = (challenge) => {
  if (getChallengeStatus(challenge.start_date, challenge.target_duration).text === '进行中') {
    // 计算已进行天数
    const startDate = dayjs(challenge.start_date);
    const today = dayjs();
    const daysPassed = today.diff(startDate, 'day') + 1;
    const totalDays = challenge.target_duration;
    return {
      percentage: Math.min(Math.round((daysPassed / totalDays) * 100), 100),
      text: `${daysPassed}/${totalDays}天`
    };
  } else if (getChallengeStatus(challenge.start_date, challenge.target_duration).text === '已结束') {
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

// 获取状态标签文本
const getStatusText = (startDate, targetDuration) => {
  return getChallengeStatus(startDate, targetDuration).text;
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

// 显示参与挑战弹窗
const handleOpenDialog = (id, startDate, targetDuration) => {
  if (getChallengeStatus(startDate, targetDuration).text === '已结束') {
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
  return dayjs(dateString).format('YYYY/MM/DD');
};
</script>

<style scoped lang="scss">
.challenge-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.challenge-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
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

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-actions h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.challenge-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.challenge-dialog :deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px 24px 15px;
  border-bottom: 1px solid #f0f2f5;
  background: #fafafa;
}

.challenge-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.challenge-dialog :deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
  padding-bottom: 8px;
}

.challenge-dialog :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.challenge-dialog :deep(.el-textarea__inner) {
  border-radius: 8px;
  resize: none;
}

.challenge-dialog :deep(.el-input-number) {
  border-radius: 8px;
}

.challenge-dialog :deep(.el-date-picker__wrapper) {
  border-radius: 8px;
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