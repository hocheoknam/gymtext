<template>
  <div class="fitness-coach-website">
    <!-- 导航栏 -->
    <header class="navbar">
      <div class="container">
        <div class="logo">
          <h1>AI健身助手<span class="highlight"></span></h1>
        </div>
        <nav class="main-nav">
          <ul>
            <li><a href="/login/login">登录</a></li>
          </ul>
        </nav>
        <div class="mobile-nav-toggle">
          <button @click="toggleMobileMenu" class="menu-btn">
            <span class="menu-icon"></span>
          </button>
        </div>
      </div>
      <!-- 移动端菜单 -->
      <div v-if="mobileMenuOpen" class="mobile-nav">
        <ul>
        </ul>
      </div>
    </header>

    <!-- 英雄区域 -->
    <section id="home" class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h2 class="hero-title">AI健身助手，助您实现<span class="highlight">健身目标</span></h2>
          <p class="hero-description">个性化训练计划，科学健身指导，让您的每一次锻炼都更有价值</p>
          <div class="hero-buttons">
          </div>
        </div>
        <div class="hero-image">
          <!-- 使用CSS背景图代替实际图片 -->
          <div class="coach-image"></div>
        </div>
      </div>
    </section>












  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

// 移动端菜单状态
const mobileMenuOpen = ref(false);

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

// 处理滚动事件
const handleScroll = () => {
  // 高亮当前导航项
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".main-nav a");

  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= sectionTop - 100) {
      current = section.getAttribute("id") || "";
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
};


// 组件挂载时添加滚动事件监听
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

// 组件卸载时移除滚动事件监听
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
/* 全局样式重置和基础设置 */
.fitness-coach-website {
  font-family: "Arial", sans-serif;
  line-height: 1.6;
  color: #333;
  scroll-behavior: smooth;
}

/* 容器样式 */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 高亮文字 */
.highlight {
  color: #ff3e00;
}

/* 按钮样式 */
.btn-primary {
  display: inline-block;
  padding: 12px 24px;
  background-color: #ff3e00;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #e03600;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 62, 0, 0.3);
}

.btn-secondary {
  display: inline-block;
  padding: 12px 24px;
  background-color: transparent;
  color: #ff3e00;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  transition: all 0.3s ease;
  border: 2px solid #ff3e00;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #ff3e00;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 62, 0, 0.3);
}

/* 部分标题样式 */
.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  font-weight: 700;
}

.section-header p {
  font-size: 1.1rem;
  color: #666;
}

/* 英雄区域样式 */
.hero-section {
  padding: 150px 0 100px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background-color: rgba(255, 62, 0, 0.05);
  clip-path: polygon(30% 0, 100% 0, 100% 100%, 0% 100%);
}

.hero-section .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.hero-content {
  max-width: 50%;
}

.hero-title {
  font-size: 3.5rem;
  margin-bottom: 20px;
  line-height: 1.2;
  font-weight: 800;
  color: #333;
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: #666;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 15px;
}

.hero-image {
  max-width: 45%;
}

.coach-image {
  width: 100%;
  height: 500px;
  background: linear-gradient(135deg, #ff3e00 0%, #ff7a45 100%);
  border-radius: 15px;
  box-shadow: 0 15px 30px rgba(255, 62, 0, 0.2);
  position: relative;
}

.coach-image::after {
  content: "";
  position: absolute;
  top: 15px;
  left: -15px;
  right: 15px;
  bottom: -15px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  z-index: -1;
}

/* 导航栏样式 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.3s ease;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.navbar .logo h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.main-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.main-nav ul li {
  margin-left: 30px;
}

.main-nav ul li a {
  text-decoration: none;
  color: #333;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
}

.main-nav ul li a:hover,
.main-nav ul li a.active {
  color: #ff3e00;
}

.main-nav ul li a::after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #ff3e00;
  transition: width 0.3s ease;
}

.main-nav ul li a:hover::after,
.main-nav ul li a.active::after {
  width: 100%;
}

.mobile-nav-toggle {
  display: none;
}

.mobile-nav {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.mobile-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-nav ul li a {
  display: block;
  padding: 15px 20px;
  text-decoration: none;
  color: #333;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  transition: all 0.3s ease;
}

.mobile-nav ul li a:hover {
  background-color: #f5f5f5;
  color: #ff3e00;
}





/* 响应式设计 */
@media (max-width: 1200px) {
  .container {
    max-width: 960px;
  }

  .hero-title {
    font-size: 3rem;
  }

  .hero-description {
    font-size: 1.1rem;
  }
}

@media (max-width: 992px) {
  .container {
    max-width: 720px;
  }

  .main-nav {
    display: none;
  }

  .mobile-nav-toggle {
    display: block;
  }

  .hero-section .container {
    flex-direction: column;
    text-align: center;
  }

  .hero-content,
  .hero-image {
    max-width: 100%;
    margin-bottom: 30px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1.1rem;
  }
}

@media (max-width: 768px) {
  .container {
    max-width: 540px;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 15px;
  }

  .hero-section {
    padding: 100px 0 80px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .hero-description {
    font-size: 0.9rem;
  }

  .coach-image {
    height: 300px;
  }
}

/* 菜单按钮样式 */
.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.menu-icon {
  display: block;
  width: 30px;
  height: 3px;
  background-color: #333;
  position: relative;
  transition: all 0.3s ease;
}

.menu-icon::before,
.menu-icon::after {
  content: "";
  position: absolute;
  width: 30px;
  height: 3px;
  background-color: #333;
  transition: all 0.3s ease;
}

.menu-icon::before {
  top: -8px;
}

.menu-icon::after {
  bottom: -8px;
}

/* 菜单按钮点击动画 */
.mobileMenuOpen .menu-icon {
  background-color: transparent;
}

.mobileMenuOpen .menu-icon::before {
  transform: rotate(45deg);
  top: 0;
}

.mobileMenuOpen .menu-icon::after {
  transform: rotate(-45deg);
  bottom: 0;
}
</style>
