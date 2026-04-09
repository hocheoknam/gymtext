<template>
  <div class="dashboard">
    <!-- 顶部导航栏 -->
    <header class="top-nav">
      <div class="nav-container">
        <!-- 左侧Logo -->
        <div class="logo">
          <!-- 使用Element Plus图标替代SVG -->
          <div class="logo-icon">
            <el-icon size="28"><HomeFilled /></el-icon>
          </div>
          <span class="logo-text">健身助手</span>
        </div>

        <!-- 中间导航菜单 -->
        <nav class="nav-menu">
          <ul class="nav-list">
              <li class="nav-item active">
                <NuxtLink to="/home" class="nav-link">首页</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/action" class="nav-link">训练库</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/eat" class="nav-link">饮食指南</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/challenge" class="nav-link">挑战中心</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/data" class="nav-link">数据中心</NuxtLink>
              </li>
            </ul>
        </nav>

        <!-- 右侧功能区 -->
        <div class="nav-actions">
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <!-- 快捷功能入口 -->
        <div class="quick-actions">
          <div class="action-cards">
            <!-- 定制计划 -->
            <div class="action-card" @click="handleQuickAction('customPlan')">
              <div class="action-icon">
                <el-icon size="32"><Edit /></el-icon>
              </div>
              <span class="action-name">定制计划</span>
            </div>

            <!-- 记录饮食 -->
            <div class="action-card" @click="handleQuickAction('recordDiet')">
              <div class="action-icon">
                <el-icon size="32"><Food /></el-icon>
              </div>
              <span class="action-name">记录饮食</span>
            </div>

            <!-- 运动打卡 -->
            <div
              class="action-card"
              @click="handleQuickAction('exerciseCheckin')"
            >
              <div class="action-icon">
                <el-icon size="32"><VideoPlay /></el-icon>
              </div>
              <span class="action-name">运动打卡</span>
            </div>
          </div>
        </div>

        <!-- 今日打卡区域 -->
        <el-card class="today-checkin-card" v-loading="isLoadingData">
          <template #header>
            <div class="card-header">
              <span>今日打卡</span>
              <span class="date-info">{{ todayDate }}</span>
            </div>
          </template>

          <div class="checkin-content">
            <div v-if="!isTodayCheckedIn" class="uncheck-status">
              <el-icon class="uncheck-icon"><CircleClose /></el-icon>
              <p>今日未打卡</p>

              <!-- 打卡表单 -->
                <client-only>
                  <el-form
                    :model="checkinForm"
                    :rules="rules"
                    ref="checkinFormRef"
                    class="checkin-form"
                  >
                    <el-form-item label="训练内容" prop="exercises">
                      <div class="exercise-select-container">
                        <el-select
                          v-model="selectedExercise"
                          placeholder="请选择或输入训练内容"
                          style="flex: 1"
                          :loading="isLoadingExercises"
                          filterable
                          allow-create
                        >
                          <el-option
                            v-for="item in exerciseList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.name"
                          >
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                              <span>{{ item.name }}</span>
                              <span style="color: #909399; font-size: 12px;">{{ item.category }}</span>
                            </div>
                          </el-option>
                        </el-select>
                        <el-button type="primary" @click="addExercise" style="margin-left: 10px;">添加</el-button>
                      </div>
                    </el-form-item>
                    
                    <!-- 训练内容详情 -->
                    <div v-if="checkinForm.exercises.length > 0" class="exercise-details">
                      <h3>训练详情</h3>
                      <div v-for="(exercise, index) in checkinForm.exercises" :key="index" class="exercise-item">
                        <div class="exercise-info">
                          <span class="exercise-name">{{ exercise.name }}</span>
                          <el-button type="danger" size="small" @click="removeExercise(index)">删除</el-button>
                        </div>
                        <div class="sets-reps-container">
                          <el-form-item label="组数">
                            <el-input-number v-model="exercise.sets" :min="1" :max="20" :step="1" style="width: 100px;"></el-input-number>
                          </el-form-item>
                          <el-form-item label="次数">
                            <el-input-number v-model="exercise.reps" :min="1" :max="100" :step="1" style="width: 100px;"></el-input-number>
                          </el-form-item>
                        </div>
                      </div>
                    </div>
                    <el-form-item label="训练时长" prop="duration">
                      <div class="duration-container">
                        <el-input-number
                          v-model="checkinForm.duration"
                          :min="1"
                          :max="600"
                          :step="5"
                          placeholder="请输入训练时长"
                          class="duration-input"
                        ></el-input-number>
                        <span class="duration-unit">分钟</span>
                      </div>
                    </el-form-item>
                    <el-form-item label="打卡位置" prop="location">
                      <div class="location-input-container">
                        <el-input
                          v-model="checkinForm.location"
                          placeholder="请输入打卡位置"
                          class="location-input"
                        ></el-input>
                        <el-button
                          type="primary"
                          @click="getCurrentLocation"
                          :disabled="isGettingLocation"
                          class="get-location-btn"
                        >
                          {{ isGettingLocation ? '获取中...' : '获取位置' }}
                        </el-button>
                      </div>
                      <div v-if="locationAccuracy !== null" class="location-accuracy">
                        <el-icon><InfoFilled /></el-icon>
                        <span>定位精度：{{ locationAccuracy }} 米</span>
                      </div>
                      <div class="location-tip">
                        <el-icon><InfoFilled /></el-icon>
                        <span>提示：如果定位不准确，可手动输入位置</span>
                      </div>
                    </el-form-item>
                  </el-form>
                  <template #placeholder>
                    <div class="skeleton-container">
                      <el-skeleton :rows="3" animated />
                    </div>
                  </template>
                </client-only>
              <el-button
                type="primary"
                size="large"
                @click="handleCheckin"
                :loading="isLoading"
                style="margin-top: 20px;"
              >
                立即打卡
              </el-button>
            </div>

            <div v-else class="achievement-status">
              <div class="success-header">
                <el-result icon="success" title="今日训练已达成" sub-title="你是最棒的！">
                </el-result>
              </div>
              
              <div class="achievement-grid">
                <div class="achieve-item">
                  <span class="label">消耗热量</span>
                  <span class="value">{{ todayAchievement?.calories }} kcal</span>
                </div>
                <div class="achieve-item">
                  <span class="label">训练时长</span>
                  <span class="value">{{ todayAchievement?.duration }} min</span>
                </div>
              </div>

              <div class="weekly-checkin">
                <h4>本周运动进度</h4>
                <div class="days-container">
                  <div v-for="day in weekStatus" :key="day.name" class="day-item">
                    <div class="day-label">{{ day.name }}</div>
                    
                    <div class="status-box" :class="day.status">
                      <el-icon v-if="day.status === 'checked'">
                        <Check />
                      </el-icon>
                      
                      <el-icon v-if="day.status === 'missed'">
                        <Close />
                      </el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 打卡统计区域 -->
        <el-row :gutter="20" class="stats-section">
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ totalCheckins }}</div>
                <div class="stat-label">总打卡次数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ currentStreak }}</div>
                <div class="stat-label">当前连续天数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ bestStreak }}</div>
                <div class="stat-label">最长连续天数</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 打卡记录列表 -->
        <el-card class="records-card">
          <template #header>
            <div class="card-header">
              <span>打卡记录</span>
            </div>
          </template>

          <div v-if="checkinRecords.length > 0">
            <el-timeline>
              <el-timeline-item
                v-for="record in checkinRecords"
                :key="record.id"
                :timestamp="formatDateTime(record.time)"
                placement="top"
              >
                <el-card>
                  <div class="record-content">
                    <div class="record-info">
                      <div class="record-title">健身打卡</div>
                      <div class="record-date">{{ formatDate(record.time) }}</div>
                      <div class="record-time">{{ formatTime(record.time) }}</div>
                    </div>
                    <div class="record-details">
                      <div class="exercise-info">
                        <div v-if="Array.isArray(record.exercises) && record.exercises.length > 0">
                          <p class="exercise-content">
                            <span class="label">训练内容：</span>
                          </p>
                          <div class="exercise-list">
                            <div v-for="(exercise, index) in record.exercises" :key="index" class="record-exercise-item">
                              <span class="exercise-name">{{ exercise.name || exercise }}</span>
                              <span v-if="exercise.sets && exercise.reps" class="exercise-sets-reps">({{ exercise.sets }}组 × {{ exercise.reps }}次)</span>
                            </div>
                          </div>
                        </div>
                        <p v-else-if="record.exercise" class="exercise-content">
                          <span class="label">训练内容：</span>
                          <span class="value">{{ record.exercise }}</span>
                        </p>
                        <p v-if="record.duration" class="exercise-duration">
                          <span class="label">训练时长：</span>
                          <span class="value">{{ record.duration }} 分钟</span>
                        </p>
                        <p v-if="record.location" class="exercise-location">
                          <span class="label">打卡位置：</span>
                          <span class="value">{{ record.location }}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
          <div v-else class="no-records">
            <el-empty description="暂无打卡记录" />
          </div>
        </el-card>
      </div>
    </main>

    <!-- 底部导航栏 -->
    <footer class="bottom-nav">
      <div class="nav-items">
        <div class="nav-item active">
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

        <div class="nav-item">
          <div class="nav-icon">
            <el-icon><Tools /></el-icon>
          </div>
          <span class="nav-text">工具</span>
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

