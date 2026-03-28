import { neon } from '@neondatabase/serverless';
import { defineEventHandler, readBody, createError } from 'h3';

// 初始化 Neon 客户端
// 建议将连接字符串放在 .env 文件中，通过 process.env.DATABASE_URL 读取
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  // 1. 获取请求数据
  const body = await readBody(event);
  const { userId, achievementCode } = body;

  // 2. 基础校验
  if (!userId || !achievementCode) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少参数：userId 或 achievementCode'
    });
  }

  try {
    // 3. 检查该勋章是否存在
    const achievement = await sql`
      SELECT * FROM achievements WHERE code = ${achievementCode}
    `;

    if (achievement.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '勋章不存在'
      });
    }

    // 4. 尝试插入用户勋章记录
    // 使用 INSERT ... ON CONFLICT DO NOTHING 防止重复插入报错
    await sql`
      INSERT INTO user_achievements (user_id, achievement_code)
      VALUES (${userId}, ${achievementCode})
      ON CONFLICT (user_id, achievement_code) DO NOTHING
    `;

    // 5. 查询用户当前拥有的所有勋章 (用于返回给前端)
    const myAchievements = await sql`
      SELECT a.name, a.icon_url, a.description, u.obtained_at
      FROM user_achievements u
      JOIN achievements a ON u.achievement_code = a.code
      WHERE u.user_id = ${userId}
      ORDER BY u.obtained_at DESC
    `;

    return {
      code: 200,
      message: '勋章处理成功',
      data: {
        newlyObtained: achievement[0], // 本次操作的勋章信息
        allAchievements: myAchievements // 用户所有的勋章列表
      }
    };

  } catch (error) {
    console.error('颁发勋章失败:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误'
    });
  }
});