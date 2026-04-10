<template>
  <div class="plan-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-top">
        <el-button type="default" @click="navigateToHome">
          <el-icon :icon="ArrowLeft" />
          返回首页
        </el-button>
      </div>
      <h1>健身饮食计划表</h1>
      <p>管理您的健身和饮食计划，或使用AI生成个性化计划</p>
    </div>

    <!-- AI生成计划按钮 -->
    <div class="ai-plan-section">
      <div class="ai-plan-header">
        <el-button type="primary" size="large" :loading="generatingAIPlan" @click="showAIConfigDialog = true">
          <el-icon :icon="MagicStick" />
          使用AI生成计划
        </el-button>
        <div class="plan-creation-tips">
          <el-icon :icon="Document" />
          <span>您可以自行添加训练和食物计划或使用AI为您生成个性化计划</span>
        </div>
      </div>
      <el-button type="success" size="large" @click="saveAllPlans">
        <el-icon :icon="Document" />
        保存所有计划
      </el-button>
    </div>

    <!-- 计划内容区域 -->
    <div class="plan-content">
      <!-- 健身计划卡片 -->
      <el-card class="plan-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>健身计划</span>
            <el-button type="primary" size="small" @click="showAddExerciseDialog = true">
              <el-icon :icon="Plus" />
              添加训练
            </el-button>
          </div>
        </template>

        <!-- 健身计划列表 -->
        <div class="plan-list">
          <el-empty v-if="exercisePlans.length === 0" description="暂无健身计划">
            <el-button type="primary" @click="showAddExerciseDialog = true">开始添加</el-button>
          </el-empty>
          <el-timeline v-else>
            <el-timeline-item
              v-for="(plan, index) in sortedExercisePlans"
              :key="plan.id"
              :timestamp="plan.day"
              placement="top"
            >
              <el-card :body-style="{ padding: '15px' }" class="exercise-card" hoverable>
                <div class="plan-info">
                  <h4>{{ plan.title }}</h4>
                  <p><strong>训练类型:</strong> {{ plan.type }}</p>
                  <p><strong>时长:</strong> {{ plan.duration }} 分钟</p>
                  <p><strong>强度:</strong> {{ plan.intensity }}</p>
                  <p v-if="plan.description"><strong>训练内容:</strong> {{ plan.description }}</p>
                  <p v-if="plan.sets > 0"><strong>训练量:</strong> {{ plan.sets }} 组 x {{ plan.reps }} 次 | 休息 {{ plan.rest_time }}s</p>
                  <p><strong>详情:</strong> {{ plan.details }}</p>
                  
                  <!-- 动作演示 -->
                  <div v-if="plan.workout_plan && plan.workout_plan.length > 0" class="workout-details">
                    <h5>训练动作</h5>
                    <div v-for="(item, index) in plan.workout_plan" :key="index" class="workout-item">
                      <div class="workout-item-info">
                        <span class="exercise-name">{{ item.exercise_name }}</span>
                        <div class="specs">{{ item.sets }} 组 x {{ item.reps }} 次 | 休息 {{ item.rest_time }}s</div>
                      </div>

                    </div>
                  </div>
                </div>
                <div class="plan-actions">
                  <el-button type="primary" size="small" @click="editExercisePlan(plan)">
                    <el-icon :icon="EditPen" />
                    编辑
                  </el-button>
                  <el-button type="danger" size="small" @click="deleteExercisePlan(plan.id)">
                    <el-icon :icon="Delete" />
                    删除
                  </el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>

      <!-- 食物计划卡片 -->
      <el-card class="plan-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>食物计划</span>
            <el-button type="primary" size="small" @click="showAddMealDialog = true">
              <el-icon :icon="Plus" />
              添加餐食
            </el-button>
          </div>
        </template>

        <!-- 食物计划列表 -->
        <div class="plan-list">
          <el-empty v-if="mealPlans.length === 0" description="暂无食物计划">
            <el-button type="primary" @click="showAddMealDialog = true">开始添加</el-button>
          </el-empty>
          <el-timeline v-else>
            <el-timeline-item
              v-for="(plan, index) in sortedMealPlans"
              :key="plan.id"
              :timestamp="plan.day + ' ' + plan.mealType"
              placement="top"
            >
              <el-card :body-style="{ padding: '15px' }" class="meal-card" hoverable>
                <div class="plan-info">
                  <!-- AI建议理由 -->
                  <div v-if="plan.ai_reason" class="ai-reason">
                    <el-tag type="info" effect="dark">AI建议</el-tag>
                    <p>{{ plan.ai_reason }}</p>
                  </div>
                  <h4>{{ plan.title }}</h4>
                  <p><strong>餐食类型:</strong> {{ plan.mealType }}</p>
                  <p><strong>热量:</strong> {{ plan.calories }} kcal</p>
                  <p><strong>营养成分:</strong> {{ plan.nutrition }}</p>
                  <p><strong>详情:</strong> {{ plan.details }}</p>
                </div>
                <div class="plan-actions">
                  <el-button type="primary" size="small" @click="editMealPlan(plan)">
                    <el-icon><EditPen /></el-icon>
                    编辑
                  </el-button>
                  <el-button type="danger" size="small" @click="deleteMealPlan(plan.id)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>
    </div>

    <!-- 添加/编辑健身计划对话框 -->
    <el-dialog
      v-model="showAddExerciseDialog"
      :title="editingExercise ? '编辑健身计划' : '添加健身计划'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="exerciseForm" label-width="100px" :rules="exerciseRules" ref="exerciseFormRef">
        <el-form-item label="计划日期" prop="day">
          <el-select v-model="exerciseForm.day" placeholder="选择日期">
            <el-option label="周一" value="周一" />
            <el-option label="周二" value="周二" />
            <el-option label="周三" value="周三" />
            <el-option label="周四" value="周四" />
            <el-option label="周五" value="周五" />
            <el-option label="周六" value="周六" />
            <el-option label="周日" value="周日" />
          </el-select>
        </el-form-item>
        <el-form-item label="训练名称" prop="title">
          <el-input v-model="exerciseForm.title" placeholder="输入训练名称" />
        </el-form-item>
        <el-form-item label="训练类型" prop="type">
          <el-select v-model="exerciseForm.type" placeholder="选择训练类型">
            <el-option label="力量训练" value="力量训练" />
            <el-option label="有氧运动" value="有氧运动" />
            <el-option label="柔韧性训练" value="柔韧性训练" />
            <el-option label="HIIT" value="HIIT" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="训练时长" prop="duration">
          <el-input-number v-model="exerciseForm.duration" :min="5" :max="240" :step="5" />
          <span class="unit">分钟</span>
        </el-form-item>
        <el-form-item label="训练强度" prop="intensity">
          <el-select v-model="exerciseForm.intensity" placeholder="选择训练强度">
            <el-option label="低" value="低" />
            <el-option label="中" value="中" />
            <el-option label="高" value="高" />
          </el-select>
        </el-form-item>
        <el-form-item label="训练内容" prop="description">
          <el-input v-model="exerciseForm.description" type="textarea" :rows="2" placeholder="输入具体的动作内容，如：哑铃推举、俯卧撑等" />
        </el-form-item>
        <el-form-item label="训练量" prop="sets">
          <div style="display: flex; align-items: center; gap: 10px;">
            <el-input-number v-model="exerciseForm.sets" :min="0" placeholder="组数" />
            <span>组  x</span>
            <el-input-number v-model="exerciseForm.reps" :min="0" placeholder="次数" />
            <span>次</span>
          </div>
        </el-form-item>
        <el-form-item label="组间休息" prop="rest_time">
          <el-input-number v-model="exerciseForm.rest_time" :min="0" :step="10" />
          <span class="unit">秒</span>
        </el-form-item>
        <el-form-item label="训练详情" prop="details">
          <el-input v-model="exerciseForm.details" type="textarea" :rows="4" placeholder="输入训练详情" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddExerciseDialog = false">取消</el-button>
          <el-button type="primary" @click="saveExercisePlan" :loading="savingExercise">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加/编辑食物计划对话框 -->
    <el-dialog
      v-model="showAddMealDialog"
      :title="editingMeal ? '编辑食物计划' : '添加食物计划'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="mealForm" label-width="100px" :rules="mealRules" ref="mealFormRef">
        <el-form-item label="计划日期" prop="day">
          <el-select v-model="mealForm.day" placeholder="选择日期">
            <el-option label="周一" value="周一" />
            <el-option label="周二" value="周二" />
            <el-option label="周三" value="周三" />
            <el-option label="周四" value="周四" />
            <el-option label="周五" value="周五" />
            <el-option label="周六" value="周六" />
            <el-option label="周日" value="周日" />
          </el-select>
        </el-form-item>
        <el-form-item label="餐食类型" prop="mealType">
          <el-select v-model="mealForm.mealType" placeholder="选择餐食类型">
            <el-option label="早餐" value="早餐" />
            <el-option label="午餐" value="午餐" />
            <el-option label="晚餐" value="晚餐" />
          </el-select>
        </el-form-item>
        <el-form-item label="餐食名称" prop="title">
          <el-input v-model="mealForm.title" placeholder="输入餐食名称" />
        </el-form-item>
        <el-form-item label="热量" prop="calories">
          <el-input-number v-model="mealForm.calories" :min="0" :max="3000" :step="10" />
          <span class="unit">kcal</span>
        </el-form-item>
        <el-form-item label="营养成分" prop="nutrition">
          <el-input v-model="mealForm.nutrition" placeholder="输入营养成分，例如：蛋白质20g，碳水40g" />
        </el-form-item>
        <el-form-item label="餐食详情" prop="details">
          <el-input v-model="mealForm.details" type="textarea" :rows="4" placeholder="输入餐食详情" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddMealDialog = false">取消</el-button>
          <el-button type="primary" @click="saveMealPlan" :loading="savingMeal">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- API Key配置对话框 -->
    <el-dialog
      v-model="showAPIKeyDialog"
      title="DeepSeek API Key配置"
      width="500px"
      destroy-on-close
    >
      <el-form :model="apiKeyForm" label-width="120px">
        <el-form-item label="API Key">
          <el-input v-model="apiKeyForm.apiKey" type="password" placeholder="请输入DeepSeek API Key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAPIKeyDialog = false">取消</el-button>
          <el-button type="primary" @click="saveAPIKey">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- AI生成计划配置对话框 -->
    <el-dialog
      v-model="showAIConfigDialog"
      title="AI计划生成配置"
      width="500px"
      destroy-on-close
    >
      <el-form :model="aiConfig" label-width="120px">
        <el-form-item label="当前体重 (kg)">
          <div style="display: flex; gap: 10px; width: 100%;">
            <el-input-number 
              v-model="aiConfig.weight" 
              :min="30" 
              :max="200" 
              :step="0.1" 
              :precision="1"
              placeholder="获取中..."
            />
            <el-button @click="fetchLatestBodyStats">
              <el-icon :icon="Refresh" />
              同步最新
            </el-button>
          </div>
          <p style="font-size: 12px; color: #909399; margin: 5px 0 0 0;">
            数据来源：数据中心最新记录
          </p>
        </el-form-item>
        <el-form-item label="体脂率 (%)">
          <el-input-number 
            v-model="aiConfig.bodyFat" 
            :min="1" 
            :max="50" 
            :step="0.5" 
            :precision="1"
          />
          <span class="unit">%</span>
        </el-form-item>
        <el-form-item label="每周频率">
          <el-input-number v-model="aiConfig.frequency" :min="1" :max="7" :step="1" />
          <span class="unit">次/周</span>
        </el-form-item>
        <el-form-item label="运动经验">
          <el-select v-model="aiConfig.level" placeholder="选择运动经验">
            <el-option label="初学者" value="beginner" />
            <el-option label="中级" value="intermediate" />
            <el-option label="高级" value="advanced" />
          </el-select>
        </el-form-item>
        <el-form-item label="健身目标">
          <el-select v-model="aiConfig.goal" placeholder="选择健身目标">
            <el-option label="增肌" value="muscle_gain" />
            <el-option label="减脂" value="fat_loss" />
            <el-option label="维持身材" value="maintenance" />
            <el-option label="提高体能" value="fitness" />
          </el-select>
        </el-form-item>
        <el-form-item label="每天时长">
          <el-input-number v-model="aiConfig.dailyDuration" :min="15" :max="120" :step="15" />
          <span class="unit">分钟</span>
        </el-form-item>
        <el-form-item label="饮食偏好">
          <el-select v-model="aiConfig.dietPreference" placeholder="选择饮食偏好">
            <el-option label="均衡饮食" value="balanced" />
            <el-option label="高蛋白" value="high_protein" />
            <el-option label="低碳水" value="low_carb" />
            <el-option label="生酮" value="keto" />
            <el-option label="素食" value="vegetarian" />
            <el-option label="纯素" value="vegan" />
            <el-option label="无麸质" value="gluten_free" />
          </el-select>
        </el-form-item>
        <el-form-item label="每日热量目标">
          <el-input-number v-model="aiConfig.dailyCalories" :min="1000" :max="5000" :step="100" />
          <span class="unit">kcal</span>
        </el-form-item>
        <el-form-item label="食物禁忌">
          <el-input v-model="aiConfig.foodRestrictions" placeholder="请输入食物禁忌，用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAIConfigDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmAIPlanGeneration">确认生成</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { navigateTo } from 'nuxt/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MagicStick, Document, Plus, EditPen, Delete, ArrowLeft, Refresh } from '@element-plus/icons-vue'

