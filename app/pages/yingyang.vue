<template>
  <!-- 饮食管理系统主容器 -->
  <div class="diet-management-system">
    <!-- 返回首页链接 -->
    <div class="back-to-home">
      <router-link to="/home" style="color: #409EFF; text-decoration: none;">
        <el-icon><ArrowLeft /></el-icon>
        <span style="margin-left: 5px;">返回首页</span>
      </router-link>
    </div>
    
    <!-- 页面标题卡片 -->
    <el-card class="page-header" shadow="never" :class="{ 'fade-in': true }">
      <h1>饮食管理系统</h1>
      <p>记录您的饮食，分析营养摄入，实现健康目标</p>
    </el-card>

    <!-- 主要内容区域：包含食物记录和营养分析 -->
    <div class="main-content">
      <!-- 左侧：食物记录卡片 -->
      <el-card class="food-record-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>食物记录</span>
            <el-button type="primary" size="small" @click="showAddFoodDialog = true">添加记录</el-button>
          </div>
        </template>

        <!-- 食物记录列表 -->
        <div class="food-record-list">
          <!-- 空状态提示 -->
          <el-empty v-if="foodRecords.length === 0" description="暂无食物记录">
            <template #description>
              <div>
                <el-icon><Document /></el-icon>
                <span style="margin-left: 8px;">暂无食物记录</span>
              </div>
            </template>
            <el-button type="primary" @click="showAddFoodDialog = true">开始记录</el-button>
          </el-empty>
          <!-- 时间线记录列表 -->
          <el-timeline v-else>
            <el-timeline-item
              v-for="record in foodRecords"
              :key="record.id"
              :timestamp="formatTime(record.time)"
              placement="top"
            >
              <el-card :body-style="{ padding: '10px' }" class="food-card" hoverable>
                <div class="food-item">
                  <!-- 食物信息显示区域 -->
                  <div class="food-info">
                    <h4>{{ record.name }}</h4>
                    <p>分量: {{ record.portion }} {{ record.unit }}</p>
                    <p>热量: {{ record.calories }} kcal</p>
                    <p>蛋白质: {{ record.protein }} g | 碳水: {{ record.carbs }} g | 脂肪: {{ record.fat }} g</p>
                  </div>
                  <!-- 操作按钮组 -->
                  <el-button-group>
                    <el-button type="primary" size="small" @click="editFood(record)">
                      <el-icon><EditPen /></el-icon>
                      编辑
                    </el-button>
                    <el-button type="danger" size="small" @click="deleteFood(record.id)">
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </el-button-group>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>

      <!-- 右侧：营养分析卡片 -->
      <el-card class="nutrition-analysis-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>营养分析</span>
            <!-- 分析周期选择器 -->
            <div style="display: flex; gap: 10px; align-items: center;">
              <el-select v-model="analysisPeriod" size="small" style="width: 120px;">
                <el-option label="今日" value="today" />
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
              </el-select>
              <el-button 
                type="primary" 
                size="small" 
                @click="toggleGoalEditMode"
              >
                {{ isGoalEditMode ? '保存' : '编辑目标' }}
              </el-button>
            </div>
          </div>
        </template>

        <!-- 营养概览仪表盘 -->
        <div class="nutrition-overview">
          <!-- 热量仪表盘 -->
          <div class="nutrition-item">
            <el-progress type="dashboard" :percentage="caloriesPercentage" :width="80" />
            <div class="nutrition-label">
              <span>热量</span>
              <div v-if="isGoalEditMode" class="nutrition-input">
                <el-input-number 
                  v-model="dailyGoal.calories" 
                  :min="1000" 
                  :max="50000" 
                  :step="100" 
                  style="width: 120px;" 
                />
                <span class="unit">kcal</span>
              </div>
              <span v-else>{{ totalNutrition.calories }} / {{ dailyGoal.calories }} kcal</span>
            </div>
          </div>
          <!-- 蛋白质仪表盘 -->
          <div class="nutrition-item">
            <el-progress type="dashboard" :percentage="proteinPercentage" :width="80" color="#409EFF" />
            <div class="nutrition-label">
              <span>蛋白质</span>
              <div v-if="isGoalEditMode" class="nutrition-input">
                <el-input-number 
                  v-model="dailyGoal.protein" 
                  :min="30" 
                  :max="20000" 
                  :step="5" 
                  style="width: 120px;" 
                />
                <span class="unit">g</span>
              </div>
              <span v-else>{{ totalNutrition.protein }} / {{ dailyGoal.protein }} g</span>
            </div>
          </div>
          <!-- 碳水化合物仪表盘 -->
          <div class="nutrition-item">
            <el-progress type="dashboard" :percentage="carbsPercentage" :width="80" color="#67C23A" />
            <div class="nutrition-label">
              <span>碳水化合物</span>
              <div v-if="isGoalEditMode" class="nutrition-input">
                <el-input-number 
                  v-model="dailyGoal.carbs" 
                  :min="50" 
                  :max="40000" 
                  :step="10" 
                  style="width: 120px;" 
                />
                <span class="unit">g</span>
              </div>
              <span v-else>{{ totalNutrition.carbs }} / {{ dailyGoal.carbs }} g</span>
            </div>
          </div>
          <!-- 脂肪仪表盘 -->
          <div class="nutrition-item">
            <el-progress type="dashboard" :percentage="fatPercentage" :width="80" color="#E6A23C" />
            <div class="nutrition-label">
              <span>脂肪</span>
              <div v-if="isGoalEditMode" class="nutrition-input">
                <el-input-number 
                  v-model="dailyGoal.fat" 
                  :min="20" 
                  :max="15000" 
                  :step="5" 
                  style="width: 120px;" 
                />
                <span class="unit">g</span>
              </div>
              <span v-else>{{ totalNutrition.fat }} / {{ dailyGoal.fat }} g</span>
            </div>
          </div>
        </div>

        <!-- 营养比例图表 
        <div class="nutrition-chart" style="margin: 20px 0;">
          <div class="chart-container">
            <div class="chart-center">
              <div class="chart-title">营养比例</div>
            </div>
            <div class="chart-segments">
               饼图分段 
              <div 
                v-for="(segment, index) in pieChartData" 
                :key="index"
                class="chart-segment"
                :style="{
                  backgroundColor: segment.itemStyle.color,
                  transform: `rotate(${segment.offset}deg) skewY(${segment.angle}deg)`
                }"
              >
                <div class="segment-label" :style="{
                  transform: `skewY(${-segment.angle}deg) rotate(${-segment.offset - segment.angle/2}deg)`
                }">
                
                  {{ segment.name }} {{ segment.percentage }}%
                </div>
              </div>
            </div>
          </div>
        </div>  -->

        <!-- 营养详情表格 -->
        <div class="nutrition-details">
          <el-table :data="nutritionDetails" stripe style="width: 100%">
            <el-table-column prop="name" label="营养成分" />
            <el-table-column prop="amount" label="摄入量" />
            <el-table-column prop="unit" label="单位" />
            <el-table-column prop="percentage" label="占比" width="150">
              <template #default="scope">
                <!-- 显示具体的百分比数值 -->
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span>{{ scope.row.percentage }}%</span>
                  <el-progress :percentage="scope.row.percentage" :show-text="false" style="width: 100px;" />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 统计信息区域 -->
        <div class="statistics-info">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-statistic
                title="平均每日摄入量"
                :value="averageNutrition.calories"
                suffix="kcal"
              />
            </el-col>
            <el-col :span="12">
              <el-statistic
                title="热量达标率"
                :value="caloriesPercentage"
                suffix="%"
              />
            </el-col>
            <el-col :span="12">
              <el-statistic
                title="记录天数"
                :value="recordDays"
                suffix="天"
              />
            </el-col>
            <el-col :span="12">
              <el-statistic
                title="食物种类"
                :value="foodTypes"
                suffix="种"
              />
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>



    <!-- 添加/编辑食物对话框 -->
    <el-dialog
      v-model="showAddFoodDialog"
      :title="editingFood ? '编辑食物记录' : '添加食物记录'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="formData" label-width="100px" :rules="formRules" ref="formRef">
        <el-form-item label="食物名称" prop="name">
          <!-- 【替换开始】将原来的 el-input 替换为 el-select -->
          <el-select
            v-model="formData.selectedFoodId"
            filterable
            remote
            reserve-keyword
            placeholder="搜索食物名称（如：鸡蛋）"
            :remote-method="searchFood"
            :loading="searchLoading"
            style="width: 100%;"
            @change="handleFoodSelect"
            clearable
          >
            <el-option
              v-for="item in searchResults"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ item.calories_per_100g }} kcal/100g
              </span>
            </el-option>
          </el-select>
          <!-- 【替换结束】 -->
          
          <div style="font-size: 12px; color: #909399; margin-top: 5px;">
            <el-icon><InfoFilled /></el-icon>
            选择后自动填充营养数据，可手动微调
          </div>
        </el-form-item>
        <el-form-item label="记录日期">
          <el-date-picker
            v-model="formData.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="记录时间">
          <el-time-picker
            v-model="formData.time"
            placeholder="选择时间"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="分量">
          <!-- 在现有的 el-input-number 上添加 @change="onPortionChange" -->
          <el-input-number
            v-model="formData.portion"
            :min="1"
            :max="1000"
            :step="1"
            style="width: 150px;"
            @change="onPortionChange"
          />
          <!-- 后面的 el-select 单位选择保持不变 -->
          <el-select v-model="formData.unit" placeholder="选择单位" style="margin-left: 10px; width: 120px;">
            <el-option label="克" value="g" />
            <el-option label="毫升" value="ml" />
            <el-option label="份" value="份" />
            <el-option label="个" value="个" />
          </el-select>
        </el-form-item>
        <el-form-item label="热量" prop="calories">
          <el-input-number v-model="formData.calories" :min="0" :max="10000" :step="1" />
          <span class="unit" style="margin-left: 10px;">kcal</span>
        </el-form-item>
        <el-form-item label="蛋白质">
          <el-input-number v-model="formData.protein" :min="0" :max="500" :step="0.1" />
          <span class="unit" style="margin-left: 10px;">g</span>
        </el-form-item>
        <el-form-item label="碳水化合物">
          <el-input-number v-model="formData.carbs" :min="0" :max="1000" :step="0.1" />
          <span class="unit" style="margin-left: 10px;">g</span>
        </el-form-item>
        <el-form-item label="脂肪">
          <el-input-number v-model="formData.fat" :min="0" :max="300" :step="0.1" />
          <span class="unit" style="margin-left: 10px;">g</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddFoodDialog = false">取消</el-button>
          <el-button type="primary" @click="saveFood" :loading="saving">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 导入必要的Vue和Element Plus组件
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, EditPen, Delete, ArrowLeft, InfoFilled } from '@element-plus/icons-vue'