<script setup>
// 导入必要的函数
import { ref, onMounted, computed } from "vue";
import { navigateTo } from "nuxt/app";
import { ElMessage, ElForm, ElFormItem, ElSelect, ElOption, ElButton, ElInputNumber, ElInput, ElCard, ElRow, ElCol, ElTimeline, ElTimelineItem, ElEmpty } from "element-plus";
// 导入Element Plus图标组件
import {
  HomeFilled,
  Search,
  Message,
  Bell,
  User,
  Edit,
  Aim,
  VideoPlay,
  ShoppingCart,
  Calendar,
  List,
  Close,
  Check,
  Food,
  ChatLineSquare,
  Tools,
  CircleCheck,
  CircleClose,
  InfoFilled
} from "@element-plus/icons-vue";

// 打卡功能相关变量
const checkinRecords = ref([]);
const hasCheckedToday = ref(false);
const todayCheckinTime = ref('');
const todayCheckinData = ref(null);
const isLoading = ref(false);
const isGettingLocation = ref(false);
const locationAccuracy = ref(null);
const isLoadingExercises = ref(false);
const isLoadingData = ref(true);
const todayDate = ref('');
const exerciseList = ref([]);
const isTodayCheckedIn = ref(false); // 默认未打卡
const todayAchievement = ref(null);   // 存储今日打卡的总结数据
const weekStatus = ref([
  { name: '周一', status: 'pending' }, // pending: 还没到, checked: 已打卡, missed: 漏打
  { name: '周二', status: 'pending' },
  { name: '周三', status: 'pending' },
  { name: '周四', status: 'pending' },
  { name: '周五', status: 'pending' },
  { name: '周六', status: 'pending' },
  { name: '周日', status: 'pending' },
]);
const checkinForm = ref({
  exercises: [],
  duration: null,
  location: ''
});
const selectedExercise = ref('');
const checkinFormRef = ref(null);
const rules = ref({
  exercises: [
    { required: true, message: '请选择训练内容', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请输入训练时长', trigger: 'blur' },
    { type: 'number', min: 1, message: '训练时长至少为1分钟', trigger: 'blur' },
  ],
  location: [
    { required: true, message: '请输入或获取打卡位置', trigger: 'blur' },
  ],
});

// 计算属性
const totalCheckins = computed(() => {
  return checkinRecords.value.length;
});

const currentStreak = computed(() => {
  if (checkinRecords.value.length === 0) return 0;

  const sortedRecords = [...checkinRecords.value].sort((a, b) =>
    new Date(b.time) - new Date(a.time)
  );

  let streak = 0;
  const today = new Date().setHours(0, 0, 0, 0);

  if (new Date(sortedRecords[0].time).setHours(0, 0, 0, 0) === today) {
    streak = 1;
    for (let i = 1; i < sortedRecords.length; i++) {
      const currentDate = new Date(sortedRecords[i - 1].time);
      const previousDate = new Date(sortedRecords[i].time);
      const daysDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) streak++;
      else break;
    }
  }
  return streak;
});

