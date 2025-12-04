// server/plugins/connectNeon.js
// 不写 #nitro/plugin，也不写 @/ 别名，直接相对路径
export default async function (nitroApp) {
  // 只触发加载即可
  await import("../utils/neon.js");
}
