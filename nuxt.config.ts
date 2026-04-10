// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true }, //开启devtools
  srcDir: "app/", //指定src目录为app
  pages: true, //开启pages目录
  // 新增这一行，消除兼容性警告
  compatibilityDate: "2025-12-04",

  // 增加 Nitro 配置，设置全局超时时间
  nitro: {
    // 配置服务器选项
    serveStatic: true,
    // 增加响应时间限制
    routeRules: {
      '/api/**': {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    }
  },

  // 其他原有配置（如 vite、modules 等）
  vite: {
    server: {
      hmr: true // 保留你之前的热加载配置
    },
  },
  runtimeConfig: {
    // SMTP 邮件配置
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpSecure: process.env.SMTP_SECURE,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
  },
  modules: ["@element-plus/nuxt", "@unocss/nuxt"],
  // 确保全局加载 Element Plus 样式
  css: [
    'element-plus/dist/index.css'
  ],
  build: {
    transpile: ['element-plus']
  },
  // 开启组件自动导入
  components: [
    {
      path: "~/components", // 组件目录
      pathPrefix: false, // 禁用路径前缀
    },
  ],
  app: {
    head: {
      title: "GymText",
      script: [
        {
          src: "https://cdn.bootcdn.net/ajax/libs/echarts/5.4.3/echarts.min.js",
          // 移除async属性，确保ECharts在页面组件挂载前加载完成
        },
      ],
    },
  },
});

