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
            <p class="exercise-content">{{ todayCheckinData.exercise || '未记录' }}</p>
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
            <el-form-item label="训练内容" prop="exercise">
              <el-input 
                v-model="checkinForm.exercise" 
                placeholder="今天的训练内容"
                type="textarea"
                :rows="3"
              ></el-input>
            </el-form-item>
            <el-form-item label="训练时长" prop="duration">
              <el-input-number 
                v-model="checkinForm.duration" 
                :min="1" 
                :max="600" 
                :step="5"
                placeholder="请输入训练时长（分钟）"
              >
                <template #append>分钟</template>
              </el-input-number>
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
                    <p v-if="record.exercise" class="exercise-content">
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
import { ArrowLeft, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'CheckinPage',
  components: {
    ArrowLeft,
    CircleCheck,
    CircleClose
  },
  data() {
    return {
      checkinRecords: [],
      hasCheckedToday: false,
      todayCheckinTime: '',
      todayCheckinData: null,
      isLoading: false,
      isGettingLocation: false,
      todayDate: '',
      checkinForm: {
        exercise: '',
        duration: null,
        location: ''
      },
      rules: {
        exercise: [
          { required: true, message: '请输入训练内容', trigger: 'blur' }
        ],
        duration: [
          { required: true, message: '请输入训练时长', trigger: 'blur' },
          { type: 'number', min: 1, message: '训练时长至少为1分钟', trigger: 'blur' }
        ],
        location: [
          { required: true, message: '请输入或获取打卡位置', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 计算总打卡次数
    totalCheckins() {
      return this.checkinRecords.length
    },
    // 计算当前连续打卡天数
    currentStreak() {
      if (this.checkinRecords.length === 0) return 0
      
      // 按日期排序（最新的在前）
      const sortedRecords = [...this.checkinRecords].sort((a, b) => 
        new Date(b.time) - new Date(a.time)
      )
      
      let streak = 0
      const today = new Date().setHours(0, 0, 0, 0)
      
      // 检查是否今天已打卡
      if (new Date(sortedRecords[0].time).setHours(0, 0, 0, 0) === today) {
        streak = 1
        
        // 继续检查之前的天数
        for (let i = 1; i < sortedRecords.length; i++) {
          const currentDate = new Date(sortedRecords[i - 1].time)
          const previousDate = new Date(sortedRecords[i].time)
          
          // 计算两个日期之间的天数差
          const daysDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24))
          
          if (daysDiff === 1) {
            streak++
          } else {
            break
          }
        }
      }
      
      return streak
    },
    // 计算最长连续打卡天数
    bestStreak() {
      if (this.checkinRecords.length === 0) return 0
      
      // 按日期排序（最新的在前）
      const sortedRecords = [...this.checkinRecords].sort((a, b) => 
        new Date(b.time) - new Date(a.time)
      )
      
      let maxStreak = 1
      let currentStreak = 1
      
      for (let i = 1; i < sortedRecords.length; i++) {
        const currentDate = new Date(sortedRecords[i - 1].time)
        const previousDate = new Date(sortedRecords[i].time)
        
        // 计算两个日期之间的天数差
        const daysDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 1) {
          currentStreak++
          maxStreak = Math.max(maxStreak, currentStreak)
        } else if (daysDiff > 1) {
          currentStreak = 1
        }
      }
      
      return maxStreak
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    // 初始化页面
    init() {
      this.setTodayDate()
      this.loadCheckinRecords()
      this.checkTodayStatus()
    },
    
    // 设置今天日期显示
    setTodayDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = now.getDate().toString().padStart(2, '0')
      this.todayDate = `${year}-${month}-${day}`
    },
    
    // 加载打卡记录
    loadCheckinRecords() {
      // 从localStorage读取打卡记录
      const records = localStorage.getItem('checkinRecords')
      this.checkinRecords = records ? JSON.parse(records) : []
      // 按时间降序排序
      this.checkinRecords.sort((a, b) => new Date(b.time) - new Date(a.time))
    },
    
    // 检查今天是否已打卡
    checkTodayStatus() {
      const today = new Date().setHours(0, 0, 0, 0)
      
      for (const record of this.checkinRecords) {
        const recordDate = new Date(record.time).setHours(0, 0, 0, 0)
        if (recordDate === today) {
          this.hasCheckedToday = true
          this.todayCheckinTime = this.formatTime(record.time)
          this.todayCheckinData = {
            exercise: record.exercise,
            duration: record.duration,
            location: record.location
          }
          break
        }
      }
    },
    
    // 处理打卡
    handleCheckin() {
      this.$refs.checkinFormRef.validate((valid) => {
        if (valid) {
          this.isLoading = true
          
          // 模拟网络延迟
          setTimeout(() => {
            // 创建新的打卡记录
            const newRecord = {
              id: Date.now().toString(),
              time: new Date().toISOString(),
              exercise: this.checkinForm.exercise,
              duration: this.checkinForm.duration,
              location: this.checkinForm.location
            }
            
            // 添加到记录列表
            this.checkinRecords.unshift(newRecord)
            
            // 保存到localStorage
            this.saveCheckinRecords()
            
            // 更新状态
            this.hasCheckedToday = true
            this.todayCheckinTime = this.formatTime(newRecord.time)
            this.todayCheckinData = {
              exercise: newRecord.exercise,
              duration: newRecord.duration,
              location: newRecord.location
            }
            this.isLoading = false
            
            // 重置表单
            this.checkinForm = {
              exercise: '',
              duration: null,
              location: ''
            }
            
            // 显示成功提示
            ElMessage.success('打卡成功！')
          }, 1000)
        } else {
          return false
        }
      })
    },
    
    // 保存打卡记录
    saveCheckinRecords() {
      localStorage.setItem('checkinRecords', JSON.stringify(this.checkinRecords))
    },
    
    // 格式化日期时间
    formatDateTime(time) {
      const date = new Date(time)
      return `${this.formatDate(time)} ${this.formatTime(time)}`
    },
    
    // 格式化日期
    formatDate(time) {
      const date = new Date(time)
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 格式化时间
    formatTime(time) {
      const date = new Date(time)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },
    
    // 获取用户当前位置
    getCurrentLocation() {
      if (!navigator.geolocation) {
        ElMessage.error('您的浏览器不支持地理定位功能');
        return;
      }
      
      this.isGettingLocation = true;
      
      // 避免直接在navigator.geolocation.getCurrentPosition回调中使用async
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 将异步操作移到单独的函数中
          this.processLocationData(position)
            .catch(error => {
              console.error('处理位置数据时出错:', error);
              this.isGettingLocation = false;
              ElMessage.error('处理位置信息失败');
            });
        },
        (error) => {
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
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    },
    
    // 处理位置数据的异步函数
    async processLocationData(position) {
      const { latitude, longitude } = position.coords;
      
      // 尝试通过高德地图API进行反向地理编码获取具体地址
      const locationAddress = await this.getLocationAddressByAmap(latitude, longitude);
      
      // 如果成功获取到地址名称，使用地址名称；否则使用经纬度
      this.checkinForm.location = locationAddress || `经度: ${latitude.toFixed(6)}, 纬度: ${longitude.toFixed(6)}`;
      
      this.isGettingLocation = false;
      ElMessage.success('位置获取成功');
    },
    
    /**
     * 通过后端服务根据经纬度获取具体地址名称
     * @param {number} latitude - 纬度
     * @param {number} longitude - 经度
     * @returns {Promise<string|null>} - 返回地址名称或null
     */
    async getLocationAddressByAmap(latitude, longitude) {
      try {
        // 调用后端Spring Boot服务的API
        const url = `http://localhost:8080/api/place?lon=${longitude}&lat=${latitude}`;
        
        // 设置超时处理
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        // 发送请求获取地址信息
        const response = await fetch(url, {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        // 检查响应状态
        if (!response.ok) {
          console.error(`后端服务返回错误: ${response.status}`);
          // 返回模拟地址作为备用
          return this.getMockLocationAddress(latitude, longitude);
        }
        
        const data = await response.json();
        
        // 检查返回的数据格式
        if (data && data.placeName) {
          // 返回后端服务提供的地点名称
          console.log('成功从后端获取地址:', data.placeName);
          return data.placeName;
        } else {
          console.error('后端服务返回的数据格式不正确:', data);
          // 返回模拟地址作为备用
          return this.getMockLocationAddress(latitude, longitude);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('请求后端服务超时');
        } else {
          console.error('调用后端服务失败:', error);
        }
        // 发生错误时返回模拟地址作为备用
        return this.getMockLocationAddress(latitude, longitude);
      }
    },
    
    /**
     * 获取模拟位置地址（当无法从后端获取时使用）
     * @param {number} latitude - 纬度
     * @param {number} longitude - 经度
     * @returns {string} - 返回模拟的地址信息
     */
    getMockLocationAddress(latitude, longitude) {
      // 简单的模拟地址，实际应用中可以根据需求扩展
      console.log('使用模拟地址');
      return '请求地址失败';
    },
  }
}
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

/* 确保图标和文字对齐 */
.back-to-home .el-icon {
  font-size: 18px;
  margin-right: 5px;
}

/* 为返回首页链接添加动画效果 */
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

/* 今日训练信息样式 */
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

/* 打卡表单样式 */
.checkin-form {
  width: 100%;
  max-width: 600px;
  margin: 20px auto 0;
  text-align: left;
}

.checkin-form .el-form-item {
  margin-bottom: 25px;
}

/* 位置输入相关样式 */
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
</style>