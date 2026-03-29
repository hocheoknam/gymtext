<template>
  <div class="success-page">
    <header class="page-header">
      <div class="header-content">
        <div class="back-to-home">
          <router-link to="/home" style="color: #ffffff; text-decoration: none; display: flex; align-items: center;">
            <el-icon><ArrowLeft /></el-icon>
            <span style="margin-left: 5px;">返回首页</span>
          </router-link>
        </div>
        <el-button @click="navigateTo('/challenge')" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回挑战列表
        </el-button>
        <h1>加入挑战成功！</h1>
      </div>
    </header>

    <main class="main-content">
      <div class="success-container">
        <el-empty description="加入挑战成功">
          <template #image>
            <div class="success-icon">
              <el-icon><Check /></el-icon>
            </div>
          </template>
          <template #description>
            <div class="success-message">
              <h2>恭喜你</h2>
              <p>已成功加入挑战 ID: {{ route.params.id }}</p>
            </div>
          </template>
          <el-button type="primary" @click="goToCheckIn">去打卡</el-button>
        </el-empty>
      </div>
    </main>


  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import {
  HomeFilled,
  VideoPlay,
  Food,
  Aim,
  ArrowLeft,
  Check
} from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();

// 跳转到打卡页面
const goToCheckIn = () => {
  router.push(`/challenge/${route.params.id}/check-in`);
};

// 导航到指定页面
const navigateTo = (path) => {
  router.push(path);
};
</script>

<style scoped lang="scss">
.success-page {
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

.back-to-home {
  margin-right: 16px;
  padding: 6px 12px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  display: inline-block;
  transition: all 0.3s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
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

.success-container {
  width: 100%;
  max-width: 480px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 32px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background-color: #f0f9ff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 24px;
  font-size: 48px;
  color: #1890ff;
}

.success-message {
  text-align: center;
  margin-bottom: 32px;
  h2 {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 600;
    color: #1f2329;
  }
  p {
    margin: 0;
    font-size: 16px;
    color: #6b7280;
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
  
  .success-container {
    padding: 24px;
  }
}
</style>