const bestStreak = computed(() => {
  if (checkinRecords.value.length === 0) return 0;

  const sortedRecords = [...checkinRecords.value].sort((a, b) =>
    new Date(b.time) - new Date(a.time)
  );

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedRecords.length; i++) {
    const currentDate = new Date(sortedRecords[i - 1].time);
    const previousDate = new Date(sortedRecords[i].time);
    const daysDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (daysDiff > 1) {
      currentStreak = 1;
    }
  }
  return maxStreak;
});

// 生命周期钩子
onMounted(async () => {
  console.log("健身仪表盘页面已加载");
  await init();
});

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

// 获取本周一的零点
const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay() || 7; // 1-7, 周日为 7
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - (day - 1)); // 减去（今天周几-1）天，回到周一
  return start;
};

// 加载本周状态
const loadWeeklyStatus = (records) => {
  const startOfWeek = getStartOfWeek(); // 获取本周一 00:00:00
  const now = new Date();
  let today = now.getDay() || 7; // 1-7, 周日为 7

  weekStatus.value = weekStatus.value.map((day, index) => {
    const dayNum = index + 1; // 1代表周一
    
    // 关键修复：增加时间范围判断
    const hasRecordThisWeek = records.some(r => {
      const recordDate = new Date(r.time);
      // 条件：记录的“周几”匹配，且时间必须在“本周一”之后
      return (recordDate.getDay() || 7) === dayNum && recordDate >= startOfWeek;
    });

    if (hasRecordThisWeek) {
      return { ...day, status: 'checked' };
    } else if (dayNum < today) {
      return { ...day, status: 'missed' };
    } else {
      return { ...day, status: 'pending' };
    }
  });
};

