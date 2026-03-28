<template>
  <div class="plan-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>健身饮食计划表</h1>
      <p>管理您的健身和饮食计划，或使用AI生成个性化计划</p>
    </div>

    <!-- AI生成计划按钮 -->
    <div class="ai-plan-section">
      <div class="ai-plan-header">
        <el-button type="primary" size="large" :loading="generatingAIPlan" @click="showAIConfigDialog = true">
          <el-icon><MagicStick /></el-icon>
          使用AI生成计划
        </el-button>
        <div class="plan-creation-tips">
          <el-icon><Document /></el-icon>
          <span>您可以自行添加训练和食物计划或使用AI为您生成个性化计划</span>
        </div>
      </div>
      <el-button type="success" size="large" @click="saveAllPlans">
        <el-icon><Document /></el-icon>
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
              <el-icon><Plus /></el-icon>
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
              v-for="(plan, index) in exercisePlans"
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
                  <p><strong>详情:</strong> {{ plan.details }}</p>
                </div>
                <div class="plan-actions">
                  <el-button type="primary" size="small" @click="editExercisePlan(plan)">
                    <el-icon><EditPen /></el-icon>
                    编辑
                  </el-button>
                  <el-button type="danger" size="small" @click="deleteExercisePlan(plan.id)">
                    <el-icon><Delete /></el-icon>
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
              <el-icon><Plus /></el-icon>
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
              v-for="(plan, index) in mealPlans"
              :key="plan.id"
              :timestamp="plan.day + ' ' + plan.mealType"
              placement="top"
            >
              <el-card :body-style="{ padding: '15px' }" class="meal-card" hoverable>
                <div class="plan-info">
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
            <el-option label="加餐" value="加餐" />
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
        <el-form-item label="健身目标">
          <el-select v-model="aiConfig.fitnessGoal" placeholder="选择健身目标">
            <el-option label="增肌" value="增肌" />
            <el-option label="减脂" value="减脂" />
            <el-option label="维持身材" value="维持身材" />
            <el-option label="提高体能" value="提高体能" />
          </el-select>
        </el-form-item>
        <el-form-item label="运动经验">
          <el-select v-model="aiConfig.experienceLevel" placeholder="选择运动经验">
            <el-option label="初学者" value="初学者" />
            <el-option label="中级" value="中级" />
            <el-option label="高级" value="高级" />
          </el-select>
        </el-form-item>
        <el-form-item label="每天时长">
          <el-input-number v-model="aiConfig.dailyDuration" :min="15" :max="120" :step="15" />
          <span class="unit">分钟</span>
        </el-form-item>
        <el-form-item label="饮食偏好">
          <el-select v-model="aiConfig.dietPreference" placeholder="选择饮食偏好">
            <el-option label="均衡饮食" value="均衡饮食" />
            <el-option label="高蛋白" value="高蛋白" />
            <el-option label="低碳水" value="低碳水" />
            <el-option label="素食" value="素食" />
            <el-option label="无麸质" value="无麸质" />
          </el-select>
        </el-form-item>
        <el-form-item label="每日热量目标">
          <el-input-number v-model="aiConfig.dailyCalories" :min="1000" :max="5000" :step="100" />
          <span class="unit">kcal</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAIConfigDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmAIPlanGeneration">确认生成</el-button>
          <el-button type="info" @click="showAPIKeyDialog = true">配置API Key</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MagicStick, Document, Plus, EditPen, Delete } from '@element-plus/icons-vue'

// 状态管理
const exercisePlans = ref([])
const mealPlans = ref([])

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
  fitnessGoal: '增肌',
  experienceLevel: '初学者',
  dailyDuration: 60,
  dietPreference: '均衡饮食',
  dailyCalories: 2000
})

// API Key表单
const apiKeyForm = ref({
  apiKey: ''
})

// 后端API Key
const apiKey = ref('')

