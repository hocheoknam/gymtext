<template>
  <div class="data-page">
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
          <span class="logo-text">数据中心</span>
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
              <a href="/data" class="nav-link">数据中心</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
    
    <main class="main-content">
      <div class="content-container">
        <h1>数据中心</h1>
        <!-- 体重数据展示卡片 -->
        <div class="weight-card">
          <div class="weight-header">
            <h3 class="weight-title">个人体重数据</h3>
            <button class="edit-btn" @click="editWeightData">
              <el-icon size="16"><Edit /></el-icon>
            </button>
          </div>

          <div class="weight-data">
            <!-- 当前体重 -->
            <div class="weight-item current-weight">
              <div class="weight-label">当前体重</div>
              <div class="weight-value">
                {{ formatNumber(currentWeight) }}<span class="weight-unit">kg</span>
              </div>
              <div
                class="weight-trend"
                :class="weightChange < 0 ? 'down' : 'up'"
              >
                {{ weightChange < 0 ? "↓" : "↑" }}
                {{ formatNumber(Math.abs(weightChange)) }}kg
              </div>
            </div>

            <div class="chart-wrapper" style="position: relative; flex: 1;">
              <div id="weight-chart" class="chart-container"></div>

              <div v-if="isWeightRecordModalVisible" class="weight-record-mini-panel">
                <div class="mini-panel-header">
                  <span>{{ editingRecord === null ? '添加记录' : '编辑记录' }}</span>
                  <el-icon class="close-icon" @click="isWeightRecordModalVisible = false"><Close /></el-icon>
                </div>
                
                <el-form :model="newWeightRecord" label-position="top" size="small">
                  <el-form-item label="日期时间">
                    <el-input v-model="newWeightRecord.date" />
                  </el-form-item>
                  <div class="row-inputs">
                    <el-form-item label="体重(kg)">
                      <el-input v-model.number="newWeightRecord.weight" type="number" />
                    </el-form-item>
                    <el-form-item label="体脂(%）">
                      <el-input v-model.number="newWeightRecord.bodyFat" type="number" />
                    </el-form-item>
                  </div>
                  <div class="mini-panel-footer">
                    <el-button size="small" @click="isWeightRecordModalVisible = false">取消</el-button>
                    <el-button size="small" type="primary" @click="saveWeightRecord">保存</el-button>
                  </div>
                </el-form>
              </div>
            </div>
          </div>

          <!-- 体脂率信息 -->
          <div class="body-fat">
            <div class="fat-item">
              <span class="fat-label">体脂率</span>
              <span class="fat-value">{{ formatNumber(bodyFat) }}%</span>
            </div>
          </div>

          <!-- 体重记录管理 -->
          <div class="weight-records-container">
            <div class="section-header" @click="isRecordsExpanded = !isRecordsExpanded">
              <h3>体重记录</h3>
              <div class="header-actions">
                <button class="add-btn" @click.stop="openAddWeightRecordModal">
                  <el-icon size="16"><Plus /></el-icon>
                  添加记录
                </button>
                <button class="expand-btn">
                  <el-icon size="16"><ArrowDown v-if="isRecordsExpanded" /><ArrowUp v-else /></el-icon>
                </button>
              </div>
            </div>
            
            <div v-if="isRecordsExpanded">
              <div v-if="weightRecords.length === 0" class="no-records">
                <p>暂无体重记录，点击上方按钮添加</p>
              </div>
              
              <div v-else class="weight-records-list">
                <div v-for="(record, index) in weightRecords" :key="index" class="record-item">
                  <div class="record-info">
                    <div class="record-date">{{ record.date }}</div>
                    <div class="record-weight">{{ formatNumber(record.weight) }} kg</div>
                    <div class="record-body-fat" v-if="record.bodyFat">体脂率: {{ formatNumber(record.bodyFat) }}%</div>
                  </div>
                  <div class="record-actions">
                    <button class="edit-btn" @click="openEditWeightRecordModal(index)">
                      <el-icon size="14"><Edit /></el-icon>
                      编辑
                    </button>
                    <button class="delete-btn" @click="deleteWeightRecord(index)">
                      <el-icon size="14"><Delete /></el-icon>
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="body-stats-section">
          <h2>身体数据</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">身高</div>
              <div class="stat-value">{{ height }} cm</div>
              <button class="edit-btn" @click="openEditDialog('height')">
                <el-icon size="16"><Edit /></el-icon>
              </button>
            </div>
            <div class="stat-card">
              <div class="stat-label">体重</div>
              <div class="stat-value">{{ formatNumber(weight) }} kg</div>
              <button class="edit-btn" @click="openEditDialog('weight')">
                <el-icon size="16"><Edit /></el-icon>
              </button>
            </div>
            <div class="stat-card">
              <div class="stat-label">体脂率</div>
              <div class="stat-value">{{ formatNumber(body_fat) }}%</div>
              <button class="edit-btn" @click="openEditDialog('body_fat')">
                <el-icon size="16"><Edit /></el-icon>
              </button>
            </div>
            <div class="stat-card">
              <div class="stat-label">BMI</div>
              <div class="stat-value">{{ bmi || '0' }}</div>
            </div>
          </div>
        </div>
        
        <!-- 勋章展示区域 -->
        <div class="achievements-section">
          <h2>我的勋章</h2>
          <div v-if="userAchievements.length === 0" class="no-achievements">
            <p>您还没有获得任何勋章，完成挑战可以获得勋章！</p>
          </div>
          <div v-else class="achievements-list">
            <div v-for="(achievement, index) in userAchievements" :key="index" class="achievement-card">
              <div class="achievement-icon">
                {{ achievement.icon_url ? `<img src="${achievement.icon_url}" alt="${achievement.name}" />` : '🏆' }}
              </div>
              <div class="achievement-info">
                <h3>{{ achievement.name }}</h3>
                <p>{{ achievement.description }}</p>
                <p class="obtained-date">获得时间: {{ formatDate(achievement.obtained_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    


    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editingField === 'height' ? '编辑身高' : editingField === 'weight' ? '编辑体重' : '编辑体脂率'"
      width="300px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item :label="editingField === 'height' ? '身高 (cm)' : editingField === 'weight' ? '体重 (kg)' : '体脂率 (%)'">
          <el-input v-model.number="editForm.value" type="number" :step="editingField === 'height' ? 1 : 0.1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>

  </div>


</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watchEffect } from "vue";
import { navigateTo } from "nuxt/app";
import { ElMessage, ElMessageBox, ElDialog, ElInput, ElButton, ElForm, ElFormItem } from "element-plus";
import {
  HomeFilled,
  VideoPlay,
  Food,
  DataAnalysis,
  Edit,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Plus,
  Delete,
  Close
} from "@element-plus/icons-vue";

// 用户勋章列表
const userAchievements = ref([]);

// 身体数据
const height = ref(170); // 默认身高 (cm)
const weight = ref(65);  // 默认体重 (kg)
const body_fat = ref(18); // 默认体脂率

// 体重数据相关变量
const currentWeight = ref(68);
const targetWeight = ref(65);
const bodyFat = ref(18);
const weightChange = ref(-0.5);

// 体重编辑弹窗相关状态
const isEditModalVisible = ref(false);
const editCurrentWeight = ref(68);
const editTargetWeight = ref(65);
const editBodyFat = ref(18);

// 体重记录相关状态 - 响应式数据
const weightRecords = ref([]);
const isRecordsExpanded = ref(false); // 体重记录折叠状态

// 体重记录编辑弹窗相关状态
const isWeightRecordModalVisible = ref(false);
const editingRecord = ref(null);

// 直接使用当前时间的本地格式，避免时区问题
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const newWeightRecord = ref({
  date: `${year}-${month}-${day} ${hours}:${minutes}`, // 默认当前时间，格式为YYYY-MM-DD HH:mm
  weight: '',
  bodyFat: ''
});

// 图表相关变量
let myChart = null;
let unwatch = null;
const resizeHandler = () => myChart?.resize();

// 使用 computed 自动计算BMI
const bmi = computed(() => {
  // 1. 防止除以 0 或空值
  if (!height.value || !weight.value) return 0;

  // 2. 将身高转换为米 (例如 170cm -> 1.7m)
  const heightInMeters = height.value / 100;

  // 3. 计算 BMI = 体重 / 身高²
  const bmiValue = weight.value / (heightInMeters * heightInMeters);

  // 4. 保留 1 位小数返回
  return bmiValue.toFixed(1);
});

// 编辑对话框状态
const editDialogVisible = ref(false);
const editingField = ref('');
const editForm = ref({ value: '' });

// 格式化数值，保留最多两位小数，去除末尾的零
function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return '0';
  
  // 先保留两位小数
  let formatted = parsed.toFixed(2);
  
  // 去除末尾的零
  if (formatted.includes('.')) {
    formatted = formatted.replace(/\.?0+$/, '');
  }
  
  return formatted;
}

// 格式化日期（24小时制）
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// 格式化日期时间
function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 编辑体重数据
function editWeightData() {
  editCurrentWeight.value = currentWeight.value;
  editTargetWeight.value = targetWeight.value;
  editBodyFat.value = bodyFat.value;
  isEditModalVisible.value = true;
}

// 打开添加体重记录模态框
function openAddWeightRecordModal() {
  // 1. 获取当前时间的基础信息
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  // 2. 获取上一次的体脂率数据
  // 逻辑：如果 weightRecords 数组有数据，取第一条（因为已经按时间降序排序，第一条就是最新的）
  let lastBodyFat = '';
  if (weightRecords.value && weightRecords.value.length > 0) {
    // 假设 weightRecords 已经按时间降序排列，第一条就是最近一次记录
    lastBodyFat = weightRecords.value[0].bodyFat || '';
  } else if (body_fat.value) {
    // 如果记录表里没有，尝试从当前显示的 body_fat 变量里拿
    lastBodyFat = body_fat.value;
  }

  // 3. 赋值给新记录对象
  newWeightRecord.value = {
    date: `${year}-${month}-${day} ${hours}:${minutes}`,
    weight: '', // 体重通常每次都要重新称，所以保持为空
    bodyFat: lastBodyFat // 自动填充上一次的体脂
  };

  isWeightRecordModalVisible.value = true;
  editingRecord.value = null;
}

// 打开编辑体重记录模态框
function openEditWeightRecordModal(index) {
  const record = weightRecords.value[index];
  editingRecord.value = index;
  newWeightRecord.value = {
    date: record.date,
    weight: record.weight,
    bodyFat: record.bodyFat
  };
  isWeightRecordModalVisible.value = true;
}

// 保存体重记录
async function saveWeightRecord() {
  if (!newWeightRecord.value.weight) {
    ElMessage.error('请输入体重');
    return;
  }

  // --- 新增：6 小时检查规则 ---
  if (weightRecords.value && weightRecords.value.length > 0) {
    // 获取输入框中的日期对象
    const inputDate = new Date(newWeightRecord.value.date);
    
    // 获取已存在的最新一条记录的时间 (weightRecords 已按时间降序排列，第一条即为最近)
    // 注意：如果是编辑现有记录，则不触发这个 6 小时规则（或者根据需求跳过对比自身）
    if (editingRecord.value === null) {
      const lastRecordDate = new Date(weightRecords.value[0].date);
      
      // 计算时间差（毫秒）
      const diffInMs = Math.abs(inputDate - lastRecordDate);
      const diffInHours = diffInMs / (1000 * 60 * 60);

      if (diffInHours < 6) {
        ElMessage.warning(`两次记录间隔需大于 6 小时 (当前间隔: ${diffInHours.toFixed(1)} 小时)`);
        return; // 拦截，不继续执行保存
      }
    }
  }
  // -------------------------
  
  try {
    // 获取用户ID
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
    
    // 准备请求数据
    const requestData = {
      user_id: currentUserId,
      weight_kg: parseFloat(newWeightRecord.value.weight),
      body_fat: newWeightRecord.value.bodyFat ? parseFloat(newWeightRecord.value.bodyFat) : null,
      measurement_date: new Date(newWeightRecord.value.date).toISOString()
    };
    
    // 发送请求
    const response = await $fetch('/api/body-metrics', {
      method: 'POST',
      body: requestData
    });
    
    if (response.code === 200) {
      ElMessage.success('保存成功');
      // 重新加载体重数据
      await loadWeightData();
      isWeightRecordModalVisible.value = false;
    } else {
      ElMessage.error('保存失败');
    }
  } catch (error) {
    console.error('保存体重记录失败:', error);
    ElMessage.error('保存失败，请稍后重试');
  }
}

// 删除体重记录
async function deleteWeightRecord(index) {
  const record = weightRecords.value[index]; // 获取要删除的那条记录
  
  try {
    await ElMessageBox.confirm('确定要永久删除这条体重记录吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // --- 新增：向后端发送删除请求 ---
    // 使用与其他API一致的格式，通过查询参数传递id
    const response = await $fetch('/api/body-metrics', {
      method: 'DELETE',
      body: {
        id: record.id
      }
    });

    if (response.code === 200) {
      ElMessage.success('删除成功');
      
      // 成功后再更新前端界面
      weightRecords.value.splice(index, 1);
      
      // 重新加载数据以确保图表和当前体重同步更新
      await loadWeightData();
      await loadBodyMetrics();
    } else {
      ElMessage.error('删除失败');
    }
    // ----------------------------

  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除请求出错:', error);
      ElMessage.error('无法连接到服务器，删除失败');
    }
  }
}

// 加载体重数据
async function loadWeightData() {
  try {
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
    
    const response = await fetch(`/api/body-metrics?user_id=${currentUserId}`);
    const data = await response.json();
    
    if (data.code === 200 && data.data && data.data.length > 0) {
      console.log('体重数据:', data.data);
      
      // 处理数据
      const sortedData = [...data.data].sort((a, b) => new Date(b.measurement_date) - new Date(a.measurement_date));
      
      // 更新当前体重和体脂率（使用最新的记录）
      const latestRecord = sortedData[0];
      currentWeight.value = latestRecord.weight;
      bodyFat.value = latestRecord.body_fat;
      
      // 计算体重变化
      if (sortedData.length > 1) {
        const previousRecord = sortedData[1];
        weightChange.value = latestRecord.weight - previousRecord.weight;
      } else {
        weightChange.value = 0;
      }
      
      // 更新体重记录
      weightRecords.value = sortedData.map(record => ({
        id: record.id,
        date: formatDateTime(record.measurement_date),
        weight: record.weight,
        bodyFat: record.body_fat
      }));
    } else {
      console.log('暂无体重数据');
    }
  } catch (error) {
    console.error('获取体重数据失败:', error);
  }
}

// 初始化图表
function initChart() {
  if (typeof window !== "undefined" && window.echarts) {
    const chartDom = document.getElementById("weight-chart");
    if (chartDom) {
      myChart = window.echarts.init(chartDom);

      // 优化图表配置，使用响应式数据
      const updateChart = () => {
        // 确保数据按日期排序
        const sortedRecords = [...weightRecords.value].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const xAxisData = sortedRecords.map(record => record.date); // 显示完整的日期和时间
        const weightData = sortedRecords.map(record => parseFloat(record.weight));
        const bodyFatData = sortedRecords.map(record => record.bodyFat ? parseFloat(record.bodyFat) : null);
        
        return {
          title: {
            text: "体重和体脂率变化趋势",
            left: "center",
            textStyle: { fontSize: 16 },
          },
          tooltip: {
            trigger: "axis",
            formatter: function (params) {
              if (params && params.length > 0 && params[0].dataIndex !== undefined) {
                const record = sortedRecords[params[0].dataIndex];
                let result = `${record.date}<br/>`;
                params.forEach(param => {
                  if (param.seriesName === '体重') {
                    result += `体重: ${formatNumber(record.weight)}kg<br/>`;
                  } else if (param.seriesName === '体脂率' && record.bodyFat) {
                    result += `体脂率: ${formatNumber(record.bodyFat)}%<br/>`;
                  }
                });
                return result;
              }
              return "";
            }
          },
          legend: {
            data: ['体重', '体脂率'],
            top: 30
          },
          xAxis: {
            type: "category",
            data: xAxisData,
            axisLabel: { rotate: 45 },
          },
          yAxis: [
            {
              type: "value",
              name: "体重 (kg)",
              min: function (value) {
                return Math.floor(value.min * 0.95);
              },
            },
            {
              type: "value",
              name: "体脂率 (%)",
              min: 0,
              max: 50,
              axisLabel: {
                formatter: '{value}%'
              }
            }
          ],
          series: [
            {
              name: '体重',
              type: "line",
              smooth: true,
              symbol: "circle",
              symbolSize: 6,
              lineStyle: { width: 3 },
              data: weightData,
              itemStyle: {
                color: '#409eff'
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                    { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
                  ]
                }
              }
            },
            {
              name: '体脂率',
              type: "line",
              smooth: true,
              symbol: "circle",
              symbolSize: 6,
              lineStyle: { width: 3 },
              data: bodyFatData,
              itemStyle: {
                color: '#f9a826'
              },
              yAxisIndex: 1
            }
          ],
          grid: {
            left: "3%",
            right: "3%",
            bottom: "10%",
            containLabel: true,
          },
        };
      };

      // 初始化图表
      myChart.setOption(updateChart());

      // 窗口缩放时自适应
      window.addEventListener("resize", resizeHandler);
      
      // 监听数据变化，更新图表
      unwatch = watchEffect(() => {
        // 直接使用响应式数据变化触发更新
        myChart.setOption(updateChart());
      });
    } else {
      console.error("❌ #weight-chart not found");
    }
  } else {
    console.error("❌ ECharts not loaded. Check CDN in nuxt.config.js");
  }
}

