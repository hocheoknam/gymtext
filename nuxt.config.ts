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
});
