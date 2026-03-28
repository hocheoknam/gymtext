<template>
  <div class="checkin-container">
    <!-- 返回首页链接 -->
    <div class="back-to-home">
      <router-link to="/home" style="color: #409EFF; text-decoration: none;">
        <el-icon><ArrowLeft /></el-icon>
        <span style="margin-left: 5px;">返回首页</span>
      </router-link>
    </div>

    <!-- 页面标题 -->
    <el-card class="page-header" shadow="never">
      <h1>健身打卡系统</h1>
      <p>坚持打卡，记录你的健身之旅</p>
    </el-card>

    <!-- 今日打卡区域 -->
    <el-card class="today-checkin-card">
      <template #header>
        <div class="card-header">
          <span>今日打卡</span>
          <span class="date-info">{{ todayDate }}</span>
        </div>
      </template>

      <div class="checkin-content">
        <div v-if="hasCheckedToday" class="checked-status">
          <el-icon class="check-icon"><CircleCheck /></el-icon>
          <p>今日已打卡，继续保持好的训练习惯</p>
          <p class="checkin-time">打卡时间: {{ todayCheckinTime }}</p>
          <div v-if="todayCheckinData" class="today-exercise-info">
            <p class="exercise-title">今日训练内容</p>
            <div v-if="Array.isArray(todayCheckinData.exercises) && todayCheckinData.exercises.length > 0">
              <div v-for="(exercise, index) in todayCheckinData.exercises" :key="index" class="today-exercise-item">
                <span class="exercise-name">{{ exercise.name || exercise }}</span>
                <span v-if="exercise.sets && exercise.reps" class="exercise-sets-reps">({{ exercise.sets }}组 × {{ exercise.reps }}次)</span>
              </div>
            </div>
            <p v-else class="exercise-content">{{ todayCheckinData.exercises || '未记录' }}</p>
            <p class="exercise-duration">训练时长: {{ todayCheckinData.duration || 0 }} 分钟</p>
            <p v-if="todayCheckinData.location" class="exercise-location">打卡位置: {{ todayCheckinData.location }}</p>
          </div>
        </div>

        <div v-else class="uncheck-status">
          <el-icon class="uncheck-icon"><CircleClose /></el-icon>
          <p>今日未打卡</p>

          <!-- 打卡表单 -->
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
</template>