// 状态管理：移除了 localStorage 初始化
const exercisePlans = ref([])
const mealPlans = ref([])

// 星期顺序数组
const dayOrder = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// 计算属性：排序后的训练计划
const sortedExercisePlans = computed(() => {
  return [...exercisePlans.value].sort((a, b) => {
    return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
  })
})

// 计算属性：排序后的食物计划
const sortedMealPlans = computed(() => {
  return [...mealPlans.value].sort((a, b) => {
    const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
    if (dayDiff !== 0) {
      return dayDiff
    }
    // 同一天内按照餐食类型排序：早餐 -> 午餐 -> 晚餐
    const mealOrder = ['早餐', '午餐', '晚餐']
    return mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType)
  })
})

// 对话框状态
const showAddExerciseDialog = ref(false)
const showAddMealDialog = ref(false)
const showAIConfigDialog = ref(false)
const showAPIKeyDialog = ref(false)

// 编辑状态
const editingExercise = ref(null)
const editingMeal = ref(null)

// 加载状态
const generatingAIPlan = ref(false)
const savingExercise = ref(false)
const savingMeal = ref(false)
const savingAPIKey = ref(false)

// 表单引用
const exerciseFormRef = ref(null)
const mealFormRef = ref(null)

// AI配置
const aiConfig = ref({
  weight: 60,
  bodyFat: 15,
  frequency: 3,
  level: 'intermediate',
  goal: 'fat_loss',
  dailyDuration: 60,
  dietPreference: 'balanced',
  dailyCalories: 2000,
  foodRestrictions: ''
})

