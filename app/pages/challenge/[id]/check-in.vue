<template>
  <div class="check-in-page">
    <header class="page-header">
      <div class="header-content">
        <el-button @click="navigateTo(`/challenge/${route.params.id}/success`)" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1>挑战打卡</h1>
      </div>
    </header>

    <main class="main-content">
      <div class="check-in-container">
        <h2>挑战 ID: {{ route.params.id }}</h2>
        <p class="challenge-info">今天的挑战任务完成了吗？点击下方按钮进行打卡。</p>
        
        <div class="check-in-status" v-if="isCheckedIn">
          <el-alert
            title="已打卡"
            type="success"
            show-icon
          >
            <template #default>
              <p>你已经完成了今天的打卡任务！</p>
            </template>
          </el-alert>
        </div>
        
        <div class="check-in-button" v-else>
          <el-button 
            type="primary" 
            size="large" 
            @click="handleCheckIn"
            :loading="isLoading"
          >
            打卡
          </el-button>
        </div>
      </div>
    </main>

    <footer class="bottom-nav">
      <div class="nav-items">
        <NuxtLink to="/" class="nav-item">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </NuxtLink>
        <NuxtLink to="/checkin" class="nav-item active">
          <el-icon><VideoPlay /></el-icon>
          <span>打卡</span>
        </NuxtLink>
        <NuxtLink to="/yingyang" class="nav-item">
          <el-icon><Food /></el-icon>
          <span>营养</span>
        </NuxtLink>
        <NuxtLink to="/challenge" class="nav-item">
          <el-icon><Aim /></el-icon>
          <span>挑战</span>
        </NuxtLink>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  HomeFilled,
  VideoPlay,
  Food,
  Aim,
  ArrowLeft
} from "@element-plus/icons-vue";
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();

// 打卡状态
const isCheckedIn = ref(false);
const isLoading = ref(false);

// 处理打卡
const handleCheckIn = async () => {
  try {
    isLoading.value = true;
    // 模拟 API 调用
    // 实际项目中，这里应该调用后端 API 执行打卡操作
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟打卡成功
    isCheckedIn.value = true;
    ElMessage.success('打卡成功！');
  } catch (error) {
    // 请求失败，显示错误提示
    ElMessage.error('网络错误，请稍后再试');
  } finally {
    isLoading.value = false;
  }
};

// 导航到指定页面
const navigateTo = (path) => {
  router.push(path);
};

// 组件挂载时检查打卡状态
onMounted(() => {
  // 模拟检查打卡状态
  // 实际项目中，这里应该调用后端 API 检查打卡状态
  console.log('检查打卡状态');
});
</script>

<style scoped lang="scss">
.check-in-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.page-header {
  background-color: #1890ff;
  color: #ffffff;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #ffffff;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #ffffff;
  }
}

.header-content h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  flex: 1;
  text-align: center;
  margin-left: -40px; // 抵消返回按钮的宽度
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 24px;
}

.check-in-container {
  width: 100%;
  max-width: 480px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 32px;
  text-align: center;
}

.check-in-container h2 {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 600;
  color: #1f2329;
}

.challenge-info {
  margin: 0 0 32px;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

.check-in-status {
  margin-bottom: 32px;
}

.check-in-button {
  margin-top: 32px;
}

.check-in-button .el-button {
  width: 200px;
  height: 50px;
  font-size: 18px;
}

.bottom-nav {
  background-color: #ffffff;
  border-top: 1px solid #ebeef5;
  padding: 8px 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-items {
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  color: #606266;
  text-decoration: none;
  transition: color 0.3s;
  &.active {
    color: #1890ff;
  }
  el-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }
  span {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .header-content h1 {
    font-size: 18px;
  }
  
  .main-content {
    padding: 40px 16px;
  }
  
  .check-in-container {
    padding: 24px;
  }
  
  .check-in-button .el-button {
    width: 180px;
    height: 44px;
    font-size: 16px;
  }
}
</style>