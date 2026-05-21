<template>
  <div class="training-library">
    <div class="header-section">
      <el-button @click="navigateTo('/home')" :icon="ArrowLeft" circle />
      <h2 class="title">标准动作库</h2>
    </div>

    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-select v-model="filterBodyPart" placeholder="选择部位" clearable @change="filterData">
            <el-option
              v-for="option in bodyPartOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-select v-model="filterEquipment" placeholder="选择器械" clearable @change="filterData">
            <el-option
              v-for="option in equipmentOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-select v-model="filterLevel" placeholder="选择级别" clearable @change="filterData">
            <el-option label="全部级别" value="" />
            <el-option label="初级 (Beginner)" value="初级" />
            <el-option label="中级 (Intermediate)" value="中级" />
            <el-option label="高级 (Advanced)" value="高级" />
          </el-select>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20" class="action-grid">
      <el-col 
        v-for="item in exercises" 
        :key="item.id" 
        :xs="24" :sm="12" :md="8" :lg="6" 
      >
        <el-card class="exercise-card" :body-style="{ padding: '0px' }">
          <div class="gif-container">
            <img 
              v-if="item.image_url" 
              :src="item.image_url" 
              @error="(e) => e.target.style.display = 'none'"
            />
            <div class="placeholder-box" v-else>
              <el-icon :size="40" color="#C0C4CC"><Picture /></el-icon>
              <span style="color: #909399; font-size: 12px; margin-top: 5px;">暂无动作演示</span>
            </div>
          </div>

          <div class="exercise-details">
            <h3 class="exercise-name">{{ item.name }}</h3>
            <div class="exercise-tags">
              <el-tag size="small">{{ item.body_part }}</el-tag>
              <el-tag size="small" type="success">{{ item.equipment }}</el-tag>
              <el-tag 
                v-if="item.level" 
                size="small" 
                :type="item.level === '高级' ? 'danger' : (item.level === '中级' ? 'warning' : 'info')"
                effect="dark"
              >
                {{ item.level }}
              </el-tag>
            </div>

            <div class="description-container">
              <p :class="['exercise-description', { 'is-expanded': item.showAll }]">
                {{ item.description }}
              </p>
              <div class="expand-icon" @click="item.showAll = !item.showAll">
                <el-icon v-if="!item.showAll"><ArrowDown /></el-icon>
                <el-icon v-else><ArrowUp /></el-icon>
              </div>
            </div>

            <div v-if="item.sets_reps" class="suggestion">
              建议：{{ item.sets_reps }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="exercises.length === 0" description="暂无训练内容" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { navigateTo } from 'nuxt/app'
import { useHead } from '#imports'
import { ArrowLeft, Tools, Picture, ArrowDown, ArrowUp } from '@element-plus/icons-vue'

// 添加 meta 标签防止图片防盗链
useHead({
  meta: [
    { name: 'referrer', content: 'no-referrer' }
  ]
})

const exercises = ref([])
const allExercises = ref([]) // 存储所有原始数据
const filterBodyPart = ref('')
const filterEquipment = ref('')
const filterLevel = ref('')

const bodyPartOptions = ref([
  { label: '全部部位', value: '' },
  { label: '胸部', value: '胸部' },
  { label: '背部', value: '背部' },
  { label: '肩部', value: '肩部' },
  { label: '手臂', value: '手臂' },
  { label: '下肢', value: '下肢' },
  { label: '腹部', value: '腹部' }
])

const equipmentOptions = ref([
  { label: '全部器械', value: '' },
  { label: '杠铃', value: '杠铃' },
  { label: '哑铃', value: '哑铃' },
  { label: '龙门架/拉力器', value: '龙门架' },
  { label: '史密斯架', value: '史密斯架' },
  { label: '哈克机/倒蹬机', value: '机' },
  { label: '自重/其他', value: '体重' }
])

// 获取数据
const loadExercises = async () => {
  try {
    console.log('开始加载动作库数据...')
    // 确保请求的是标准动作库接口
    const res = await $fetch('/api/exercise_logs')
    console.log('API 返回结果:', res)
    
    // 检查返回格式
    if (res.code === 200 && res.data) {
      // 为每个动作增加一个 showAll 属性，控制展开/折叠
      exercises.value = res.data.map(ex => ({
        ...ex,
        showAll: false
      }))
      allExercises.value = res.data.map(ex => ({
        ...ex,
        showAll: false
      })) // 存储原始数据
      console.log('数据加载成功:', exercises.value.length, '条记录')
      // 输出第一条数据的结构，以便了解字段名
      if (exercises.value.length > 0) {
        console.log('第一条数据结构:', exercises.value[0])
        console.log('字段名:', Object.keys(exercises.value[0]))
      }
    } else if (res.data) {
      // 兼容不同的返回格式
      // 为每个动作增加一个 showAll 属性，控制展开/折叠
      exercises.value = res.data.map(ex => ({
        ...ex,
        showAll: false
      }))
      allExercises.value = res.data.map(ex => ({
        ...ex,
        showAll: false
      })) // 存储原始数据
      console.log('数据加载成功（兼容格式）:', exercises.value.length, '条记录')
      // 输出第一条数据的结构，以便了解字段名
      if (exercises.value.length > 0) {
        console.log('第一条数据结构:', exercises.value[0])
        console.log('字段名:', Object.keys(exercises.value[0]))
      }
    } else {
      console.error('API 返回格式不正确:', res)
      exercises.value = []
      allExercises.value = []
    }
    return res
  } catch (error) {
    console.error('获取动作库失败:', error)
    exercises.value = []
    allExercises.value = []
    throw error
  }
}

// 筛选数据
const filterData = () => {
  if (!allExercises.value) return;
  
  console.log('开始筛选数据...');
  console.log('筛选条件 - 部位:', filterBodyPart.value);
  console.log('筛选条件 - 器械:', filterEquipment.value);
  console.log('筛选条件 - 级别:', filterLevel.value);
  console.log('筛选前数据量:', allExercises.value.length);

  exercises.value = allExercises.value.filter(item => {
    // 逻辑：如果没选(空)，直接过；如果选了，看数据库里的字是否包含选中的字
    // 增加 trim() 防止数据库里有看不见的空格
    const bodyPartValue = String(item.body_part || '').trim();
    const equipmentValue = String(item.equipment || '').trim();
    const levelValue = item.level;
    
    const matchesBodyPart = !filterBodyPart.value || 
                            bodyPartValue.includes(filterBodyPart.value);
    
    const matchesEquipment = !filterEquipment.value || 
                             equipmentValue.includes(filterEquipment.value);
                              
    const matchesLevel = !filterLevel.value || 
                         levelValue === filterLevel.value;
    
    // 输出详细的匹配信息
    if (filterBodyPart.value) {
      console.log(`部位匹配 - 数据: "${bodyPartValue}", 条件: "${filterBodyPart.value}", 结果: ${matchesBodyPart}`);
    }
    
    return matchesBodyPart && matchesEquipment && matchesLevel;
  });
  
  // 确保每个动作都有 showAll 属性
  exercises.value = exercises.value.map(ex => ({
    ...ex,
    showAll: false
  }));
  
  console.log('筛选后数据量:', exercises.value.length);
  console.log('筛选完成');
};

onMounted(() => {
  loadExercises()
})
</script>

<style scoped>
.training-library {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.filter-card {
  margin-bottom: 30px;
}

.action-grid {
  margin-top: 20px; /* 增加與上方篩選欄的距離 */
}

.exercise-card {
  margin-bottom: 30px; /* 增加上下卡片之間的間距 */
  transition: transform 0.3s;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.exercise-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.gif-container {
  width: 100%;
  height: 200px;
  background-color: #f8f9fb; /* 稍微淺一點的底色 */
  border-bottom: 1px solid #ebeef5; /* 加一條淡淡的分割線 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.gif-container img {
  /* 核心修改：使用 contain 替换 cover */
  width: 100%;
  height: 100%;
  object-fit: contain;
  
  /* 确保动图不会被放大得太模糊 */
  max-width: 100%;
  max-height: 100%;
}

.placeholder-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.exercise-details {
  padding: 20px; /* 增加內邊距，不要讓內容貼邊 */
  display: flex;
  flex-direction: column;
  gap: 12px; /* 【核心】利用 gap 自動讓子元件產生固定間距 */
}

.exercise-name {
  margin: 0; /* 清除默認邊距，交給父級 gap 處理 */
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.exercise-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px; /* 標籤之間也拉開距離 */
}

/* 描述容器 */
.description-container {
  position: relative;
  margin-bottom: 0;
}

.exercise-description {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6; /* 增加行高，讓文字不擠 */
  
  /* 默认只显示一行 */
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 展开状态：取消行数限制 */
.exercise-description.is-expanded {
  line-clamp: 1;
  -webkit-line-clamp: initial;
  display: block;
}

/* 下拉图标样式 */
.expand-icon {
  text-align: center;
  cursor: pointer;
  color: #409EFF;
  font-size: 12px;
  padding-top: 4px;
}

.expand-icon:hover {
  color: #66b1ff;
}

.suggestion {
  margin-top: 10px;
  font-size: 12px;
  color: #409EFF;
  background-color: #ecf5ff;
  padding: 5px 10px;
  border-radius: 4px;
}

.equipment {
  font-size: 13px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>