// 数据状态管理
// 食物记录列表
const foodRecords = ref([])
// 控制添加/编辑对话框显示状态
const showAddFoodDialog = ref(false)
// 当前正在编辑的食物记录
const editingFood = ref(null)
// 分析周期选择：today(今日)、week(本周)、month(本月)
const analysisPeriod = ref('today')
// 目标编辑模式状态
const isGoalEditMode = ref(false)

// 表单引用
const formRef = ref(null)
// 保存状态加载指示器
const saving = ref(false)

// 新增：搜索相关状态
const searchResults = ref([])
const searchLoading = ref(false)
const allFoodDatabase = ref([]) // 缓存完整食物库

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入食物名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  calories: [
    { required: true, message: '请输入热量', trigger: 'blur' },
    { type: 'number', min: 0, message: '热量不能为负数', trigger: 'blur' }
  ]
}

// 表单数据模型
const formData = ref({
  selectedFoodId: null, // 【新增】用于绑定下拉框
  name: '',
  date: new Date().toISOString().split('T')[0], // 默认为当前日期 YYYY-MM-DD
  time: new Date().toTimeString().split(':').slice(0, 2).join(':'), // 默认为当前时间 HH:mm
  portion: 100,
  unit: 'g',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0
})

// 每日营养目标设置
const dailyGoal = ref({
  calories: 2000,
  protein: 100,
  carbs: 250,
  fat: 65
})

