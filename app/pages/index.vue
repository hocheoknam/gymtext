<template>
  <div class="fitness-coach-website">
    <!-- 导航栏 -->
    <header class="navbar">
      <div class="container">
        <div class="logo">
          <h1>健身教练<span class="highlight">Mike</span></h1>
        </div>
        <nav class="main-nav">
          <ul>
            <li><a href="#home" class="active">首页</a></li>
            <li><a href="#about">关于我</a></li>
            <li><a href="#services">课程服务</a></li>
            <li><a href="#testimonials">会员评价</a></li>
            <li><a href="#contact">联系我</a></li>
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
          <li><a href="#home" @click="mobileMenuOpen = false">首页</a></li>
          <li><a href="#about" @click="mobileMenuOpen = false">关于我</a></li>
          <li><a href="#services" @click="mobileMenuOpen = false">课程服务</a></li>
          <li><a href="#testimonials" @click="mobileMenuOpen = false">会员评价</a></li>
          <li><a href="#contact" @click="mobileMenuOpen = false">联系我</a></li>
        </ul>
      </div>
    </header>

    <!-- 英雄区域 -->
    <section id="home" class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h2>专业健身教练，助您实现<span class="highlight">健身目标</span></h2>
          <p>个性化训练计划，科学健身指导，让您的每一次锻炼都更有价值</p>
          <div class="hero-buttons">
            <a href="#contact" class="btn-primary">立即预约</a>
            <a href="#services" class="btn-secondary">了解课程</a>
          </div>
        </div>
        <div class="hero-image">
          <!-- 使用CSS背景图代替实际图片 -->
          <div class="coach-image"></div>
        </div>
      </div>
    </section>

    <!-- 关于我/教练信息 -->
    <section id="about" class="about-section">
      <div class="container">
        <div class="section-header">
          <h2>关于<span class="highlight">教练Mike</span></h2>
          <p>专业资质，丰富经验，个性化指导</p>
        </div>
        <div class="about-content">
          <div class="about-image">
            <div class="profile-image"></div>
          </div>
          <div class="about-info">
            <h3>专业健身教练</h3>
            <p>您好！我是Mike，拥有8年专业健身教练经验，持有国际健身教练认证和运动营养学资格证书。</p>
            <p>我专注于帮助客户实现个性化健身目标，无论是增肌、减脂、塑形还是提高体能，我都能为您提供科学有效的训练计划。</p>
            <div class="qualifications">
              <h4>专业资质：</h4>
              <ul>
                <li>国际健身教练协会认证教练</li>
                <li>运动营养学专家</li>
                <li>康复训练指导师</li>
                <li>功能性训练专家</li>
              </ul>
            </div>
            <a href="#contact" class="btn-primary">预约免费咨询</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 课程服务 -->
    <section id="services" class="services-section">
      <div class="container">
        <div class="section-header">
          <h2>专业<span class="highlight">课程服务</span></h2>
          <p>为您提供多样化的健身课程和训练方案</p>
        </div>
        <div class="services-grid">
          <!-- 私教课程 -->
          <div class="service-card">
            <div class="service-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3>一对一私教</h3>
            <p>个性化定制训练计划，专业指导，实时调整，确保您的训练效果最大化。</p>
            <div class="service-price">¥300/课时</div>
            <a href="#contact" class="btn-secondary">了解详情</a>
          </div>

          <!-- 团体课程 -->
          <div class="service-card">
            <div class="service-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
              </svg>
            </div>
            <h3>团体课程</h3>
            <p>动感十足的团体训练课程，包括HIIT、瑜伽、普拉提等多种选择，在欢乐氛围中锻炼。</p>
            <div class="service-price">¥100/课时</div>
            <a href="#contact" class="btn-secondary">了解详情</a>
          </div>

          <!-- 营养指导 -->
          <div class="service-card">
            <div class="service-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
            <h3>营养指导</h3>
            <p>科学的饮食计划制定，帮助您更好地配合训练，实现健身目标，改善整体健康状况。</p>
            <div class="service-price">¥500/月</div>
            <a href="#contact" class="btn-secondary">了解详情</a>
          </div>

          <!-- 企业培训 -->
          <div class="service-card">
            <div class="service-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 1.875 1.875v1.5a1.875 1.875 0 0 1-1.875 1.875H5.625A1.875 1.875 0 0 1 3.75 7.875V6.375A1.875 1.875 0 0 1 5.625 4.5Z" />
              </svg>
            </div>
            <h3>企业培训</h3>
            <p>为企业提供员工健康管理和团队建设服务，提高员工身体素质和团队凝聚力。</p>
            <div class="service-price">按需定制</div>
            <a href="#contact" class="btn-secondary">了解详情</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 健身数据统计 -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">8+</div>
            <div class="stat-label">年专业经验</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">500+</div>
            <div class="stat-label">成功案例</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">95%</div>
            <div class="stat-label">客户满意度</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">24/7</div>
            <div class="stat-label">全程支持</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 会员评价 -->
    <section id="testimonials" class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <h2>会员<span class="highlight">真实评价</span></h2>
          <p>听听他们怎么说</p>
        </div>
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="testimonial-quote">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 10.5c0 7.142-7.5 11.25-7.5 11.25S6.75 17.642 6.75 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <p>"在Mike教练的指导下，我三个月减掉了15公斤，不仅体重减轻了，体能也明显提升。他的训练方法科学有效，而且很有耐心。"</p>
            <div class="testimonial-author">
              <div class="author-avatar"></div>
              <div class="author-info">
                <h4>张小明</h4>
                <p>减重成功案例</p>
              </div>
            </div>
          </div>
          <div class="testimonial-card">
            <div class="testimonial-quote">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 10.5c0 7.142-7.5 11.25-7.5 11.25S6.75 17.642 6.75 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <p>"Mike不仅是一位优秀的教练，更是一位专业的营养师。他为我制定的饮食计划简单易行，配合训练，让我的肌肉线条变得更加明显。"</p>
            <div class="testimonial-author">
              <div class="author-avatar"></div>
              <div class="author-info">
                <h4>李婷婷</h4>
                <p>增肌塑形客户</p>
              </div>
            </div>
          </div>
          <div class="testimonial-card">
            <div class="testimonial-quote">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 10.5c0 7.142-7.5 11.25-7.5 11.25S6.75 17.642 6.75 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <p>"作为一名上班族，我一直缺乏锻炼。Mike为我设计的30分钟高效训练计划非常适合我，现在我不仅精力充沛，工作效率也提高了。"</p>
            <div class="testimonial-author">
              <div class="author-avatar"></div>
              <div class="author-info">
                <h4>王建国</h4>
                <p>忙碌职场人士</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 成功案例 -->
    <section class="success-stories-section">
      <div class="container">
        <div class="section-header">
          <h2>成功<span class="highlight">案例展示</span></h2>
          <p>见证健身改变人生的真实故事</p>
        </div>
        <div class="stories-slider">
          <div class="story-item">
            <div class="story-before-after">
              <div class="story-image before"></div>
              <div class="story-image after"></div>
            </div>
            <div class="story-content">
              <h3>陈先生 - 减重30公斤</h3>
              <p>从200斤减到140斤，不仅改善了高血压问题，更重要的是找回了自信和健康的生活方式。</p>
              <div class="story-stats">
                <div>减重：30公斤</div>
                <div>时间：6个月</div>
              </div>
            </div>
          </div>
          <div class="story-item">
            <div class="story-before-after">
              <div class="story-image before"></div>
              <div class="story-image after"></div>
            </div>
            <div class="story-content">
              <h3>林女士 - 产后恢复</h3>
              <p>产后3个月开始训练，6个月内恢复孕前身材，并且比孕前更加健康有活力。</p>
              <div class="story-stats">
                <div>腰围减少：15cm</div>
                <div>时间：6个月</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系我们 -->
    <section id="contact" class="contact-section">
      <div class="container">
        <div class="section-header">
          <h2>立即<span class="highlight">联系我</span></h2>
          <p>预约免费咨询，开始您的健身之旅</p>
        </div>
        <div class="contact-content">
          <div class="contact-form">
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label for="name">您的姓名</label>
                <input type="text" id="name" placeholder="请输入姓名" required>
              </div>
              <div class="form-group">
                <label for="phone">手机号码</label>
                <input type="tel" id="phone" placeholder="请输入手机号码" required>
              </div>
              <div class="form-group">
                <label for="email">电子邮箱</label>
                <input type="email" id="email" placeholder="请输入电子邮箱">
              </div>
              <div class="form-group">
                <label for="service">您感兴趣的服务</label>
                <select id="service">
                  <option value="">请选择服务类型</option>
                  <option value="private">一对一私教</option>
                  <option value="group">团体课程</option>
                  <option value="nutrition">营养指导</option>
                  <option value="corporate">企业培训</option>
                </select>
              </div>
              <div class="form-group">
                <label for="message">留言</label>
                <textarea id="message" rows="4" placeholder="请输入您的问题或需求"></textarea>
              </div>
              <button type="submit" class="btn-primary">提交预约</button>
            </form>
          </div>
          <div class="contact-info">
            <h3>联系方式</h3>
            <div class="info-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              <span>电话：138-8888-8888</span>
            </div>
            <div class="info-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              <span>邮箱：mike@fitnesscoach.com</span>
            </div>
            <div class="info-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span>地址：北京市朝阳区建国路88号健身中心</span>
            </div>
            <div class="info-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
              </svg>
              <span>营业时间：周一至周日 6:00-22:00</span>
            </div>
            <div class="social-links">
              <a href="#" class="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 2.25h-3a3 3 0 0 0-3 3v1.5h-1.5a1.5 1.5 0 0 1-1.5-1.5v-3A1.5 1.5 0 0 1 9 2.25H10.5V4.5h-3v3H9a1.5 1.5 0 0 1 1.5 1.5V12h1.5V9.75H13.5V12H15V9.75h1.5v-3H15.75z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5h.75a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h.75m3-3H18a1.5 1.5 0 0 1 1.5 1.5v1.5m-1.5-1.5H15m6 3H9m1.5 1.5H12m-3-3H9" />
                </svg>
              </a>
              <a href="#" class="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M22.5 4.5v15m0-15H18m1.5 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.75 7.5h-3v13.5h3V7.5Z" />
                </svg>
              </a>
              <a href="#" class="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
              </a>
              <a href="#" class="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <h2>健身教练<span class="highlight">Mike</span></h2>
            <p>专业、科学、有效的健身指导，助您实现健康生活方式</p>
          </div>
          <div class="footer-links">
            <h3>快速链接</h3>
            <ul>
              <li><a href="#home">首页</a></li>
              <li><a href="#about">关于我</a></li>
              <li><a href="#services">课程服务</a></li>
              <li><a href="#testimonials">会员评价</a></li>
              <li><a href="#contact">联系我</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h3>服务项目</h3>
            <ul>
              <li><a href="#">一对一私教</a></li>
              <li><a href="#">团体课程</a></li>
              <li><a href="#">营养指导</a></li>
              <li><a href="#">企业培训</a></li>
              <li><a href="#">康复训练</a></li>
            </ul>
          </div>
          <div class="footer-contact">
            <h3>联系信息</h3>
            <p>电话：138-8888-8888</p>
            <p>邮箱：mike@fitnesscoach.com</p>
            <p>地址：北京市朝阳区建国路88号健身中心</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 健身教练Mike. 保留所有权利.</p>
        </div>
      </div>
    </footer>

    <!-- 返回顶部按钮 -->
    <button v-if="showBackToTop" @click="scrollToTop" class="back-to-top">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="m18 15-6-6-6 6" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 移动端菜单状态
