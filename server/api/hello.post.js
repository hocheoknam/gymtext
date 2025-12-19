export default defineEventHandler(async (event) => {
  // 获取参数
  const body = await readBody(event);

  // 查询数据库
  // const result = await mySql`SELECT * FROM table WHERE id = ${body.id}`;

  // 返回结果
  return {
    code: 200,
    data: 'success',
  };// 密码加密
const hashedPassword = await bcrypt.hash(password, 10);

// 插入用户
await mySql`
  INSERT INTO gym_app_user (username, email, password)
  VALUES (${username}, ${email}, ${hashedPassword})
`;// 生成验证码
const code = nanoid(6); // 6 位随机串
// 存储验证码，有效期 5 分钟
setCode(email, code, 5 * 60);

// 发送验证码邮件
await sendQQMail(
  email,
  "欢迎加入xx健身，注册验证码",
  `您的验证码是：<b style="color:#ff6600">${code}</b>，5 分钟内有效。`
);
});