// 初始化函数
const init = async () => {
  try {
    isLoadingData.value = true;
    setTodayDate();
    await loadCheckinRecords();
    checkTodayStatus();
    await loadExerciseList();
    
    // 更新打卡状态
    isTodayCheckedIn.value = hasCheckedToday.value;
    if (hasCheckedToday.value && todayCheckinData.value) {
      // 计算今日成就数据
      todayAchievement.value = {
        calories: Math.round((todayCheckinData.value.duration || 0) * 10), // 假设每分钟消耗10卡路里
        duration: todayCheckinData.value.duration || 0,
        exercises: todayCheckinData.value.exercises || []
      };
    }
    
    // 更新本周打卡状态
    loadWeeklyStatus(checkinRecords.value);
  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    isLoadingData.value = false;
  }
};

// 加载训练内容列表
const loadExerciseList = async () => {
  isLoadingExercises.value = true;
  try {
    const response = await fetch('/api/exercise_logs');
    if (!response.ok) throw new Error('网络请求失败');
    const data = await response.json();
    if (data.code === 200) {
      exerciseList.value = data.data || [];
    } else {
      console.error('获取训练内容失败:', data.message);
      exerciseList.value = [];
    }
  } catch (error) {
    console.error('加载训练内容失败:', error);
    exerciseList.value = [];
  } finally {
    isLoadingExercises.value = false;
  }
};

// 设置今日日期
const setTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  todayDate.value = `${year}-${month}-${day}`;
};