// 计算属性：根据选择的分析周期过滤食物记录
const filteredFoodRecords = computed(() => {
  const now = new Date()
  let startDate = new Date(now)
  
  switch (analysisPeriod.value) {
    case 'today':
      startDate.setHours(0, 0, 0, 0)
      break
    case 'week':
      // 获取本周第一天（周一）
      const dayOfWeek = now.getDay() || 7 // 将周日转换为7
      startDate.setDate(now.getDate() - dayOfWeek + 1)
      startDate.setHours(0, 0, 0, 0)
      break
    case 'month':
      // 获取本月第一天
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
      break
    default:
      startDate.setHours(0, 0, 0, 0)
  }
  
  const filtered = foodRecords.value.filter(record => {
    const recordDate = new Date(record.time)
    // 检查日期是否有效
    if (isNaN(recordDate.getTime())) {
      console.error('无效的时间格式:', record.time)
      return false
    }
    return recordDate >= startDate
  })
  
  console.log('过滤后的食物记录:', filtered)
  console.log('分析周期:', analysisPeriod.value)
  console.log('开始日期:', startDate)
  console.log('所有食物记录:', foodRecords.value)
  
  return filtered
})

// 计算属性：统计总营养摄入
const totalNutrition = computed(() => {
  const result = filteredFoodRecords.value.reduce((total, record) => {
    console.log('处理记录:', record)
    return {
      calories: total.calories + (Number(record.calories) || 0),
      protein: total.protein + (Number(record.protein) || 0),
      carbs: total.carbs + (Number(record.carbs) || 0),
      fat: total.fat + (Number(record.fat) || 0)
    }
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
  
  console.log('总营养摄入:', result)
  return result
})

// 计算属性：计算各项营养百分比（相对于目标）
const caloriesPercentage = computed(() => {
  return Math.min(Math.round((totalNutrition.value.calories / dailyGoal.value.calories) * 100), 100)
})

const proteinPercentage = computed(() => {
  return Math.min(Math.round((totalNutrition.value.protein / dailyGoal.value.protein) * 100), 100)
})

const carbsPercentage = computed(() => {
  return Math.min(Math.round((totalNutrition.value.carbs / dailyGoal.value.carbs) * 100), 100)
})

const fatPercentage = computed(() => {
  return Math.min(Math.round((totalNutrition.value.fat / dailyGoal.value.fat) * 100), 100)
})

// 计算属性：计算平均营养摄入
const averageNutrition = computed(() => {
  const days = Math.max(getDaysInPeriod(), 1)
  return {
    calories: Math.round(totalNutrition.value.calories / days),
    protein: Math.round(totalNutrition.value.protein / days),
    carbs: Math.round(totalNutrition.value.carbs / days),
    fat: Math.round(totalNutrition.value.fat / days)
  }
})

// 计算属性：统计记录天数
const recordDays = computed(() => {
  const uniqueDates = new Set(
    foodRecords.value.map(record => new Date(record.time).toDateString())
  )
  return uniqueDates.size
})

// 计算属性：统计食物种类
const foodTypes = computed(() => {
  const uniqueFoods = new Set(
    foodRecords.value.map(record => record.name)
  )
  return uniqueFoods.size
})

// 计算属性：生成饼图数据
const pieChartData = computed(() => {
  // 计算总热量（蛋白质和碳水4卡/克，脂肪9卡/克）
  const total = totalNutrition.value.protein * 4 + totalNutrition.value.carbs * 4 + totalNutrition.value.fat * 9
  if (total === 0) return []
  
  const data = [
    {
      name: '蛋白质',
      value: totalNutrition.value.protein * 4,
      itemStyle: { color: '#409EFF' }
    },
    {
      name: '碳水化合物',
      value: totalNutrition.value.carbs * 4,
      itemStyle: { color: '#67C23A' }
    },
    {
      name: '脂肪',
      value: totalNutrition.value.fat * 9,
      itemStyle: { color: '#E6A23C' }
    }
  ]
  
  let offset = 0
  return data.map(item => {
    const percentage = Math.round((item.value / total) * 100)
    const angle = Math.round((item.value / total) * 360)
    const result = {
      ...item,
      percentage,
      angle,
      offset
    }
    offset += angle
    return result
  })
})

// 计算属性：营养详情表格数据
const nutritionDetails = computed(() => {
  return [
    { name: '热量', amount: totalNutrition.value.calories, unit: 'kcal', percentage: caloriesPercentage.value },
    { name: '蛋白质', amount: totalNutrition.value.protein, unit: 'g', percentage: proteinPercentage.value },
    { name: '碳水化合物', amount: totalNutrition.value.carbs, unit: 'g', percentage: carbsPercentage.value },
    { name: '脂肪', amount: totalNutrition.value.fat, unit: 'g', percentage: fatPercentage.value }
  ]
})

// 生命周期钩子：组件挂载时初始化数据
onMounted(() => {
  loadFoodRecords() // 加载食物记录
  loadGoal() // 加载营养目标
  loadFoodDatabase() // 【新增】加载食物库
})

// 加载食物记录（从localStorage读取）
function loadFoodRecords() {
  const savedRecords = localStorage.getItem('foodRecords')
  if (savedRecords) {
    try {
      foodRecords.value = JSON.parse(savedRecords)
      // 按时间降序排序，确保最新时间在最上面
      foodRecords.value.sort((a, b) => new Date(b.time) - new Date(a.time))
      console.log('从localStorage加载的食物记录:', foodRecords.value)
    } catch (error) {
      console.error('解析食物记录失败:', error)
      foodRecords.value = []
    }
  } else {
    console.log('localStorage中没有食物记录')
    // 添加一些示例数据用于测试
    foodRecords.value = [
      {
        id: '1',
        name: '鸡蛋',
        portion: 100,
        unit: 'g',
        calories: 155,
        protein: 13,
        carbs: 1.1,
        fat: 11,
        time: new Date().toISOString().split('T').join(' ').slice(0, 19)
      },
      {
        id: '2',
        name: '米饭',
        portion: 100,
        unit: 'g',
        calories: 130,
        protein: 2.6,
        carbs: 28,
        fat: 0.3,
        time: new Date().toISOString().split('T').join(' ').slice(0, 19)
      }
    ]
    saveFoodRecords()
    console.log('添加了示例食物记录:', foodRecords.value)
  }
}

// 保存食物记录（到localStorage）
function saveFoodRecords() {
  localStorage.setItem('foodRecords', JSON.stringify(foodRecords.value))
}

// 加载营养目标（从localStorage读取）
function loadGoal() {
  const savedGoal = localStorage.getItem('dailyGoal')
  if (savedGoal) {
    dailyGoal.value = JSON.parse(savedGoal)
  }
}

// 保存营养目标（到localStorage）
function saveGoal() {
  localStorage.setItem('dailyGoal', JSON.stringify(dailyGoal.value))
  ElMessage.success('目标保存成功')
}

// 打开编辑食物记录对话框
function editFood(record) {
  editingFood.value = record
  formData.value = {
    ...record,
    date: record.time.split(' ')[0],
    time: record.time.split(' ')[1]
  }
  showAddFoodDialog.value = true
}

// 保存食物记录（新增或编辑）
async function saveFood() {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate(); // 表单验证
    saving.value = true; // 显示加载状态
    
    // 构建食物数据
    const foodData = {
      ...formData.value,
      time: `${formData.value.date} ${formData.value.time}`, // 组合日期和时间
      id: editingFood.value ? editingFood.value.id : Date.now().toString() // 编辑时使用原ID，新增时生成时间戳ID
    };
    
    // 从localStorage获取用户ID
    let currentUserId = null;
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // 解析Token
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = tokenPayload.user_id || tokenPayload.id || tokenPayload.userId;
      } catch (error) {
        console.error('解析Token失败:', error);
      }
    }
    // 如果没有Token或解析失败，使用默认用户ID 3
    if (!currentUserId) {
      currentUserId = 3;
    }
    
    // 发送POST请求到API
    try {
      const response = await fetch('/api/food-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.value.name,
          portion: formData.value.portion,
          unit: formData.value.unit,
          calories: formData.value.calories,
          time: foodData.time,
          total_calories: formData.value.calories,
          user_id: currentUserId,
          food_item_id: formData.value.selectedFoodId || 1 // 使用选中的食物ID，如果没有则使用默认值1
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('API保存失败:', data);
        ElMessage.error('保存失败: ' + (data.statusMessage || '未知错误'));
      }
    } catch (apiError) {
      console.error('API请求失败:', apiError);
      // API请求失败时，仍然保存到本地，确保用户体验
      ElMessage.warning('网络错误，数据已保存到本地');
    }
    
    // 更新本地数据
    if (editingFood.value) {
      // 编辑现有记录
      const index = foodRecords.value.findIndex(r => r.id === editingFood.value.id);
      if (index !== -1) {
        foodRecords.value[index] = foodData;
      }
    } else {
      // 添加新记录到列表顶部
      foodRecords.value.unshift(foodData);
    }
    
    // 按时间降序排序，确保最新时间在最上面
    foodRecords.value.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // 保存数据到本地存储
    saveFoodRecords();
    ElMessage.success(editingFood.value ? '编辑成功' : '添加成功');
    
    // 重置表单和状态
    showAddFoodDialog.value = false;
    formRef.value.resetFields();
    editingFood.value = null;
    
    // 重置表单数据
    formData.value = {
      selectedFoodId: null, // 【新增】重置选中的食物ID
      name: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(':').slice(0, 2).join(':'),
      portion: 100,
      unit: 'g',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败: 请稍后再试');
  } finally {
    saving.value = false; // 隐藏加载状态
  }
}