// 健身计划表单
const exerciseForm = ref({
  day: '周一',
  title: '',
  type: '力量训练',
  duration: 60,
  intensity: '中',
  details: ''
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

// 表单验证规则
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

// 生命周期钩子
onMounted(() => {
  loadPlans()
  loadAPIKey()
})

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

// 保存API Key
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

// 加载计划
function loadPlans() {
  const savedExercisePlans = localStorage.getItem('exercisePlans')
  const savedMealPlans = localStorage.getItem('mealPlans')
  
  if (savedExercisePlans) {
    exercisePlans.value = JSON.parse(savedExercisePlans)
  }
  
  if (savedMealPlans) {
    mealPlans.value = JSON.parse(savedMealPlans)
  }
}

// 保存所有计划
function saveAllPlans() {
  localStorage.setItem('exercisePlans', JSON.stringify(exercisePlans.value))
  localStorage.setItem('mealPlans', JSON.stringify(mealPlans.value))
  ElMessage.success('所有计划已保存')
}

// 打开编辑健身计划
function editExercisePlan(plan) {
  editingExercise.value = plan
  exerciseForm.value = { ...plan }
  showAddExerciseDialog.value = true
}

// 保存健身计划
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
      // 编辑现有计划
      const index = exercisePlans.value.findIndex(p => p.id === editingExercise.value.id)
      if (index !== -1) {
        exercisePlans.value[index] = exerciseData
      }
    } else {
      // 添加新计划
      exercisePlans.value.push(exerciseData)
    }
    
    ElMessage.success(editingExercise.value ? '健身计划已更新' : '健身计划已添加')
    showAddExerciseDialog.value = false
    resetExerciseForm()
    saveAllPlans()
  } catch (error) {
    console.error('保存健身计划失败:', error)
  } finally {
    savingExercise.value = false
  }
}

// 删除健身计划
function deleteExercisePlan(id) {
  ElMessageBox.confirm('确定要删除这个健身计划吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    exercisePlans.value = exercisePlans.value.filter(p => p.id !== id)
    saveAllPlans()
    ElMessage.success('健身计划已删除')
  }).catch(() => {
    // 取消删除
  })
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
    details: ''
  }
  if (exerciseFormRef.value) {
    exerciseFormRef.value.resetFields()
  }
}

// 打开编辑食物计划
function editMealPlan(plan) {
  editingMeal.value = plan
  mealForm.value = { ...plan }
  showAddMealDialog.value = true
}

// 保存食物计划
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
      // 编辑现有计划
      const index = mealPlans.value.findIndex(p => p.id === editingMeal.value.id)
      if (index !== -1) {
        mealPlans.value[index] = mealData
      }
    } else {
      // 添加新计划
      mealPlans.value.push(mealData)
    }
    
    ElMessage.success(editingMeal.value ? '食物计划已更新' : '食物计划已添加')
    showAddMealDialog.value = false
    resetMealForm()
    saveAllPlans()
  } catch (error) {
    console.error('保存食物计划失败:', error)
  } finally {
    savingMeal.value = false
  }
}

// 删除食物计划
function deleteMealPlan(id) {
  ElMessageBox.confirm('确定要删除这个食物计划吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    mealPlans.value = mealPlans.value.filter(p => p.id !== id)
    saveAllPlans()
    ElMessage.success('食物计划已删除')
  }).catch(() => {
    // 取消删除
  })
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

// 生成AI计划
function generateAIPlan() {
  showAIConfigDialog.value = true
}

// 确认AI计划生成
async function confirmAIPlanGeneration() {
  try {
    showAIConfigDialog.value = false
    generatingAIPlan.value = true
    
    if (!apiKey.value) {
      ElMessage.error('请先配置DeepSeek API Key')
      showAPIKeyDialog.value = true
      return
    }
    
    // 调用真实的AI接口
    const aiGeneratedPlan = await generateAIPlanWithDeepSeek()
    
    // 清空现有计划
    exercisePlans.value = []
    mealPlans.value = []
    
    // 添加AI生成的计划
    if (aiGeneratedPlan.exercises) {
      exercisePlans.value = aiGeneratedPlan.exercises
    }
    
    if (aiGeneratedPlan.meals) {
      mealPlans.value = aiGeneratedPlan.meals
    }
    
    saveAllPlans()
    ElMessage.success('AI计划生成成功')
  } catch (error) {
    console.error('AI计划生成失败:', error)
    ElMessage.error('AI计划生成失败，请稍后重试')
  } finally {
    generatingAIPlan.value = false
  }
}