// 显示勋章获得弹窗
function showAchievementPopup(achievement) {
  ElMessageBox.alert(
    `<div style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
      <h3>恭喜你获得新勋章！</h3>
      <p>${achievement.name}</p>
      <p style="color: #666; font-size: 14px;">${achievement.description}</p>
    </div>`,
    '新勋章解锁',
    {
      confirmButtonText: '太棒了',
      dangerouslyUseHTMLString: true
    }
  );
}

// 更新用户勋章列表
function updateUserAchievements(achievements) {
  userAchievements.value = achievements;
  console.log('用户勋章列表已更新:', achievements);
}

// 打开编辑对话框
function openEditDialog(field) {
  editingField.value = field;
  switch (field) {
    case 'height':
      editForm.value.value = height.value;
      break;
    case 'weight':
      editForm.value.value = weight.value;
      break;
    case 'body_fat':
      editForm.value.value = body_fat.value;
      break;
  }
  editDialogVisible.value = true;
}

// 保存编辑的数据
async function saveEdit() {
  if (!editForm.value.value) {
    ElMessage.error('请输入值');
    return;
  }
  
  const value = parseFloat(editForm.value.value);
  if (isNaN(value)) {
    ElMessage.error('请输入有效的数值');
    return;
  }
  
  // 获取用户ID
  let userId = localStorage.getItem('userId');
  if (!userId) {
    // 从Token解析
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        userId = tokenPayload.user_id || tokenPayload.id || tokenPayload.userId;
      } catch (error) {
        console.error('解析Token失败:', error);
        ElMessage.error('无法获取用户信息');
        return;
      }
    }
  }
  
  if (!userId) {
    userId = 3; // 默认用户ID
  }
  
  try {
    // 无论修改哪个字段，都保存到数据库
    const response = await $fetch('/api/body-metrics', {
      method: 'POST',
      body: {
        user_id: userId,
        // 改为 weight_kg 以匹配数据库
        weight_kg: editingField.value === 'weight' ? value : weight.value,
        // 改为 body_fat 以匹配数据库
        body_fat: editingField.value === 'body_fat' ? value : body_fat.value,
        // 改为 height_cm 以匹配数据库
        height_cm: editingField.value === 'height' ? value : height.value,
        measurement_date: new Date().toISOString()
      }
    });
    
    if (response.code === 200) {
      ElMessage.success('保存成功');
      // 同时保存身高到本地存储作为备份
      if (editingField.value === 'height') {
        localStorage.setItem('userHeight', value);
      }
      
      // 保存成功后重新加载数据，确保与数据库同步
      await loadBodyMetrics();
    } else {
      ElMessage.error('数据保存失败');
    }
    
    // 更新本地数据
    switch (editingField.value) {
      case 'height':
        height.value = value;
        break;
      case 'weight':
        weight.value = value;
        break;
      case 'body_fat':
        body_fat.value = value;
        break;
    }
    
    // BMI会自动重新计算，因为它是一个计算属性
    
    editDialogVisible.value = false;
  } catch (error) {
    console.error('保存数据失败:', error);
    ElMessage.error('保存失败，请稍后重试');
  }
}