<script>
import { ArrowLeft, CircleCheck, CircleClose } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'CheckinPage',
  components: {
    ArrowLeft,
    CircleCheck,
    CircleClose,
  },
  data() {
    return {
      checkinRecords: [],
      hasCheckedToday: false,
      todayCheckinTime: '',
      todayCheckinData: null,
      isLoading: false,
      isGettingLocation: false,
      locationAccuracy: null,
      isLoadingExercises: false,
      todayDate: '',
      exerciseList: [],
      checkinForm: {
        exercises: [],
        duration: null,
        location: ''
      },
      selectedExercise: '',
      rules: {
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
      },
    };
  },
  computed: {
    totalCheckins() {
      return this.checkinRecords.length;
    },
    currentStreak() {
      if (this.checkinRecords.length === 0) return 0;

      const sortedRecords = [...this.checkinRecords].sort((a, b) =>
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
    },
    bestStreak() {
      if (this.checkinRecords.length === 0) return 0;

      const sortedRecords = [...this.checkinRecords].sort((a, b) =>
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
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.setTodayDate();
      this.loadCheckinRecords();
      this.checkTodayStatus();
      this.loadExerciseList();
    },
    async loadExerciseList() {
      this.isLoadingExercises = true;
      try {
        const response = await fetch('/api/exercise_logs');
        if (!response.ok) throw new Error('网络请求失败');
        const data = await response.json();
        if (data.code === 200) {
          this.exerciseList = data.data || [];
        } else {
          console.error('获取训练内容失败:', data.message);
          this.exerciseList = [];
        }
      } catch (error) {
        console.error('加载训练内容失败:', error);
        this.exerciseList = [];
      } finally {
        this.isLoadingExercises = false;
      }
    },
    setTodayDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      this.todayDate = `${year}-${month}-${day}`;
    },
    loadCheckinRecords() {
      const records = localStorage.getItem('checkinRecords');
      this.checkinRecords = records ? JSON.parse(records) : [];
      this.checkinRecords.sort((a, b) => new Date(b.time) - new Date(a.time));
    },
    checkTodayStatus() {
      const today = new Date().setHours(0, 0, 0, 0);
      for (const record of this.checkinRecords) {
        const recordDate = new Date(record.time).setHours(0, 0, 0, 0);
        if (recordDate === today) {
          this.hasCheckedToday = true;
          this.todayCheckinTime = this.formatTime(record.time);
          this.todayCheckinData = {
            exercises: record.exercises || record.exercise, // 兼容旧数据
            duration: record.duration,
            location: record.location,
          };
          break;
        }
      }
    },
    handleCheckin() {
      this.$refs.checkinFormRef.validate((valid) => {
        if (valid) {
          this.isLoading = true;
          setTimeout(() => {
            const newRecord = {
              id: Date.now().toString(),
              time: new Date().toISOString(),
              exercises: this.checkinForm.exercises,
              duration: this.checkinForm.duration,
              location: this.checkinForm.location,
            };
            this.checkinRecords.unshift(newRecord);
            this.saveCheckinRecords();
            this.hasCheckedToday = true;
            this.todayCheckinTime = this.formatTime(newRecord.time);
            this.todayCheckinData = {
              exercises: newRecord.exercises,
              duration: newRecord.duration,
              location: newRecord.location,
            };
            this.isLoading = false;
            this.checkinForm = {
              exercises: [],
              duration: null,
              location: '',
            };
            ElMessage.success('打卡成功！');
          }, 1000);
        } else {
          return false;
        }
      });
    },
    saveCheckinRecords() {
      localStorage.setItem('checkinRecords', JSON.stringify(this.checkinRecords));
    },
    
    // 添加训练内容
    addExercise() {
      if (!this.selectedExercise) {
        ElMessage.warning('请选择训练内容');
        return;
      }
      
      // 检查是否已经添加过相同的训练内容
      const exists = this.checkinForm.exercises.some(item => item.name === this.selectedExercise);
      if (exists) {
        ElMessage.warning('该训练内容已添加');
        return;
      }
      
      // 添加训练内容到列表
      this.checkinForm.exercises.push({
        name: this.selectedExercise,
        sets: 3,
        reps: 10
      });
      
      // 清空选择
      this.selectedExercise = '';
    },
    
    // 移除训练内容
    removeExercise(index) {
      this.checkinForm.exercises.splice(index, 1);
    },
    
    formatDateTime(time) {
      const date = new Date(time);
      return `${this.formatDate(time)} ${this.formatTime(time)}`;
    },
    formatDate(time) {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    formatTime(time) {
      const date = new Date(time);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    getCurrentLocation() {
      if (!navigator.geolocation) {
        ElMessage.error('您的浏览器不支持地理定位功能');
        return;
      }
      this.isGettingLocation = true;
      
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
                this.processLocationData(bestLocation).catch((error) => {
                  console.error('处理位置数据时出错:', error);
                  this.isGettingLocation = false;
                  ElMessage.error('处理位置信息失败');
                });
              } else {
                this.isGettingLocation = false;
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
              this.isGettingLocation = false;
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
    },
    async processLocationData(position) {
      const { latitude, longitude, accuracy } = position.coords;
      // 更新定位精度
      this.locationAccuracy = Math.round(accuracy);
      
      const locationAddress = await this.getLocationAddressByAmap(latitude, longitude);
      this.checkinForm.location = locationAddress || `经度: ${latitude.toFixed(6)}, 纬度: ${longitude.toFixed(6)}`;
      this.isGettingLocation = false;
      ElMessage.success('位置获取成功');
    },
    async getLocationAddressByAmap(latitude, longitude) {
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
          return this.getMockLocationAddress(latitude, longitude);
        }
        const data = await response.json();
        if (data && data.placeName) {
          console.log('成功从后端获取地址:', data.placeName);
          return data.placeName;
        } else {
          console.error('后端服务返回的数据格式不正确:', data);
          return this.getMockLocationAddress(latitude, longitude);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('请求后端服务超时');
        } else {
          console.error('调用后端服务失败:', error);
        }
        return this.getMockLocationAddress(latitude, longitude);
      }
    },
    getMockLocationAddress(latitude, longitude) {
      console.log('使用模拟地址');
      return '请求地址失败';
    },
  },
};
</script>

<style scoped>
.checkin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.back-to-home {
  margin-bottom: 20px;
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

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #303133;
  margin-bottom: 10px;
}

.page-header p {
  color: #606266;
  font-size: 16px;
}

.today-checkin-card {
  margin-bottom: 30px;
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
}

.record-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
}

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

/* 响应式调整 */
@media (max-width: 768px) {
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
}
</style>