// 加载打卡记录
const loadCheckinRecords = async () => {
  try {
    const currentUserId = getCurrentUserId();
    const token = localStorage.getItem('token');
    
    // 构建请求头
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // 如果有token，添加到请求头
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('加载健身打卡记录，用户ID:', currentUserId);
    
    // 使用新的checkin-records端点获取健身打卡记录
    const recordsResponse = await fetch('/api/checkin-records', {
      method: 'GET',
      headers: headers
    });
    
    if (!recordsResponse.ok) throw new Error('网络请求失败');
    const recordsData = await recordsResponse.json();
    console.log('获取健身打卡记录响应:', recordsData);
    
    if (recordsData.code === 200) {
      checkinRecords.value = recordsData.data || [];
      checkinRecords.value.sort((a, b) => new Date(b.time) - new Date(a.time));
    } else {
      console.error('获取健身打卡记录失败:', recordsData.message);
      checkinRecords.value = [];
    }
  } catch (error) {
    console.error('加载健身打卡记录失败:', error);
    checkinRecords.value = [];
  }
};

// 检查今日打卡状态
const checkTodayStatus = () => {
  const today = new Date().setHours(0, 0, 0, 0);
  for (const record of checkinRecords.value) {
    const recordDate = new Date(record.time).setHours(0, 0, 0, 0);
    if (recordDate === today) {
      hasCheckedToday.value = true;
      todayCheckinTime.value = formatTime(record.time);
      todayCheckinData.value = {
        exercises: record.exercises || record.exercise, // 兼容旧数据
        duration: record.duration,
        location: record.location,
      };
      break;
    }
  }
};

// 处理打卡
const handleCheckin = () => {
  checkinFormRef.value.validate(async (valid) => {
    if (valid) {
      isLoading.value = true;
      try {
        const currentUserId = getCurrentUserId();
        const token = localStorage.getItem('token');
        
        // 准备打卡数据
        const checkinData = {
          user_id: currentUserId,
          exercises: checkinForm.value.exercises,
          duration: checkinForm.value.duration,
          location: checkinForm.value.location,
        };
        
        // 构建请求头
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // 如果有token，添加到请求头
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        console.log('发送健身打卡请求，数据:', checkinData);
        
        // 调用专门的健身打卡API保存打卡记录
        const response = await fetch('/api/checkin', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(checkinData),
        });
        
        if (!response.ok) throw new Error('网络请求失败');
        const data = await response.json();
        console.log('健身打卡响应:', data);
        
        if (data.code === 200) {
          // 保存成功后，重新加载打卡记录
          await loadCheckinRecords();
          // 检查今日打卡状态
          checkTodayStatus();
          
          // 更新打卡状态和成就数据
          isTodayCheckedIn.value = hasCheckedToday.value;
          if (hasCheckedToday.value && todayCheckinData.value) {
            // 计算今日成就数据
            todayAchievement.value = {
              calories: Math.round((todayCheckinData.value.duration || 0) * 10), // 假设每分钟消耗10卡路里
              duration: todayCheckinData.value.duration || 0,
              exercises: todayCheckinData.value.exercises || []
            };
          }
          
          // 更新本周打卡状态
          loadWeeklyStatus(checkinRecords.value);
          
          // 重置表单
          checkinForm.value = {
            exercises: [],
            duration: null,
            location: '',
          };
          ElMessage.success('健身打卡成功！');
        } else {
          console.error('健身打卡失败:', data.message);
          ElMessage.error('健身打卡失败: ' + data.message);
        }
      } catch (error) {
        console.error('健身打卡失败:', error);
        ElMessage.error('健身打卡失败，请重试');
      } finally {
        isLoading.value = false;
      }
    } else {
      return false;
    }
  });
};

// 添加训练内容
const addExercise = () => {
  if (!selectedExercise.value) {
    ElMessage.warning('请选择训练内容');
    return;
  }
  
  // 检查是否已经添加过相同的训练内容
  const exists = checkinForm.value.exercises.some(item => item.name === selectedExercise.value);
  if (exists) {
    ElMessage.warning('该训练内容已添加');
    return;
  }
  
  // 添加训练内容到列表
  checkinForm.value.exercises.push({
    name: selectedExercise.value,
    sets: 3,
    reps: 10
  });
  
  // 清空选择
  selectedExercise.value = '';
};