// 删除食物记录
function deleteFood(id) {
  ElMessageBox.confirm('确定要删除这条食物记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 确认删除后过滤掉该记录
    foodRecords.value = foodRecords.value.filter(record => record.id !== id);
    // 按时间降序排序，确保最新时间在最上面
    foodRecords.value.sort((a, b) => new Date(b.time) - new Date(a.time));
    saveFoodRecords(); // 保存更新后的列表
    ElMessage.success('删除成功');
  }).catch(() => {
    // 取消删除时不执行任何操作
  });
}

// --- 新增函数区域开始 ---

// 1. 加载食物数据库
async function loadFoodDatabase() {
  try {
    // 确保这里的 API 路径与您 /eat 页面获取数据的路径一致
    const response = await fetch("/api/food-items")
    const res = await response.json()
    const data = (res.data || [])
    allFoodDatabase.value = data
    // 初始化显示前10条，或者留空等待搜索
    searchResults.value = data.slice(0, 10)
  } catch (err) {
    console.error("加载食物库失败", err)
    ElMessage.warning("无法加载食物库，请手动输入营养数据")
  }
}

// 2. 搜索方法 (用户输入时触发)
const searchFood = (query) => {
  if (query) {
    searchLoading.value = true
    setTimeout(() => {
      searchLoading.value = false
      // 模糊搜索
      searchResults.value = allFoodDatabase.value.filter(item => {
        return item.name.toLowerCase().includes(query.toLowerCase())
      })
    }, 200)
  } else {
    searchResults.value = []
  }
}