// API Key表单
const apiKeyForm = ref({ apiKey: '' })
const apiKey = ref('')

// 获取最新身体数据的函数
const fetchLatestBodyStats = async () => {
  try {
    // 调用数据中心接口，与 data.vue 使用相同的 API
    const response = await fetch(`/api/body-metrics?user_id=${user_id}`);
    const data = await response.json();
    
    if (data.code === 200 && data.data && data.data.length > 0) {
      // 按日期降序排序，获取最新的记录
      const sortedData = [...data.data].sort((a, b) => new Date(b.measurement_date) - new Date(a.measurement_date));
      const latestRecord = sortedData[0];
      
      // 将获取到的数据填充到 aiConfig 中
      aiConfig.value.weight = latestRecord.weight ? Number(latestRecord.weight) : aiConfig.value.weight;
      aiConfig.value.bodyFat = latestRecord.body_fat ? Number(latestRecord.body_fat) : aiConfig.value.bodyFat;
      
      ElMessage.success('已自动从数据中心同步最新身体指标');
    }
  } catch (error) {
    console.error('获取数据中心数据失败:', error);
    // 如果失败了，可以讓用户手动输入，不强制报错
  }
};

// 当显示 AI 配置对话框时自动触发获取
watch(showAIConfigDialog, (newVal) => {
  // 确保只在客户端执行
  if (process.client && newVal) {
    fetchLatestBodyStats();
  }
});

