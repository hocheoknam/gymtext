// 登录接口
/**
 * 邮箱密码验证码，查询数据库比较提供的邮箱的密码是否与提供的密码一致
 */

import getNeon from "../utils/neon";
import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  // 验证参数
  if (!email || !password) {
    console.log(
      "[Login] 参数不完整，email:",
      email,
      "password:",
      password ? "已提供" : "未提供"
    );
    return { success: false, message: "邮箱和密码不能为空" };
  }

  // 连接数据库
  const mySql = getNeon();
  //   console.log("[Login] 数据库连接成功，准备验证用户:", email);

  try {
    // 查询用户信息
    const [userRows] =
      await mySql`SELECT id, username, email, password FROM gym_app_user WHERE email = ${email}`;

    if (!userRows || !userRows.id) {
      console.log("[Login] 用户不存在，email:", email);
      return { success: false, message: "用户不存在" };
    }

    console.log("[Login] 找到用户，开始验证密码，用户ID:", userRows.id);

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, userRows.password);

    if (!isPasswordValid) {
      console.log("[Login] 密码错误，用户ID:", userRows.id);
      return { success: false, message: "密码错误" };
    }

    console.log("[Login] 用户登录成功，用户ID:", userRows.id);

    // 返回用户信息（不包含密码）
    return {
      success: true,
      message: "登录成功",
      user: {
        id: userRows.id,
        username: userRows.username,
        email: userRows.email,
      },
    };
  } catch (error) {
    console.error("[Login] 数据库查询错误:", error);
    return { success: false, message: "登录失败，请稍后重试" };
  }
});