// 移除训练内容
const removeExercise = (index) => {
  checkinForm.value.exercises.splice(index, 1);
};

// 格式化日期时间
const formatDateTime = (time) => {
  const date = new Date(time);
  return `${formatDate(time)} ${formatTime(time)}`;
};

// 格式化日期
const formatDate = (time) => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 获取当前位置
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    ElMessage.error('您的浏览器不支持地理定位功能');
    return;
  }
  isGettingLocation.value = true;
  
  // 连续获取多次位置，取精度最高的结果
  const locationAttempts = [];
  const maxAttempts = 3;
  let attempts = 0;
  
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        attempts++;
        // 存储位置信息和精度
        locationAttempts.push({
          position: position,
          accuracy: position.coords.accuracy
        });
        
        // 如果还没达到最大尝试次数，继续获取
        if (attempts < maxAttempts) {
          // 短暂延迟后再次获取
          setTimeout(getLocation, 500);
        } else {
          // 所有尝试完成，选择精度最高的位置
          if (locationAttempts.length > 0) {
            // 按精度排序（精度值越小越精确）
            locationAttempts.sort((a, b) => a.accuracy - b.accuracy);
            // 使用精度最高的位置
            const bestLocation = locationAttempts[0].position;
            processLocationData(bestLocation).catch((error) => {
              console.error('处理位置数据时出错:', error);
              isGettingLocation.value = false;
              ElMessage.error('处理位置信息失败');
            });
          } else {
            isGettingLocation.value = false;
            ElMessage.error('获取位置失败');
          }
        }
      },
      (error) => {
        attempts++;
        console.error('获取位置失败:', error);
        
        // 如果还有尝试机会，继续尝试
        if (attempts < maxAttempts) {
          setTimeout(getLocation, 500);
        } else {
          isGettingLocation.value = false;
          let errorMessage = '获取位置失败';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '您拒绝了位置请求';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '位置信息不可用';
              break;
            case error.TIMEOUT:
              errorMessage = '获取位置超时';
              break;
          }
          ElMessage.error(errorMessage);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };
  
  // 开始获取位置
  getLocation();
};

// 处理位置数据
const processLocationData = async (position) => {
  const { latitude, longitude, accuracy } = position.coords;
  // 更新定位精度
  locationAccuracy.value = Math.round(accuracy);
  
  const locationAddress = await getLocationAddressByAmap(latitude, longitude);
  checkinForm.value.location = locationAddress || `经度: ${latitude.toFixed(6)}, 纬度: ${longitude.toFixed(6)}`;
  isGettingLocation.value = false;
  ElMessage.success('位置获取成功');
};