// 健身计划表单
const exerciseForm = ref({
  day: '周一',
  title: '',
  type: '力量训练',
  duration: 60,
  intensity: '中',
  details: '',
  description: '',
  sets: 0,
  reps: 0,
  rest_time: 60
})

// 食物计划表单
const mealForm = ref({
  day: '周一',
  mealType: '早餐',
  title: '',
  calories: 500,
  nutrition: '',
  details: ''
})

// 表单验证规则 (保持不变)
const exerciseRules = {
  title: [
    { required: true, message: '请输入训练名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择训练类型', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '请输入训练时长', trigger: 'blur' }
  ],
  intensity: [
    { required: true, message: '请选择训练强度', trigger: 'change' }
  ],
  details: [
    { required: true, message: '请输入训练详情', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

const mealRules = {
  title: [
    { required: true, message: '请输入餐食名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  mealType: [
    { required: true, message: '请选择餐食类型', trigger: 'change' }
  ],
  calories: [
    { required: true, message: '请输入热量', trigger: 'blur' }
  ],
  details: [
    { required: true, message: '请输入餐食详情', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

// 统一的用户ID获取函数
const getCurrentUserId = () => {
  try {
    // 首先检查是否在浏览器环境中，这是最可靠的检查
    if (typeof window !== 'undefined' && window.localStorage) {
      let currentUserId = null;
      try {
        const token = window.localStorage.getItem('token');
        
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
            currentUserId = window.localStorage.getItem('user_id');
            console.log('从localStorage直接获取的用户ID:', currentUserId);
          }
        } else {
          // 尝试直接从localStorage获取用户ID
          currentUserId = window.localStorage.getItem('user_id');
          console.log('从localStorage直接获取的用户ID:', currentUserId);
        }
        
        // 如果没有获取到用户ID，使用默认值1（与打卡时保持一致）
        if (!currentUserId) {
          currentUserId = 1;
          console.log('使用默认用户ID:', currentUserId);
        }
        
        return currentUserId;
      } catch (error) {
        console.error('访问localStorage失败:', error);
        // 访问localStorage失败时返回默认值
        return 1;
      }
    }
  } catch (error) {
    console.error('获取用户ID失败:', error);
  }
  
  // 服务器端或出错时返回默认ID，避免崩溃
  return 1;
};

// 获取用户ID
const user_id = getCurrentUserId();

// 加载API Key
async function loadAPIKey() {
  try {
    const response = await fetch('/api/deepseek-key')
    const data = await response.json()
    if (data.code === 200 && data.data) {
      apiKey.value = data.data.apiKey
      apiKeyForm.value.apiKey = data.data.apiKey
    }
  } catch (error) {
    console.error('加载API Key失败:', error)
  }
}

// 保存API Key (保持不变)
async function saveAPIKey() {
  try {
    savingAPIKey.value = true
    const response = await fetch('/api/deepseek-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ api_key: apiKeyForm.value.apiKey })
    })
    const data = await response.json()
    if (data.code === 200) {
      apiKey.value = apiKeyForm.value.apiKey
      ElMessage.success('API Key保存成功')
      showAPIKeyDialog.value = false
    } else {
      ElMessage.error('API Key保存失败: ' + data.message)
    }
  } catch (error) {
    console.error('保存API Key失败:', error)
    ElMessage.error('保存API Key失败，请稍后重试')
  } finally {
    savingAPIKey.value = false
  }
}

// --- 核心逻辑修改 ---

// 1. 页面加载时：从服务器获取数据
onMounted(() => {
  loadAPIKey()
  loadPlansFromServer() // 替换原来的 loadPlans()
})

// 2. 加载计划：从后端获取
async function loadPlansFromServer() {
  try {
    const response = await fetch(`/api/get-plans?user_id=${user_id}`)
    const data = await response.json()
    if (data.code === 200) {
      exercisePlans.value = data.data.exercises || []
      // 核心修复：将服务器返回的 meal_type 映射到前端使用的 mealType
      mealPlans.value = (data.data.meals || []).map(meal => ({
        ...meal,
        mealType: meal.meal_type || meal.mealType
      }))
    }
  } catch (error) {
    console.error('加载失败:', error)
    ElMessage.warning('加载历史数据失败，将使用本地空数据')
  }
}

// 3. 保存所有计划：改为发送到服务器
// 注意：这个函数现在是 async 的
async function saveAllPlans() {
  try {
    await saveAllPlansToServer()
    ElMessage.success('云端同步成功')
  } catch (error) {
    console.error('同步失败:', error)
    ElMessage.error('同步失败，请检查网络')
  }
}

// 4. 新增：发送数据到服务器的核心函数
async function saveAllPlansToServer() {
  const response = await fetch('/api/save-plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: user_id, // 必须传用户ID
      exercises: exercisePlans.value,
      meals: mealPlans.value
    })
  })
  const result = await response.json()
  if (result.code !== 200) throw new Error(result.message)
}

// --- 其他逻辑保持不变，但需要微调 ---

// 打开编辑健身计划
function editExercisePlan(plan) {
  editingExercise.value = plan
  exerciseForm.value = { ...plan }
  showAddExerciseDialog.value = true
}

// 保存健身计划 (保持逻辑不变，最后会调用 saveAllPlans)
async function saveExercisePlan() {
  if (!exerciseFormRef.value) return
  try {
    await exerciseFormRef.value.validate()
    savingExercise.value = true

    const exerciseData = {
      ...exerciseForm.value,
      id: editingExercise.value ? editingExercise.value.id : Date.now().toString()
    }

    if (editingExercise.value) {
      const index = exercisePlans.value.findIndex(p => p.id === editingExercise.value.id)
      if (index !== -1) exercisePlans.value[index] = exerciseData
    } else {
      exercisePlans.value.push(exerciseData)
    }

    ElMessage.success(editingExercise.value ? '更新成功' : '添加成功')
    showAddExerciseDialog.value = false
    resetExerciseForm()

    // 触发云端同步
    await saveAllPlans()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    savingExercise.value = false
  }
}

// 重置健身计划表单
function resetExerciseForm() {
  editingExercise.value = null
  exerciseForm.value = {
    day: '周一',
    title: '',
    type: '力量训练',
    duration: 60,
    intensity: '中',
    details: '',
    description: '',
    sets: 0,
    reps: 0,
    rest_time: 60
  }
  if (exerciseFormRef.value) {
    exerciseFormRef.value.resetFields()
  }
}

// 删除健身计划
function deleteExercisePlan(id) {
  ElMessageBox.confirm('确定要删除这个健身计划吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    exercisePlans.value = exercisePlans.value.filter(p => p.id !== id)
    await saveAllPlans()
    ElMessage.success('健身计划已删除')
  }).catch(() => {
    // 取消删除
  })
}