// 3. 核心：选中食物后的自动填充
const handleFoodSelect = (id) => {
  if (!id) {
    // 清空选择时重置数据
    formData.value.name = ''
    formData.value.calories = 0
    formData.value.protein = 0
    formData.value.carbs = 0
    formData.value.fat = 0
    return
  }

  const selectedFood = allFoodDatabase.value.find(item => item.id === id)
  
  if (selectedFood) {
    formData.value.name = selectedFood.name
    
    const per100 = {
      cal: selectedFood.calories_per_100g || 0,
      pro: selectedFood.protein_per_100g || 0,
      carb: selectedFood.carbs_per_100g || 0,
      fat: selectedFood.fat_per_100g || 0
    }

    // 按分量换算 (假设单位是 g)
    const ratio = (formData.value.portion || 100) / 100
    
    formData.value.calories = Number((per100.cal * ratio).toFixed(1))
    formData.value.protein = Number((per100.pro * ratio).toFixed(1))
    formData.value.carbs = Number((per100.carb * ratio).toFixed(1))
    formData.value.fat = Number((per100.fat * ratio).toFixed(1))
    
    ElMessage.success(`已填充 ${selectedFood.name} 数据`)
  }
}

// 4. 监听分量变化，动态重算
const onPortionChange = () => {
  if (formData.value.selectedFoodId) {
    handleFoodSelect(formData.value.selectedFoodId)
  }
}