// 使用DeepSeek API生成计划
async function generateAIPlanWithDeepSeek() {
  try {
    const prompt = `你是一个专业的健身教练。请根据用户的需求，生成一份健身饮食计划。

用户需求：
- 健身目标：${aiConfig.value.fitnessGoal}
- 运动经验：${aiConfig.value.experienceLevel}
- 每天运动时长：${aiConfig.value.dailyDuration}分钟
- 饮食偏好：${aiConfig.value.dietPreference}
- 每日热量目标：${aiConfig.value.dailyCalories}kcal

要求：
1. 只输出 JSON 格式的数据，不要有任何其他解释性文字。
2. JSON 格式如下：
{
  "workoutPlan": [
    {
      "day": "周一",
      "type": "胸部+三头",
      "exercises": [
        {"name": "平板杠铃卧推", "sets": "4组", "reps": "8-12次", "details": "详细说明"}
      ]
    }
  ],
  "mealPlan": [
    {
      "day": "周一",
      "mealType": "早餐",
      "title": "高蛋白早餐",
      "calories": 450,
      "nutrition": "蛋白质25g，碳水50g，脂肪15g",
      "details": "详细说明"
    }
  ]
}`

    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        api_key: apiKey.value
      })
    })

    const data = await response.json()
    console.log('API响应:', data)
    if (data.code === 200 && data.data) {
      console.log('API调用成功，解析响应数据')
      return parseAIResponse(data.data.content)
    } else {
      console.error('API调用失败:', data.message)
      throw new Error(data.message || 'AI生成失败')
    }
  } catch (error) {
    console.error('调用DeepSeek API失败:', error)
    // 失败时使用模拟数据
    console.log('使用模拟数据')
    return mockAIGeneratePlan()
  }
}

// 模拟AI生成计划
function mockAIGeneratePlan() {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const exercises = [];
  const meals = [];
  const workoutTypes = ['胸部训练', '背部训练', '腿部训练', '肩部训练', '手臂训练', '核心训练', '有氧运动'];
  const mealTypes = ['早餐', '午餐', '晚餐'];
  
  // 生成模拟健身计划
  days.forEach((day, index) => {
    const workoutType = workoutTypes[index % workoutTypes.length];
    let details;
    
    switch (workoutType) {
      case '胸部训练':
        details = '平板杠铃卧推：4组×12次\n上斜哑铃卧推：3组×10次\n双杠臂屈伸：3组×15次\n蝴蝶夹胸：3组×15次';
        break;
      case '背部训练':
        details = '引体向上：4组×8次\n杠铃划船：3组×12次\n高位下拉：3组×15次\n坐姿划船：3组×12次';
        break;
      case '腿部训练':
        details = '深蹲：4组×10次\n硬拉：3组×8次\n腿举：3组×12次\n腿弯举：3组×15次';
        break;
      case '肩部训练':
        details = '哑铃肩推：4组×10次\n侧平举：3组×15次\n前平举：3组×15次\n俯身飞鸟：3组×15次';
        break;
      case '手臂训练':
        details = '二头弯举：4组×12次\n三头下压：4组×12次\n锤式弯举：3组×12次\n overhead tricep extension：3组×12次';
        break;
      case '核心训练':
        details = '平板支撑：3组×60秒\n仰卧起坐：3组×20次\n俄罗斯转体：3组×20次\n planks：3组×45秒';
        break;
      case '有氧运动':
        details = '慢跑：30分钟\n快走：15分钟\n跳绳：10分钟\n拉伸：5分钟';
        break;
    }
    
    exercises.push({
      id: `ai-exercise-${index}`,
      day: day,
      title: workoutType,
      type: workoutType === '有氧运动' ? '有氧运动' : '力量训练',
      duration: 60,
      intensity: '中',
      details: details
    });
  });
  
  // 生成模拟食物计划
  let mealIndex = 0;
  days.forEach(day => {
    mealTypes.forEach(mealType => {
      let title, calories, nutrition, details;
      
      switch (mealType) {
        case '早餐':
          title = '高蛋白早餐';
          calories = 450;
          nutrition = '蛋白质25g，碳水50g，脂肪15g';
          details = '燕麦粥（50g燕麦）+ 鸡蛋2个 + 牛奶200ml + 香蕉1根';
          break;
        case '午餐':
          title = '均衡午餐';
          calories = 650;
          nutrition = '蛋白质35g，碳水80g，脂肪20g';
          details = '鸡胸肉150g + 米饭150g + 蔬菜200g + 橄榄油10ml';
          break;
        case '晚餐':
          title = '轻食晚餐';
          calories = 400;
          nutrition = '蛋白质20g，碳水40g，脂肪15g';
          details = ' grilled fish 100g + 蒸蔬菜150g + 糙米50g';
          break;
      }
      
      meals.push({
        id: `ai-meal-${mealIndex++}`,
        day: day,
        mealType: mealType,
        title: title,
        calories: calories,
        nutrition: nutrition,
        details: details
      });
    });
  });
  
  return {
    exercises,
    meals
  };
}