// 加载身体数据
async function loadBodyMetrics() {
  // 获取用户ID
  let userId = localStorage.getItem('userId');
  if (!userId) {
    // 从Token解析
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        userId = tokenPayload.user_id || tokenPayload.id || tokenPayload.userId;
      } catch (error) {
        console.error('解析Token失败:', error);
      }
    }
  }
  
  if (!userId) {
    userId = 3; // 默认用户ID
  }
  
  console.log('加载身体数据，用户ID:', userId);
  
  try {
    // 从API获取体重和体脂率数据
    const response = await $fetch(`/api/body-metrics?user_id=${userId}`);
    console.log('API响应:', response);
    
    if (response.code === 200 && response.data && response.data.length > 0) {
      // 按日期降序排序，获取最新的记录
      const sortedData = [...response.data].sort((a, b) => {
        return new Date(b.measurement_date) - new Date(a.measurement_date);
      });
      
      const latestRecord = sortedData[0];
      console.log('最新记录:', latestRecord);
      
      weight.value = latestRecord.weight;
      body_fat.value = latestRecord.body_fat;
      // 如果有身高数据，更新身高
      if (latestRecord.height) {
        height.value = latestRecord.height;
        localStorage.setItem('userHeight', latestRecord.height);
      }
    }
  } catch (error) {
    console.error('获取身体数据失败:', error);
  }
  
  // 从本地存储获取身高
  const savedHeight = localStorage.getItem('userHeight');
  if (savedHeight) {
    height.value = parseFloat(savedHeight);
  }
  
  console.log('最终数据:', {
    height: height.value,
    weight: weight.value,
    body_fat: body_fat.value
  });
}

