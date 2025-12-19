<template>
  <div class="dashboard">
    <!-- 仪表盘侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="dashboard-title">健身仪表盘</h2>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li class="nav-item">
            <a href="/dashboard" class="nav-link active">
              <el-icon><House /></el-icon>
              概览
            </a>
          </li>
          <li class="nav-item">
            <a href="/dashboard/training" class="nav-link">
              <el-icon><User /></el-icon>
              智能训练
            </a>
          </li>
          <li class="nav-item">
            <a href="/dashboard/social" class="nav-link">
              <el-icon><Users /></el-icon>
              社交系统
            </a>
          </li>
          <li class="nav-item">
            <a href="/yingyang" class="nav-link">
              <el-icon><ForkSpoon /></el-icon>
              饮食管理
            </a>
          </li>
          <li class="nav-item">
            <a href="/dashboard/profile" class="nav-link">
              <el-icon><Setting /></el-icon>
              个人资料
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 仪表盘主内容区 -->
    <main class="main-content">
      <!-- 顶部导航 -->
      <header class="dashboard-header">
        <h1>欢迎回来！</h1>
        <div class="header-actions">
          <el-button type="text">
            <el-icon><Bell /></el-icon>
            通知
          </el-button>
          <el-button type="text">
            <el-icon><Setting /></el-icon>
            设置
          </el-button>
        </div>
      </header>

      <!-- 数据概览卡片 -->
      <div class="stats-cards">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">15</div>
            <div class="stat-label">今日训练时长（分钟）</div>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">800</div>
            <div class="stat-label">今日消耗卡路里</div>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">4/7</div>
            <div class="stat-label">本周训练进度</div>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">5.2kg</div>
            <div class="stat-label">目标体重</div>
          </div>
        </el-card>
      </div>

      <!-- 近期活动 -->
      <section class="recent-activities">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>近期活动</h3>
            </div>
          </template>
          <div class="activities-list">
            <el-empty description="暂无活动记录">
              <el-button type="primary" @click="navigateToTraining"
                >开始训练</el-button
              >
            </el-empty>
          </div>
        </el-card>
      </section>
    </main>
  </div>
</template>

<script setup>
import { navigateTo } from "nuxt/app";
import {
  House,
  User,
  Users,
  ForkSpoon,
  Setting,
  Bell,
} from "@element-plus/icons-vue";

// 导航到训练页面
function navigateToTraining() {
  navigateTo("/dashboard/training");
}
</script>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #1e293b;
  color: white;
  padding: 20px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 24px;
}

.sidebar-nav {
  margin-top: 40px;
}

.nav-item {
  margin-bottom: 10px;
}

.nav-link {
  display: block;
  padding: 12px 16px;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
}

.nav-link:hover {
  background-color: #334155;
  color: white;
}

.nav-link.active {
  background-color: #3b82f6;
  color: white;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f8fafc;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.dashboard-header h1 {
  margin: 0;
  color: #1e293b;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #3b82f6;
}

.stat-label {
  color: #64748b;
  margin-top: 8px;
}

.recent-activities {
  margin-bottom: 30px;
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  color: #1e293b;
}
</style>