// 5. 切换目标编辑模式
const toggleGoalEditMode = () => {
  if (isGoalEditMode.value) {
    // 保存编辑，切换到非编辑模式
    saveGoal() // 保存每日营养目标
    isGoalEditMode.value = false
    ElMessage.success('营养目标已保存')
  } else {
    // 进入编辑模式
    isGoalEditMode.value = true
  }
}
// --- 新增函数区域结束 ---

// 格式化时间显示
function formatTime(timeStr) {
  if (!timeStr) return ''
  
  const date = new Date(timeStr)
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '时间未知'
  }
  
  // 统一显示月日和时间，格式为：月/日 时:分
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '/').replace(', ', ' ')
}

// 获取分析周期内的天数
function getDaysInPeriod() {
  const now = new Date()
  let days = 1
  
  switch (analysisPeriod.value) {
    case 'today':
      days = 1
      break
    case 'week':
      days = 7
      break
    case 'month':
      // 获取当前月份的天数
      days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      break
  }
  
  return days
}
</script>

<style scoped>
.diet-management-system {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  animation: fadeIn 0.8s ease-in-out;
}

.page-header h1 {
  margin-bottom: 10px;
  font-size: 28px;
  color: #303133;
}

.page-header p {
  color: #909399;
  margin: 0;
}