// 在用户完成挑战时调用
async function completeChallenge(challengeId) {
  // 1. 标记挑战为完成
  // ... 这里是完成挑战的逻辑 ...
  
  // 2. 获取用户ID
  let userId = localStorage.getItem('userId');
  if (!userId) {
    // 从Token解析
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        userId = tokenPayload.user_id || tokenPayload.id || tokenPayload.userId;
      } catch (error) {
        console.error('解析Token失败:', error);
        ElMessage.error('无法获取用户信息');
        return;
      }
    }
  }
  
  if (!userId) {
    ElMessage.error('用户未登录');
    return;
  }
  
  // 3. 调用勋章接口
  const achievementCode = 'challenge_finisher';
  
  try {
    const response = await $fetch('/api/award-achievement', {
      method: 'POST',
      body: {
        userId: userId,
        achievementCode: achievementCode
      }
    });

    if (response.code === 200) {
      console.log('勋章已更新！', response.data);
      // 显示勋章获得弹窗
      showAchievementPopup(response.data.newlyObtained);
      
      // 可以更新用户的勋章列表
      updateUserAchievements(response.data.allAchievements);
    }
  } catch (err) {
    console.error('颁发失败', err);
    ElMessage.error('勋章颁发失败，请稍后重试');
  }
}

// 加载用户勋章列表
async function loadUserAchievements() {
  // 获取用户ID
  let userId = localStorage.getItem('userId');
  if (!userId) {
    // 从Token解析
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        userId = tokenPayload.user_id || tokenPayload.id || tokenPayload.userId;
      } catch (error) {
        console.error('解析Token失败:', error);
      }
    }
  }
  
  if (!userId) {
    userId = 3; // 默认用户ID
  }
  
  console.log('加载用户勋章，用户ID:', userId);
  
  // 调用API获取用户勋章列表
  try {
    const response = await $fetch(`/api/user-achievements?user_id=${userId}`);
    console.log('勋章API响应:', response);
    if (response.code === 200) {
      userAchievements.value = response.data;
      console.log('勋章列表已更新:', response.data);
    }
  } catch (error) {
    console.error('获取勋章列表失败:', error);
  }
}

