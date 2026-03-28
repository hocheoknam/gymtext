<template>
  <div class="success-page">
    <header class="page-header">
      <div class="header-content">
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

    <footer class="bottom-nav">
      <div class="nav-items">
        <NuxtLink to="/" class="nav-item">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </NuxtLink>
        <NuxtLink to="/checkin" class="nav-item">
          <el-icon><VideoPlay /></el-icon>
          <span>打卡</span>
        </NuxtLink>
        <NuxtLink to="/yingyang" class="nav-item">
          <el-icon><Food /></el-icon>
          <span>营养</span>
        </NuxtLink>
        <NuxtLink to="/challenge" class="nav-item active">
          <el-icon><Aim /></el-icon>
          <span>挑战</span>
        </NuxtLink>
      </div>
    </footer>
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
  
  .success-container {
    padding: 24px;
  }
}
</style>