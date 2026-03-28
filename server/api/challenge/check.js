import { defineEventHandler, getQuery } from 'h3';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  const { user_id, challenge_id } = getQuery(event); // 接收用户ID和挑战ID

  if (!user_id || !challenge_id) {
    return { code: 400, message: '缺少 user_id 或 challenge_id' };
  }

  try {
    // 查询 user_challenges 表，检查是否存在记录
    const result = await sql`
      SELECT id FROM user_challenges 
      WHERE user_id = ${user_id} AND challenge_id = ${challenge_id}
    `;

    return {
      code: 200,
      message: 'success',
      data: { isJoined: result.length > 0 } // 返回是否已报名
    };
  } catch (error) {
    console.error('检查报名状态失败:', error);
    return { code: 500, message: '服务器错误' };
  }
});