const mobileMenuOpen = ref(false)

// 返回顶部按钮状态
const showBackToTop = ref(false)

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 处理滚动事件
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
  
  // 高亮当前导航项
  const sections = document.querySelectorAll('section')
  const navLinks = document.querySelectorAll('.main-nav a')
  
  let current = ''
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop
    const sectionHeight = section.clientHeight
    if (window.scrollY >= (sectionTop - 100)) {
      current = section.getAttribute('id') || ''
    }
  })
  
  navLinks.forEach(link => {
    link.classList.remove('active')
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active')
    }
  })
}

// 表单提交处理
const handleSubmit = () => {
  // 在实际应用中，这里应该有表单验证和提交逻辑
  alert('预约信息已提交，我们会尽快与您联系！')
}

// 组件挂载时添加滚动事件监听
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

// 组件卸载时移除滚动事件监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* 全局样式重置和基础设置 */
.fitness-coach-website {
  font-family: 'Arial', sans-serif;
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
  content: '';
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

/* 英雄区域样式 */
.hero-section {
  padding: 150px 0 100px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
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

.hero-content h2 {
  font-size: 3.5rem;
  margin-bottom: 20px;
  line-height: 1.2;
  font-weight: 800;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: #666;
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
  content: '';
  position: absolute;
  top: 15px;
  left: -15px;
  right: 15px;
  bottom: -15px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  z-index: -1;
}

/* 关于我部分样式 */
.about-section {
  padding: 100px 0;
  background-color: white;
}

.about-content {
  display: flex;
  align-items: center;
  gap: 50px;
}

.about-image {
  flex: 0 0 40%;
}

.profile-image {
  width: 100%;
  height: 500px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 15px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.about-info {
  flex: 1;
}

.about-info h3 {
  font-size: 2rem;
  margin-bottom: 20px;
  font-weight: 700;
}

.about-info p {
  font-size: 1.1rem;
  margin-bottom: 20px;
  color: #666;
  line-height: 1.8;
}

.qualifications h4 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  font-weight: 600;
}

.qualifications ul {
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
}

.qualifications ul li {
  position: relative;
  padding-left: 25px;
  margin-bottom: 10px;
  color: #666;
}

.qualifications ul li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #ff3e00;
  font-weight: bold;
}

/* 课程服务部分样式 */
.services-section {
  padding: 100px 0;
  background-color: #f8f9fa;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.service-card {
  background-color: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-align: center;
}

.service-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.service-icon {
  width: 80px;
  height: 80px;
  background-color: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #ff3e00;
}

.service-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  font-weight: 700;
}