// 通过高德地图获取位置地址
const getLocationAddressByAmap = async (latitude, longitude) => {
  try {
    const url = `http://localhost:8081/api/place?lon=${longitude}&lat=${latitude}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      console.error(`后端服务返回错误: ${response.status}`);
      return getMockLocationAddress(latitude, longitude);
    }
    const data = await response.json();
    if (data && data.placeName) {
      console.log('成功从后端获取地址:', data.placeName);
      return data.placeName;
    } else {
      console.error('后端服务返回的数据格式不正确:', data);
      return getMockLocationAddress(latitude, longitude);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('请求后端服务超时');
    } else {
      console.error('调用后端服务失败:', error);
    }
    return getMockLocationAddress(latitude, longitude);
  }
};

// 获取模拟位置地址
const getMockLocationAddress = (latitude, longitude) => {
  console.log('使用模拟地址');
  return '请求地址失败';
};

// 开始训练计划
const startTrainingPlan = (planId) => {
  console.log("开始训练计划:", planId);
  // 可以添加跳转到训练详情页面的逻辑
  // navigateTo(`/training/${planId}`)
};

// 处理快捷功能点击
const handleQuickAction = async (actionType) => {
  console.log("点击快捷功能:", actionType);
  // 根据不同的功能类型执行不同的逻辑
  switch (actionType) {
    case "recordDiet":
      // 跳转到饮食记录页面
      await navigateTo("/yingyang");
      break;
    case "customPlan":
      // 跳转到计划页面
      await navigateTo("/jihua");
      break;
    case "exerciseCheckin":
      // 跳转到活动页面
      await navigateTo("/checkin");
      break;
    case "kibpk":
      // 其他功能的处理逻辑可以在这里添加
      console.log("该功能尚未实现");
      break;
    default:
      console.log("未知的功能类型");
  }
};

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑
  console.log("执行搜索");
};

// 处理通知点击
const handleNotification = () => {
  console.log("查看通知");
};

// 处理消息点击
const handleMessage = () => {
  console.log("查看消息");
};

// 处理个人资料点击
const handleProfile = () => {
  console.log("查看个人资料");
};



</script>

<style scoped lang="scss">


/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 仪表盘整体容器 */
.dashboard {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏样式 */
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
}

/* Logo样式 */
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

/* 导航菜单样式 */
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

/* 导航右侧功能区样式 */
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

/* 主内容区域样式 */
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

/* 训练计划区域样式 */
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

/* 快捷功能入口样式 */
.quick-actions {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

/* 底部导航栏样式 */
.bottom-nav {
  background-color: #ffffff;
  border-top: 1px solid #ebeef5;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  display: none; /* 默认在桌面端隐藏 */
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

/* 响应式设计 */
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
    padding-bottom: 72px; /* 为底部导航留出空间 */
  }

  /* 响应式骨架屏样式 */
  .skeleton-container {
    height: 150px;
    padding: 15px;
  }
}

/* 打卡功能样式 */
.today-checkin-card {
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-info {
  color: #606266;
  font-size: 14px;
}

.checkin-content {
  text-align: center;
  padding: 40px 0;
}

.check-icon {
  font-size: 80px;
  color: #67c23a;
  margin-bottom: 20px;
}

.uncheck-icon {
  font-size: 80px;
  color: #f56c6c;
  margin-bottom: 20px;
}

.checked-status p,
.uncheck-status p {
  font-size: 20px;
  color: #303133;
}

.checkin-time {
  color: #606266 !important;
  font-size: 16px !important;
  margin-top: 10px;
}

.today-exercise-info {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  text-align: left;
  display: inline-block;
  width: 90%;
  max-width: 600px;
}

.exercise-title {
  font-size: 18px !important;
  font-weight: bold !important;
  color: #303133 !important;
  margin-bottom: 15px !important;
  text-align: center !important;
}

.exercise-content {
  font-size: 16px !important;
  color: #303133 !important;
  margin-bottom: 10px !important;
  line-height: 1.6;
}

.exercise-duration {
  font-size: 16px !important;
  color: #606266 !important;
  margin-top: 10px !important;
}

.exercise-location {
  font-size: 16px !important;
  color: #606266 !important;
  margin-top: 10px !important;
}

.checkin-form {
  width: 100%;
  max-width: 600px;
  margin: 20px auto 0;
  text-align: left;
}

.checkin-form .el-form-item {
  margin-bottom: 25px;
}

/* 骨架屏样式 */
.skeleton-container {
  width: 100%;
  max-width: 600px;
  margin: 20px auto 0;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 成就看板样式 */
.achievement-status {
  text-align: center;
  padding: 40px 20px;
}

.achievement-grid {
  display: flex;
  justify-content: space-around;
  margin: 30px 0;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
}

.achieve-item .label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.achieve-item .value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.weekly-calendar {
  margin-top: 30px;
}

.weekly-calendar h4 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  font-weight: bold;
}

.calendar-dots {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
}

.dot {
  width: 20px;
  height: 20px;
  background: #ebedf0;
  border-radius: 4px;
  transition: all 0.3s;
}

.dot.active {
  background: #67c23a; /* 类似 Github 的绿色 */
  transform: scale(1.1);
}

/* 本周运动进度样式 */
.weekly-checkin {
  margin-top: 30px;
}

.weekly-checkin h4 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  font-weight: bold;
}

.days-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.day-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.day-label {
  font-size: 12px;
  color: #606266;
}

.status-box {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5; /* 预设灰色 */
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
}

/* 绿框绿勾 */
.status-box.checked {
  background-color: #f0f9eb; /* 浅绿背景 */
  border-color: #67c23a;     /* 绿色边框 */
  color: #67c23a;            /* 勾勾的颜色 */
}

/* 红框红叉 */
.status-box.missed {
  background-color: #fef0f0; /* 浅红背景 */
  border-color: #f56c6c;     /* 红色边框 */
  color: #f56c6c;            /* 叉叉的颜色 */
}

/* 调整图标大小 */
.status-box .el-icon {
  font-size: 20px;
  font-weight: bold;
}

.location-input-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.location-input {
  flex: 1;
}

.get-location-btn {
  white-space: nowrap;
}

.stats-section {
  margin-bottom: 30px;
}

.stat-card {
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  text-align: center;
  padding: 20px 0;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 10px;
}

.stat-label {
  color: #606266;
  font-size: 16px;
}

.records-card {
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.record-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}

.record-info {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.record-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.record-date,
.record-time {
  color: #606266;
  font-size: 14px;
  display: inline-block;
  margin-right: 15px;
}

.record-details {
  padding-top: 10px;
}

.exercise-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exercise-info .label {
  font-weight: bold;
  color: #606266;
}

.exercise-info .value {
  color: #303133;
  font-size: 14px;
  line-height: 1.5;
}

.no-records {
  padding: 40px 0;
  text-align: center;
}

/* 新增样式：针对训练时长组件的定制 */
.duration-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.duration-input {
  flex: 1;
  width: 100%;
}

.duration-unit {
  /* 样式与 label "训练时长" 保持一致 */
  color: #606266; /* 深灰色，与标签颜色一致 */
  font-size: 14px; /* 字体大小与标签一致 */
  font-weight: normal; /* 正常字体，不加粗 */
  white-space: nowrap;
}

/* 训练内容选择容器 */
.exercise-select-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.exercise-select-container .el-select {
  flex: 1;
  width: 100%;
}

/* 训练详情 */
.exercise-details {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.exercise-details h3 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  font-weight: bold;
}

/* 训练项 */
.exercise-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.exercise-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.exercise-name {
  font-weight: bold;
  color: #303133;
}

/* 组数次数容器 */
.sets-reps-container {
  display: flex;
  gap: 20px;
  align-items: center;
}

.sets-reps-container .el-form-item {
  margin-bottom: 0;
}

/* 今日训练内容样式 */
.today-exercise-item {
  margin-bottom: 5px;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.today-exercise-item:last-child {
  border-bottom: none;
}

/* 打卡记录训练内容列表 */
.exercise-list {
  margin-left: 80px;
  margin-top: 5px;
}

.record-exercise-item {
  margin-bottom: 3px;
  padding: 3px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 组数次数样式 */
.exercise-sets-reps {
  color: #606266;
  font-size: 14px;
  font-weight: normal;
}

/* 定位精度和提示样式 */
.location-accuracy {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 5px;
}

.location-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .today-exercise-info {
    width: 100%;
    padding: 15px;
  }
  .checkin-form {
    width: 95%;
  }
  .record-content {
    align-items: flex-start;
  }
  .record-details {
    text-align: left;
  }
  .location-input-container {
    flex-direction: column;
  }
  .location-input {
    width: 100%;
  }
  
  .stats-section {
    flex-direction: column;
  }
  
  .stats-section .el-col {
    width: 100%;
    margin-bottom: 16px;
  }
  
  .exercise-select-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .exercise-select-container .el-button {
    margin-left: 0;
    margin-top: 10px;
  }
  
  .sets-reps-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .exercise-list {
    margin-left: 0;
  }
  
  .get-location-btn {
    width: 100%;
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

  .stat-number {
    font-size: 24px;
  }

  .today-exercise-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .exercise-sets-reps {
    margin-left: 0;
  }
}
</style>



