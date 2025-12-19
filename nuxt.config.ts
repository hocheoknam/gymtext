// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true }, //开启devtools
  srcDir: "app/", //指定src目录为app
  pages: true, //开启pages目录
  // 新增这一行，消除兼容性警告
  compatibilityDate: "2025-12-04",
  // 其他原有配置（如 vite、modules 等）
  vite: {
    server: {
      hmr: true, // 保留你之前的热加载配置
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
          // 可选：添加 async 保证不阻塞渲染
          async: true,
        },
      ],
    },
  },
});
