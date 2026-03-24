<template>
  <div class="data-page">
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
        <p>欢迎来到数据中心页面，这里将展示您的健身数据和统计信息。</p>
      </div>
    </main>
    
    <footer class="bottom-nav">
      <div class="nav-items">
        <div class="nav-item" @click="navigateTo('/home')">
          <div class="nav-icon">
            <el-icon><HomeFilled /></el-icon>
          </div>
          <span class="nav-text">首页</span>
        </div>
        <div class="nav-item" @click="navigateTo('/action')">
          <div class="nav-icon">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <span class="nav-text">训练</span>
        </div>
        <div class="nav-item" @click="navigateTo('/eat')">
          <div class="nav-icon">
            <el-icon><Food /></el-icon>
          </div>
          <span class="nav-text">饮食</span>
        </div>
        <div class="nav-item active">
          <div class="nav-icon">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <span class="nav-text">数据</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { navigateTo } from "nuxt/app";
import {
  HomeFilled,
  VideoPlay,
  Food,
  DataAnalysis
} from "@element-plus/icons-vue";
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

.content-container p {
  font-size: 16px;
  color: #606266;
  line-height: 1.5;
}

.bottom-nav {
  background-color: #ffffff;
  border-top: 1px solid #ebeef5;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
}

.nav-items {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 56px;
}

.bottom-nav .nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  padding: 8px 16px;
  color: #909399;
  transition: color 0.3s;
}

.bottom-nav .nav-item.active {
  color: #409eff;
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  font-size: 12px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .content-container {
    padding: 20px;
  }
  
  .bottom-nav {
    display: block;
  }
  
  .main-content {
    padding-bottom: 72px;
  }
}
</style>