// 打开编辑食物计划
function editMealPlan(plan) {
  editingMeal.value = plan
  mealForm.value = { ...plan }
  showAddMealDialog.value = true
}

// 保存食物计划 (保持逻辑不变，最后会调用 saveAllPlans)
async function saveMealPlan() {
  if (!mealFormRef.value) return
  try {
    await mealFormRef.value.validate()
    savingMeal.value = true

    const mealData = {
      ...mealForm.value,
      id: editingMeal.value ? editingMeal.value.id : Date.now().toString()
    }

    if (editingMeal.value) {
      const index = mealPlans.value.findIndex(p => p.id === editingMeal.value.id)
      if (index !== -1) mealPlans.value[index] = mealData
    } else {
      mealPlans.value.push(mealData)
    }

    ElMessage.success(editingMeal.value ? '更新成功' : '添加成功')
    showAddMealDialog.value = false
    resetMealForm()

    // 触发云端同步
    await saveAllPlans()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    savingMeal.value = false
  }
}

// 重置食物计划表单
function resetMealForm() {
  editingMeal.value = null
  mealForm.value = {
    day: '周一',
    mealType: '早餐',
    title: '',
    calories: 500,
    nutrition: '',
    details: ''
  }
  if (mealFormRef.value) {
    mealFormRef.value.resetFields()
  }
}

// 删除食物计划
function deleteMealPlan(id) {
  ElMessageBox.confirm('确定要删除这个食物计划吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    mealPlans.value = mealPlans.value.filter(p => p.id !== id)
    await saveAllPlans()
    ElMessage.success('食物计划已删除')
  }).catch(() => {
    // 取消删除
  })
}

// 5. AI生成计划逻辑修改
// 关键点：AI生成数据后，先更新本地数组，再调用 saveAllPlans 存入数据库
async function confirmAIPlanGeneration() {
  try {
    showAIConfigDialog.value = false
    generatingAIPlan.value = true

    // 1. 分别生成健身计划和饮食计划
    ElMessage.info('正在生成健身计划...')
    const workoutPlan = await generateWorkoutPlanWithDeepSeek()
    
    ElMessage.info('正在生成饮食计划...')
    const mealPlan = await generateMealPlanWithDeepSeek()

    // 2. 清空旧数据，填入新数据 (使用不可变更新确保响应式系统检测到变化)
    // 先清空数组
    exercisePlans.value = []
    mealPlans.value = []
    
    // 使用 setTimeout 确保 DOM 更新
    await new Promise(resolve => {
      setTimeout(() => {
        // 使用扩展运算符创建新数组，确保响应式系统检测到变化
        exercisePlans.value = [...(workoutPlan.exercises || [])]
        mealPlans.value = [...(mealPlan.meals || [])]
        console.log('更新后的数据:', { exercisePlans: exercisePlans.value, mealPlans: mealPlans.value })
        console.log('更新后的数据长度:', { exercises: exercisePlans.value.length, meals: mealPlans.value.length })
        resolve()
      }, 0)
    })

    // 3. 立即保存到数据库
    // 注意：这里必须 await，确保数据存进去了再提示用户
    await saveAllPlans()

    ElMessage.success('AI计划生成并保存成功！')

  } catch (error) {
    console.error('AI计划生成失败:', error)
    ElMessage.error('生成或保存失败')
  } finally {
    generatingAIPlan.value = false
  }
}

