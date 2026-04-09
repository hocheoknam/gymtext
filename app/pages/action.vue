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

          <div class="exercise-details" style="padding: 15px;">
            <h3 class="exercise-name">{{ item.name }}</h3>
            <div class="tags">
              <el-tag size="small">{{ item.body_part }}</el-tag>
              <el-tag size="small" type="success" style="margin-left: 5px;">{{ item.equipment }}</el-tag>
              <el-tag 
                v-if="item.level" 
                size="small" 
                :type="item.level === '高级' ? 'danger' : (item.level === '中级' ? 'warning' : 'info')" 
                style="margin-left: 5px;" 
              >
                {{ item.level }}
              </el-tag>
            </div>

            <p class="description" v-if="item.description">
              {{ item.description }}
            </p>

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
import { ArrowLeft, Tools, Picture } from '@element-plus/icons-vue'

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
      exercises.value = res.data
      allExercises.value = res.data // 存储原始数据
      console.log('数据加载成功:', exercises.value.length, '条记录')
      // 输出第一条数据的结构，以便了解字段名
      if (exercises.value.length > 0) {
        console.log('第一条数据结构:', exercises.value[0])
        console.log('字段名:', Object.keys(exercises.value[0]))
      }
    } else if (res.data) {
      // 兼容不同的返回格式
      exercises.value = res.data
      allExercises.value = res.data
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
  margin-top: 10px;
}

.exercise-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
  border-radius: 12px;
  overflow: hidden;
}

.exercise-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.gif-container {
  width: 100%;
  height: 180px; /* 固定高度，防止页面抖动 */
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.gif-container img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证图片铺满容器 */
}

.placeholder-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.exercise-details {
  padding: 15px;
}

.exercise-name {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
}

.tags {
  margin-bottom: 12px;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

/* 描述文字的具体样式 */
.description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 10px 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; /* 限制 3 行 */
  line-clamp: 3;         /* 加上这一行，警告就会消失 */
  overflow: hidden;
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