/**
 * 认证相关 API 接口
 * 登录模块的 API 函数
 * 使用axios插件替代request工具
 */
// 导入axios实例
import { applyPlugin, useNuxtApp } from "#app";
// 获取axios实例的辅助函数
const getAxios = () => {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$axios;
};

/**
 * 注册相关 API 接口
 * @
 */

/**
 * 注册接口
 * @param params 注册参数（邮箱、验证码、密码）
 * @returns 注册响应
 */
export async function register(params) {
  const { username, email, code, password } = params;
  // 调用注册接口server/api/register.ts
  const axios = getAxios();
  const response = await axios.post("/register", {
    username,
    email,
    code,
    password,
  });
  return response.data;
}

/**
 * 获得验证码接口
 * @param email 邮箱地址
 * @returns 验证码响应
 */
export async function sendCode(email) {
  const axios = getAxios();
  const response = await axios.post("/sendCode", {
    email,
  });
  return response.data;
}

/**
 * 用户登录接口
 * @param credentials 登录凭证
 * @returns 登录响应
 */
export async function login(credentials) {
  const axios = getAxios();
  try {
    // 调用登录接口server/api/login2.ts
    const response = await axios.post("/login2", credentials);
    return response.data;
  } catch (error) {
    console.error("登录失败:", error);
    throw error;
  }
}

/**
 * 用户登出接口
 */
export async function logout() {
  const axios = getAxios();
  try {
    await axios.post("/auth/logout");
  } catch (error) {
    console.error("登出失败:", error);
    throw error;
  }
}

