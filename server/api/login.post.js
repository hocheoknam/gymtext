// 登录接口
/**
 * 邮箱密码验证码，查询数据库比较提供的邮箱的密码是否与提供的密码一致
 */

import { defineEventHandler, readBody } from 'h3';
import getNeon from "../utils/neon";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
  const sql = getNeon();
  //   console.log("[Login] 数据库连接成功，准备验证用户:", email);

  try {
    // 查询用户信息
    const userRows =
      await sql`SELECT id, username, email, password FROM gym_app_user WHERE email = ${email}`;

    if (!userRows || userRows.length === 0) {
      console.log("[Login] 用户不存在，email:", email);
      return { success: false, message: "用户不存在" };
    }

    const user = userRows[0];
    console.log("[Login] 找到用户，开始验证密码，用户ID:", user.id);

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("[Login] 密码错误，用户ID:", user.id);
      return { success: false, message: "密码错误" };
    }

    console.log("[Login] 用户登录成功，用户ID:", user.id);

    // 生成 JWT 令牌
    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // 返回用户信息和令牌（不包含密码）
    return {
      success: true,
      message: "登录成功",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token: token,
    };
  } catch (error) {
    console.error("[Login] 数据库查询错误:", error);
    return { success: false, message: "登录失败，请稍后重试" };
  }
});