// 使用DeepSeek API生成健身计划
async function generateWorkoutPlanWithDeepSeek() {
  console.log('使用DeepSeek API生成健身计划')
  
  if (!apiKey.value) {
    showAPIKeyDialog.value = true
    throw new Error('请先配置DeepSeek API Key')
  }
  
  // 创建AbortController用于设置超时
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5分钟超时
  
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.value}`
      },
      signal: controller.signal, // 传递signal用于超时控制
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的健身教练，需要为用户生成每周的健身计划。请根据用户的体重、体脂率、每周训练频率、训练经验和健身目标，生成一个详细的7天计划。每个训练日应该包含具体的动作、组数、次数和休息时间。'
          },
          {
            role: 'user',
            content: `作为一个健身专家，请根据以下数据生成计划：\n体重 ${aiConfig.value.weight}kg，体脂 ${aiConfig.value.bodyFat}%，每周训练 ${aiConfig.value.frequency}次，级别 ${aiConfig.value.level}，目标 ${aiConfig.value.goal}。\n每天训练时长：${aiConfig.value.dailyDuration}分钟\n\n要求：返回JSON格式，包含exercise_id、sets、reps、rest_time。\n动作必须匹配其 ${aiConfig.value.level} 级别。\n\n请按照以下JSON格式返回结果，保持JSON精简：\n{\n  "exercises": [\n    {\n      "day": "周一",\n      "title": "训练名称",\n      "type": "训练类型",\n      "duration": 60,\n      "intensity": "中",\n      "details": "训练详情（简洁描述，不超过20字）",\n      "workout_plan": [\n        {\n          "exercise_id": 1,\n          "exercise_name": "动作名称",\n          "sets": 3,\n          "reps": 12,\n          "rest_time": 60\n        }\n      ]\n    },\n    // 其他天的训练计划...\n  ]\n}\n\n**重要提示**：\n1. 只返回精简的JSON数据，不要包含任何Markdown标签或解释性文字\n2. 确保JSON格式正确，括号匹配，字符串使用双引号\n3. 不要包含任何注释或多余的空格\n4. 严格按照要求的格式返回，不要添加额外的字段\n5. 保持details字段简洁，不超过20字，避免冗长描述\n6. 保持所有字段值简洁明了，避免不必要的修饰词`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    clearTimeout(timeoutId); // 清除超时定时器
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('AI API响应（健身计划）:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('API响应格式错误');
    }
    
    const content = data.choices[0].message.content;
    console.log('AI生成内容（健身计划）:', content);
    
    // 解析AI响应
    const parsedData = parseAIResponse(content);
    return parsedData;
  } catch (error) {
    clearTimeout(timeoutId); // 清除超时定时器
    if (error.name === 'AbortError') {
      throw new Error('API请求超时，请检查网络连接后重试');
    }
    throw error;
  }
}

// 分析昨日营养数据
const yesterdayNutrition = computed(() => {
  // 假设从 food_records 获取昨日总量
  return { protein: 60, carbs: 200, fat: 50 }; // 示例数据
});

// 使用DeepSeek API生成饮食计划
async function generateMealPlanWithDeepSeek() {
  console.log('使用DeepSeek API生成饮食计划')
  
  if (!apiKey.value) {
    showAPIKeyDialog.value = true
    throw new Error('请先配置DeepSeek API Key')
  }
  
  // 解析食物禁忌
  const userRestrictions = aiConfig.value.foodRestrictions ? aiConfig.value.foodRestrictions.split(',').map(item => item.trim()) : [];
  
  // 创建AbortController用于设置超时
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000); // 3分钟超时
  
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.value}`
      },
      signal: controller.signal, // 传递signal用于超时控制
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的营养教练，需要为用户生成每周的饮食计划。请根据用户的体重、体脂率、饮食偏好、热量目标和食物禁忌，生成一个详细的7天计划。每个工作日只需要生成早餐、午餐和晚餐三种餐食，不要包含加餐。请在生成计划时考虑用户的营养缺口。'
          },
          {
            role: 'user',
            content: `分析用户昨日摄入：蛋白质 ${yesterdayNutrition.value.protein}g，碳水 ${yesterdayNutrition.value.carbs}g，脂肪 ${yesterdayNutrition.value.fat}g。\n如果蛋白质低于 ${aiConfig.value.weight * 1.5}g，请在今日饮食方案中增加高蛋白食物。\n\n请为我生成一个7天的饮食计划，具体要求如下：\n体重 ${aiConfig.value.weight}kg，体脂 ${aiConfig.value.bodyFat}%\n饮食偏好：${aiConfig.value.dietPreference}\n每日热量目标：${aiConfig.value.dailyCalories}kcal\n用户禁忌：${userRestrictions.join('，')}（严禁出现这些食材）。\n\n重要要求：\n1. 每个工作日只需要生成早餐、午餐和晚餐三种餐食，不要包含加餐。\n2. 根据饮食偏好调整宏量营养素比例：\n   - 如果选择了"生酮"，请确保蛋白质:脂肪:碳水的比例约为 20:70:10\n   - 如果选择了"纯素"，请确保蛋白质来源充足，建议多使用豆类、坚果等植物蛋白\n\n请按照以下JSON格式返回结果，**不要包含 ai_reason 字段**，保持JSON精简：\n{\n  "meals": [\n    {\n      "day": "周一",\n      "mealType": "早餐",\n      "title": "餐食名称",\n      "calories": 500,\n      "nutrition": "营养成分（简洁描述，不超过15字）",\n      "details": "餐食详情（简洁描述，不超过20字）"\n    },\n    {\n      "day": "周一",\n      "mealType": "午餐",\n      "title": "餐食名称",\n      "calories": 500,\n      "nutrition": "营养成分（简洁描述，不超过15字）",\n      "details": "餐食详情（简洁描述，不超过20字）"\n    },\n    {\n      "day": "周一",\n      "mealType": "晚餐",\n      "title": "餐食名称",\n      "calories": 500,\n      "nutrition": "营养成分（简洁描述，不超过15字）",\n      "details": "餐食详情（简洁描述，不超过20字）"\n    },\n    // 其他天的餐食计划...\n  ]\n}\n\n**重要提示**：\n1. 只返回精简的JSON数据，不要包含任何Markdown标签或解释性文字\n2. 确保JSON格式正确，括号匹配，字符串使用双引号\n3. 不要包含任何注释或多余的空格\n4. 严格按照要求的格式返回，不要添加额外的字段\n5. 保持所有字段值简洁明了，避免不必要的修饰词\n6. nutrition字段不超过15字，details字段不超过20字，避免冗长描述`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    clearTimeout(timeoutId); // 清除超时定时器
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('AI API响应（饮食计划）:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('API响应格式错误');
    }
    
    const content = data.choices[0].message.content;
    console.log('AI生成内容（饮食计划）:', content);
    
    // 解析AI响应
    const parsedData = parseAIResponse(content);
    
    // 验证AI建议
    validateAISuggestion(parsedData.meals || []);
    
    return parsedData;
  } catch (error) {
    clearTimeout(timeoutId); // 清除超时定时器
    if (error.name === 'AbortError') {
      throw new Error('API请求超时，请检查网络连接后重试');
    }
    throw error;
  }
}