.service-card p {
  margin-bottom: 20px;
  color: #666;
  line-height: 1.6;
}

.service-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ff3e00;
  margin-bottom: 20px;
}

/* 统计部分样式 */
.stats-section {
  background: linear-gradient(135deg, #ff3e00 0%, #ff7a45 100%);
  color: white;
  padding: 80px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  text-align: center;
}

.stat-item .stat-number {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.stat-item .stat-label {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* 会员评价部分样式 */
.testimonials-section {
  padding: 100px 0;
  background-color: white;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.testimonial-card {
  background-color: #f8f9fa;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
}

.testimonial-quote {
  color: #ff3e00;
  margin-bottom: 20px;
}

.testimonial-card p {
  margin-bottom: 30px;
  color: #666;
  line-height: 1.8;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.author-info h4 {
  margin: 0 0 5px 0;
  font-weight: 700;
}

.author-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #999;
  font-style: normal;
}

/* 成功案例部分样式 */
.success-stories-section {
  padding: 100px 0;
  background-color: #f8f9fa;
}

.stories-slider {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 50px;
}

.story-item {
  background-color: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.story-before-after {
  display: flex;
  height: 300px;
}

.story-image {
  flex: 1;
  background-size: cover;
  background-position: center;
  position: relative;
}

.story-image.before {
  background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
}

.story-image.after {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.story-image.before::after {
  content: 'BEFORE';
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
}

.story-image.after::after {
  content: 'AFTER';
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
}

.story-content {
  padding: 30px;
}

.story-content h3 {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.story-content p {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.6;
}

.story-stats {
  display: flex;
  gap: 30px;
  font-weight: 600;
  color: #ff3e00;
}

/* 联系部分样式 */
.contact-section {
  padding: 100px 0;
  background-color: white;
}

.contact-content {
  display: flex;
  gap: 50px;
}

.contact-form {
  flex: 1;
  background-color: #f8f9fa;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.contact-form .form-group {
  margin-bottom: 20px;
}

.contact-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.contact-form input,
.contact-form select,
.contact-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.contact-form input:focus,
.contact-form select:focus,
.contact-form textarea:focus {
  border-color: #ff3e00;
  outline: none;
}

.contact-info {
  flex: 1;
  background: linear-gradient(135deg, #ff3e00 0%, #ff7a45 100%);
  color: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.contact-info h3 {
  margin: 0 0 30px 0;
  font-size: 1.8rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 20px;
}

.info-item svg {
  margin-top: 3px;
}

.social-links {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  transition: all 0.3s ease;
}

.social-link:hover {
  background-color: white;
  color: #ff3e00;
  transform: translateY(-3px);
}

/* 页脚样式 */
.footer {
  background-color: #222;
  color: white;
  padding: 80px 0 30px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 50px;
  margin-bottom: 50px;
}

.footer-logo h2 {
  font-size: 1.8rem;
  margin: 0 0 20px 0;
}

.footer-logo p {
  color: #ccc;
  line-height: 1.6;
}

.footer-links h3 {
  font-size: 1.2rem;
  margin: 0 0 20px 0;
  font-weight: 600;
}

.footer-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links ul li {
  margin-bottom: 10px;
}

.footer-links ul li a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links ul li a:hover {
  color: #ff3e00;
}

.footer-contact p {
  margin: 0 0 15px 0;
  color: #ccc;
}

.footer-bottom {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid #444;
  color: #999;
}

/* 返回顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background-color: #ff3e00;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(255, 62, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 999;
}

.back-to-top:hover {
  background-color: #e03600;
  transform: translateY(-3px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .container {
    max-width: 960px;
  }
  
  .hero-content h2 {
    font-size: 3rem;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
  
  .stories-slider {
    grid-template-columns: 1fr;
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
  
  .about-content {
    flex-direction: column;
    text-align: center;
  }
  
  .about-image {
    flex: 0 0 auto;
    width: 80%;
    margin-bottom: 30px;
  }
  
  .contact-content {
    flex-direction: column;
  }
  
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    max-width: 540px;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .hero-content h2 {
    font-size: 2.5rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 15px;
  }
  
  .section-header h2 {
    font-size: 1.8rem;
  }
  
  .hero-section {
    padding: 100px 0 80px;
  }
  
  .hero-content h2 {
    font-size: 2rem;
  }
  
  .coach-image {
    height: 300px;
  }
  
  .profile-image {
    height: 300px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .story-before-after {
    height: 200px;
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
  content: '';
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