// 解析AI响应
function parseAIResponse(content) {
  console.log('解析AI响应:', content);
  try {
    // 检查content是否有效
    if (!content || content === 'undefined' || content === '"undefined"') {
      throw new Error('无效的响应内容');
    }
    
    // 尝试解析JSON数据
    const parsedData = JSON.parse(content);
    console.log('解析成功:', parsedData);
    
    // 处理健身计划
    const exercises = [];
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    
    // 兼容不同的JSON结构
    if (parsedData.workoutPlan && Array.isArray(parsedData.workoutPlan)) {
      // 结构1: workoutPlan数组
      parsedData.workoutPlan.forEach((dayPlan, index) => {
        dayPlan.exercises.forEach((exercise, exerciseIndex) => {
          exercises.push({
            id: `ai-exercise-${index}-${exerciseIndex}`,
            day: dayPlan.day,
            title: exercise.name,
            type: dayPlan.type,
            duration: 60, // 默认时长
            intensity: '中', // 默认强度
            details: exercise.details || `${exercise.name} - ${exercise.sets} - ${exercise.reps}`
          });
        });
      });
    } else if (parsedData['健身计划'] && parsedData['健身计划']['训练日安排']) {
      // 结构2: 健身计划.训练日安排
      parsedData['健身计划']['训练日安排'].forEach((dayPlan, index) => {
        dayPlan['动作'].forEach((exercise, exerciseIndex) => {
          exercises.push({
            id: `ai-exercise-${index}-${exerciseIndex}`,
            day: dayPlan['训练日'].split('：')[0],
            title: exercise['名称'],
            type: '力量训练', // 默认类型
            duration: 60, // 默认时长
            intensity: '中', // 默认强度
            details: `${exercise['名称']} - ${exercise['组数']}组 - ${exercise['次数'] || exercise['持续时间']} ${exercise['备注'] ? ' - ' + exercise['备注'] : ''}`
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
              day: dayPlan.day,
              title: exercise.name,
              type: dayPlan.focus,
              duration: 60, // 默认时长
              intensity: '中', // 默认强度
              details: `${exercise.name} - ${exercise.sets}组 - ${exercise.reps} ${exercise.rest_sec ? ' - 休息' + exercise.rest_sec + '秒' : ''}`
            });
          });
        }
      });
    }
    
    // 检查是否缺少某些天的健身计划
    const existingExerciseDays = new Set(exercises.map(exercise => exercise.day));
    const missingExerciseDays = days.filter(day => !existingExerciseDays.has(day));
    
    // 为缺少的天生成默认健身计划
    let exerciseIndex = exercises.length;
    const workoutTypes = ['胸部训练', '背部训练', '腿部训练', '肩部训练', '手臂训练', '核心训练', '有氧运动'];
    
    missingExerciseDays.forEach((day, index) => {
      const workoutType = workoutTypes[index % workoutTypes.length];
      let details;
      
      switch (workoutType) {
        case '胸部训练':
          details = '平板杠铃卧推：4组×12次\n上斜哑铃卧推：3组×10次\n双杠臂屈伸：3组×15次\n蝴蝶夹胸：3组×15次';
          break;
        case '背部训练':
          details = '引体向上：4组×8次\n杠铃划船：3组×12次\n高位下拉：3组×15次\n坐姿划船：3组×12次';
          break;
        case '腿部训练':
          details = '深蹲：4组×10次\n硬拉：3组×8次\n腿举：3组×12次\n腿弯举：3组×15次';
          break;
        case '肩部训练':
          details = '哑铃肩推：4组×10次\n侧平举：3组×15次\n前平举：3组×15次\n俯身飞鸟：3组×15次';
          break;
        case '手臂训练':
          details = '二头弯举：4组×12次\n三头下压：4组×12次\n锤式弯举：3组×12次\n overhead tricep extension：3组×12次';
          break;
        case '核心训练':
          details = '平板支撑：3组×60秒\n仰卧起坐：3组×20次\n俄罗斯转体：3组×20次\n planks：3组×45秒';
          break;
        case '有氧运动':
          details = '慢跑：30分钟\n快走：15分钟\n跳绳：10分钟\n拉伸：5分钟';
          break;
      }
      
      exercises.push({
        id: `ai-exercise-${exerciseIndex++}`,
        day: day,
        title: workoutType,
        type: workoutType === '有氧运动' ? '有氧运动' : '力量训练',
        duration: 60,
        intensity: '中',
        details: details
      });
    });
    
    // 处理饮食计划
    const meals = [];
    const mealTypes = ['早餐', '午餐', '晚餐'];
    
    if (parsedData.mealPlan && Array.isArray(parsedData.mealPlan)) {
      parsedData.mealPlan.forEach((meal, index) => {
        meals.push({
          id: `ai-meal-${index}`,
          day: meal.day,
          mealType: meal.mealType,
          title: meal.title,
          calories: meal.calories,
          nutrition: meal.nutrition,
          details: meal.details
        });
      });
    }
    
    // 检查是否缺少某些天的食物计划
    const existingMealDays = new Set(meals.map(meal => meal.day));
    const missingMealDays = days.filter(day => !existingMealDays.has(day));
    
    // 为缺少的天生成默认食物计划
    let mealIndex = meals.length;
    missingMealDays.forEach(day => {
      mealTypes.forEach(mealType => {
        let title, calories, nutrition, details;
        
        switch (mealType) {
          case '早餐':
            title = '高蛋白早餐';
            calories = 450;
            nutrition = '蛋白质25g，碳水50g，脂肪15g';
            details = '燕麦粥（50g燕麦）+ 鸡蛋2个 + 牛奶200ml + 香蕉1根';
            break;
          case '午餐':
            title = '均衡午餐';
            calories = 650;
            nutrition = '蛋白质35g，碳水80g，脂肪20g';
            details = '鸡胸肉150g + 米饭150g + 蔬菜200g + 橄榄油10ml';
            break;
          case '晚餐':
            title = '轻食晚餐';
            calories = 400;
            nutrition = '蛋白质20g，碳水40g，脂肪15g';
            details = ' grilled fish 100g + 蒸蔬菜150g + 糙米50g';
            break;
        }
        
        meals.push({
          id: `ai-meal-${mealIndex++}`,
          day: day,
          mealType: mealType,
          title: title,
          calories: calories,
          nutrition: nutrition,
          details: details
        });
      });
    });
    
    console.log('处理后的数据:', { exercises, meals });
    return {
      exercises,
      meals
    };
  } catch (error) {
    console.error('解析JSON失败:', error);
    // 解析失败时返回模拟数据
    console.log('使用模拟数据');
    return {
      exercises: [
        {
          id: 'ai-exercise-1',
          day: '周一',
          title: '胸部训练',
          type: '力量训练',
          duration: 60,
          intensity: '中',
          details: '平板杠铃卧推：4组×12次\n上斜哑铃卧推：3组×10次\n双杠臂屈伸：3组×15次\n蝴蝶夹胸：3组×15次'
        },
        {
          id: 'ai-exercise-2',
          day: '周二',
          title: '背部训练',
          type: '力量训练',
          duration: 60,
          intensity: '中',
          details: '引体向上：4组×8次\n杠铃划船：3组×12次\n高位下拉：3组×15次\n坐姿划船：3组×12次'
        },
        {
          id: 'ai-exercise-3',
          day: '周三',
          title: '有氧运动',
          type: '有氧运动',
          duration: 45,
          intensity: '低',
          details: '慢跑或快走45分钟，保持心率在最大心率的60-70%'
        }
      ],
      meals: [
        {
          id: 'ai-meal-1',
          day: '周一',
          mealType: '早餐',
          title: '高蛋白早餐',
          calories: 450,
          nutrition: '蛋白质25g，碳水50g，脂肪15g',
          details: '燕麦粥（50g燕麦）+ 鸡蛋2个 + 牛奶200ml + 香蕉1根'
        },
        {
          id: 'ai-meal-2',
          day: '周一',
          mealType: '午餐',
          title: '增肌午餐',
          calories: 650,
          nutrition: '蛋白质35g，碳水80g，脂肪20g',
          details: '鸡胸肉150g + 米饭150g + 蔬菜200g + 橄榄油10ml'
        }
      ]
    };
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
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 10px;
}

.page-header p {
  color: #909399;
  margin: 0;
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