// 验证AI建议
const validateAISuggestion = (plan) => {
  const userRestrictions = aiConfig.value.foodRestrictions ? aiConfig.value.foodRestrictions.split(',').map(item => item.trim()) : [];
  
  const containsIllegal = plan.some(food => 
    userRestrictions.some(r => food.title && food.title.includes(r))
  );
  
  if (containsIllegal) {
    console.error("AI 方案包含禁忌食物，拦截中...");
    // 重新触发生成或手动修正
  }
};



// 清洗JSON字符串中的脏字符
function cleanDirtyJSON(dirtyString) {
  // 1. 移除 Markdown 包裹
  let cleanStr = dirtyString.replace(/```json/g, '').replace(/```/g, '').trim();
  
  // 2. 【核心修复】移除所有非标准的 Unicode 空白字符和控制字符
  // 这个正则会移除包括不间断空格在内的特殊空白
  cleanStr = cleanStr.replace(/[\u200B-\u200D\uFEFF\xA0]/g, '');
  
  // 3. 只移除行首和行尾的空白，保留JSON内部的空格结构
  cleanStr = cleanStr.trim();
  
  return cleanStr;
}

// 返回首页
function navigateToHome() {
  navigateTo('/home');
}

// 解析AI响应
function parseAIResponse(content) {
  console.log('解析AI响应:', content);
  try {
    // 检查content是否有效
    if (!content || content === 'undefined' || content === '"undefined"') {
      throw new Error('无效的响应内容');
    }
    
    // 1. 只做基础清洗：移除Markdown代码块标记
    let cleanContent = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    console.log('清洗后的内容:', cleanContent);
    
    // 2. 检查是否由于截断导致末尾缺少 ] 或 }
    if (!cleanContent.endsWith('}')) {
      console.warn("检测到JSON可能被截断，尝试修复...");
      // 简单的自动补齐尝试（仅针对当前截断点）
      if (cleanContent.includes('"meals": [')) {
        cleanContent += '}]}';
      } else if (cleanContent.includes('"exercises": [')) {
        cleanContent += '}]}';
      }
      console.log('尝试修复后的内容:', cleanContent);
    }
    
    // 3. 提取完整的JSON部分（忽略JSON后面的额外内容）
    let jsonEndIndex = -1;
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < cleanContent.length; i++) {
      const char = cleanContent[i];
      
      // 处理字符串中的字符
      if (inString) {
        if (escapeNext) {
          escapeNext = false;
        } else if (char === '\\') {
          escapeNext = true;
        } else if (char === '"') {
          inString = false;
        }
      } else {
        // 处理大括号
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            jsonEndIndex = i + 1;
            break;
          }
        } else if (char === '"') {
          inString = true;
        }
      }
    }
    
    // 提取完整的JSON部分
    if (jsonEndIndex !== -1) {
      cleanContent = cleanContent.substring(0, jsonEndIndex);
      console.log('提取的JSON部分:', cleanContent);
    } else {
      console.error('无法找到完整的JSON结构');
      throw new Error('AI响应内容格式不完整（可能由于字数超限），请减少生成天数重试');
    }
    
    // 3. 检查括号是否匹配
    let openBraceCount = (cleanContent.match(/\{/g) || []).length;
    let closeBraceCount = (cleanContent.match(/\}/g) || []).length;
    if (openBraceCount !== closeBraceCount) {
      console.error('JSON括号不匹配，内容被截断');
      console.log('开括号数量:', openBraceCount);
      console.log('闭括号数量:', closeBraceCount);
      throw new Error('AI响应内容被截断，请重新生成计划');
    }
    
    // 3. 直接尝试解析
    let parsedData;
    try {
      parsedData = JSON.parse(cleanContent);
      console.log('解析成功:', parsedData);
    } catch (parseError) {
      console.error('解析失败:', parseError);
      // 打印准备解析的字符串，看看它到底长什么样
      console.log('准备解析的字符串:', cleanContent);
      throw new Error('解析AI响应失败，请重新生成计划');
    }
    
    // 处理健身计划
    const exercises = [];
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    
    // 兼容不同的JSON结构
    if (parsedData.exercises && Array.isArray(parsedData.exercises)) {
      // 结构0: 直接的exercises数组（最常见的结构）
      parsedData.exercises.forEach((exercise, index) => {
        // 确保workout_plan中的rest_time是数字类型
        if (exercise.workout_plan && Array.isArray(exercise.workout_plan)) {
          exercise.workout_plan.forEach(item => {
            if (item.rest_time) {
              item.rest_time = Number(item.rest_time);
            }
          });
        }
        
        exercises.push({
          id: `ai-exercise-${index}`,
          day: exercise.day || '周一', // 确保day不为null
          title: exercise.title || '训练', // 确保title不为null
          type: exercise.type || '力量训练', // 确保type不为null
          duration: exercise.duration || 60, // 默认时长
          intensity: exercise.intensity || '中', // 默认强度
          details: exercise.details || '训练详情',
          workout_plan: exercise.workout_plan || []
        });
      });
    } else if (parsedData.workoutPlan && Array.isArray(parsedData.workoutPlan)) {
      // 结构1: workoutPlan数组
      parsedData.workoutPlan.forEach((dayPlan, index) => {
        dayPlan.exercises.forEach((exercise, exerciseIndex) => {
          exercises.push({
            id: `ai-exercise-${index}-${exerciseIndex}`,
            day: dayPlan.day || '周一', // 确保day不为null
            title: exercise.name || '训练', // 确保title不为null
            type: dayPlan.type || '力量训练', // 确保type不为null
            duration: 60, // 默认时长
            intensity: '中', // 默认强度
            details: exercise.details || `${exercise.name || '训练'} - ${exercise.sets || 3}组 - ${exercise.reps || 12}`
          });
        });
      });
    } else if (parsedData['健身计划'] && parsedData['健身计划']['训练日安排']) {
      // 结构2: 健身计划.训练日安排
      parsedData['健身计划']['训练日安排'].forEach((dayPlan, index) => {
        dayPlan['动作'].forEach((exercise, exerciseIndex) => {
          exercises.push({
            id: `ai-exercise-${index}-${exerciseIndex}`,
            day: (dayPlan['训练日'] || '周一').split('：')[0], // 确保day不为null
            title: exercise['名称'] || '训练', // 确保title不为null
            type: '力量训练', // 默认类型
            duration: 60, // 默认时长
            intensity: '中', // 默认强度
            details: `${exercise['名称'] || '训练'} - ${exercise['组数'] || 3}组 - ${exercise['次数'] || exercise['持续时间'] || 12} ${exercise['备注'] ? ' - ' + exercise['备注'] : ''}`
          });
        });
      });
    } else if (parsedData.weekly_schedule && Array.isArray(parsedData.weekly_schedule)) {
      // 结构3: weekly_schedule数组
      parsedData.weekly_schedule.forEach((dayPlan, index) => {
        if (dayPlan.exercises && Array.isArray(dayPlan.exercises)) {
          dayPlan.exercises.forEach((exercise, exerciseIndex) => {
            exercises.push({
              id: `ai-exercise-${index}-${exerciseIndex}`,
              day: dayPlan.day || '周一', // 确保day不为null
              title: exercise.name || '训练', // 确保title不为null
              type: dayPlan.focus || '力量训练', // 确保type不为null
              duration: 60, // 默认时长
              intensity: '中', // 默认强度
              details: `${exercise.name || '训练'} - ${exercise.sets || 3}组 - ${exercise.reps || 12} ${exercise.rest_sec ? ' - 休息' + exercise.rest_sec + '秒' : ''}`
            });
          });
        }
      });
    }
    
    // 处理饮食计划
    const meals = [];
    const mealTypes = ['早餐', '午餐', '晚餐'];
    
    if (parsedData.meals && Array.isArray(parsedData.meals)) {
      // 结构0: 直接的meals数组（最常见的结构）
      parsedData.meals.forEach((meal, index) => {
        // 过滤掉加餐
        if (meal.mealType !== '加餐' && meal.meal_type !== '加餐') {
          meals.push({
            id: `ai-meal-${index}`,
            day: meal.day || '周一', // 确保day不为null
            mealType: meal.mealType || meal.meal_type || '早餐', // 确保mealType不为null，兼容meal_type
            title: meal.title || '餐食', // 确保title不为null
            calories: meal.calories || 500, // 确保calories不为null
            nutrition: meal.nutrition || '营养均衡', // 确保nutrition不为null
            details: meal.details || '详细内容' // 确保details不为null
          });
        }
      });
    } else if (parsedData.mealPlan && Array.isArray(parsedData.mealPlan)) {
      // 结构1: mealPlan数组
      parsedData.mealPlan.forEach((meal, index) => {
        // 过滤掉加餐
        if (meal.mealType !== '加餐' && meal.meal_type !== '加餐') {
          meals.push({
            id: `ai-meal-${index}`,
            day: meal.day || '周一', // 确保day不为null
            mealType: meal.mealType || meal.meal_type || '早餐', // 确保mealType不为null，兼容meal_type
            title: meal.title || '餐食', // 确保title不为null
            calories: meal.calories || 500, // 确保calories不为null
            nutrition: meal.nutrition || '营养均衡', // 确保nutrition不为null
            details: meal.details || '详细内容' // 确保details不为null
          });
        }
      });
    }
    
    console.log('处理后的数据:', { exercises, meals });
    return {
      exercises,
      meals
    };
  } catch (error) {
    console.error('解析JSON失败:', error);
    console.error('解析失败的原始内容:', content);
    // 解析失败时抛出错误，让用户重新生成
    throw new Error('AI响应内容格式不完整（可能由于字数超限），请减少生成天数重试');
  }
}
</script>

<style scoped>
.plan-management {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.header-top {
  text-align: left;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 10px;
  text-align: center;
}

.page-header p {
  color: #909399;
  margin: 0;
  text-align: center;
}

.ai-plan-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.plan-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.plan-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-list {
  margin-top: 20px;
}

.exercise-card, .meal-card {
  margin-bottom: 10px;
}

.plan-info h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.plan-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.plan-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.unit {
  margin-left: 10px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .plan-content {
    grid-template-columns: 1fr;
  }
  
  .ai-plan-section {
    flex-direction: column;
    align-items: center;
  }
}
</style>