// 清理函数
onBeforeUnmount(() => {
  if (unwatch) {
    unwatch();
  }
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", resizeHandler);
  }
  if (myChart) {
    myChart.dispose();
  }
});

// 生命周期钩子
onMounted(async () => {
  loadBodyMetrics();
  loadUserAchievements();
  await loadWeightData();
  // 延迟初始化图表，确保DOM已渲染
  setTimeout(() => {
    initChart();
  }, 100);
});
</script>

<style scoped lang="scss">
.data-page {
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

.content-container h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

/* 身体数据区域 */
.body-stats-section {
  margin-bottom: 40px;
}

.body-stats-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.edit-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: transparent;
  border: none;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.edit-btn:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

/* 勋章展示区域 */
.achievements-section {
  margin-top: 40px;
}

.achievements-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.no-achievements {
  text-align: center;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #909399;
}

.achievements-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.achievement-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.achievement-icon {
  font-size: 48px;
  min-width: 60px;
  text-align: center;
}

.achievement-icon img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.achievement-info {
  flex: 1;
}

.achievement-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.achievement-info p {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.4;
}

.obtained-date {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
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
  
  .achievements-list {
    grid-template-columns: 1fr;
  }
}

/* 返回首页链接样式 */
.back-to-home {
  margin: 20px;
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

/* 体重数据卡片样式 */
.weight-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 32px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.weight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.weight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.weight-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.edit-btn {
  background-color: transparent;
  border: none;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.edit-btn:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

.weight-data {
  margin-bottom: 24px;
}

.weight-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.weight-label {
  font-size: 14px;
  color: #606266;
  margin-right: 16px;
  min-width: 80px;
}

.weight-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-right: 16px;
}

.weight-unit {
  font-size: 14px;
  font-weight: 400;
  color: #606266;
}

.weight-trend {
  font-size: 14px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 12px;
}

.weight-trend.down {
  color: #67c23a;
  background-color: #f0f9eb;
}

.weight-trend.up {
  color: #f56c6c;
  background-color: #fef0f0;
}

.chart-container {
  width: 100%;
  height: 300px;
  margin-top: 20px;
}

.body-fat {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 20px;
}

.fat-label {
  font-size: 14px;
  color: #606266;
  margin-right: 16px;
  min-width: 80px;
}

.fat-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 体重记录管理 */
.weight-records-container {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 12px 0;
  transition: all 0.3s;
}

.section-header:hover {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 12px 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #ecf5ff;
  color: #409eff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-btn:hover {
  background-color: #409eff;
  color: #ffffff;
  border-color: #409eff;
}

.expand-btn {
  background-color: transparent;
  border: none;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.expand-btn:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

.no-records {
  text-align: center;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #909399;
  margin-top: 16px;
}

.weight-records-list {
  margin-top: 16px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.record-item:hover {
  background-color: #f5f7fa;
}

.record-item:last-child {
  border-bottom: none;
}

.record-info {
  flex: 1;
}

.record-date {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.record-weight {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.record-body-fat {
  font-size: 14px;
  color: #909399;
}

.record-actions {
  display: flex;
  gap: 8px;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-btn:hover {
  background-color: #f56c6c;
  color: #ffffff;
  border-color: #f56c6c;
}

/* 编辑体重数据弹窗样式 */
.edit-form {
  margin-top: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

/* 体重记录编辑弹窗样式 */
.record-form {
  margin-top: 20px;
}

.record-form .form-item {
  margin-bottom: 16px;
}

.record-form .form-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .weight-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .weight-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .body-fat {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .record-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .record-actions {
    width: 100%;
    justify-content: flex-end;
  }
}


/* 图表包装器 */
.chart-wrapper {
  position: relative;
  width: 100%;
}

/* 体重记录小面板 */
.weight-record-mini-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 居中关键 */
  z-index: 10;
  width: 400px; /* 缩小宽度 */
  background: rgba(255, 255, 255, 0.95); /* 半透明白色 */
  backdrop-filter: blur(4px); /* 背景模糊感 */
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mini-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 14px;
  color: #303133;
}

.close-icon {
  cursor: pointer;
  color: #909399;
}

.close-icon:hover {
  color: #f56c6c;
}

.row-inputs {
  display: flex;
  gap: 10px;
}

.mini-panel-footer {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 覆盖 Element Plus 小尺寸间距 */
.weight-record-mini-panel :deep(.el-form-item) {
  margin-bottom: 8px;
}
.weight-record-mini-panel :deep(.el-form-item__label) {
  padding-bottom: 0 !important;
  line-height: 20px !important;
  font-size: 12px;
}
</style>