.main-content {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.food-record-card {
  flex: 1;
}

.nutrition-analysis-card {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.food-card {
  margin-bottom: 10px;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.food-info h4 {
  margin: 0 0 5px 0;
  color: #303133;
}

.food-info p {
  margin: 2px 0;
  color: #606266;
  font-size: 14px;
}

.nutrition-overview {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
}

.nutrition-item {
  text-align: center;
}

.nutrition-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.nutrition-label span:first-child {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.nutrition-label span:last-child {
  font-size: 14px;
  color: #303133;
}

/* 营养输入框样式 */
.nutrition-input {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
}

.nutrition-input .el-input-number {
  width: 100px;
}

.nutrition-input .unit {
  font-size: 14px;
  color: #606266;
}

.chart-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  background: conic-gradient(
    from 0deg,
    #409EFF 0deg 360deg
  );
}

.chart-center {
  position: absolute;
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-title {
  font-size: 14px;
  color: #606266;
}

.chart-segments {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-origin: center;
  overflow: hidden;
}

.segment-label {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
}

.statistics-info {
  margin-top: 30px;
}



.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .nutrition-overview {
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .chart-container {
    width: 150px;
    height: 150px;
  }
  
  .chart-center {
    width: 70px;
    height: 70px;
  }
}
</style>