import { getCode, store } from "../utils/codeStore";
import getNeon from "../utils/neon";
import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
  const { username, email, code, password } = await readBody(event);
  try {
    // 验证验证码
    if (getCode(email) !== code) {
      console.log("[Register] 验证码错误，email:", email, "code:", code);
      return { success: false, message: "验证码错误" };
    }
  } catch (error) {
    console.log("[Register] 验证码验证失败，email:", email, "code:", code);
    return { success: false, message: "验证码验证失败" };
  }
  
  //连接数据库插入一条用户信息
  const mySql = getNeon();
  console.log("[Register] 数据库连接成功，准备注册用户:", username, email);

  // 检查用户名是否已存在
  const [userRows] =
    await mySql`SELECT id FROM gym_app_user WHERE username = ${username}`;
  if (userRows && userRows.username) {
    console.log("[Register] 用户名已存在:", username);
    return { success: false, message: "用户名已存在" };
  }

  // 检查邮箱是否已存在
  const [emailRows] =
    await mySql`SELECT id FROM gym_app_user WHERE email = ${email} `;
  console.log("[Register] 检查邮箱是否已存在:", emailRows);
  if (emailRows && emailRows.id) {
    console.log("[Register] 邮箱已存在:", email);
    return { success: false, message: "邮箱已存在" };
  }

//密码不为空或不能少于6位
if (!password || password.length < 6) {
  console.log("[Register] 密码为空或少于6位:", password);
  return { success: false, message: "密码为空或少于6位" };
}

  // 密码加密
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("[Register] 密码加密成功，加密后的密码:", hashedPassword);

  // 插入用户
  await mySql`
    INSERT INTO gym_app_user (username, email, password)
    VALUES (${username}, ${email}, ${hashedPassword})
  `;

  // 验证码验证通过后，删除验证码
  store.delete(email);

  console.log("[Register] 用户注册成功:", email);
  return { success: true, message: "注册成功" };
});
