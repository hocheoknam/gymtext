import { defineEventHandler, getQuery } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const { user_id, challenge_id } = getQuery(event);
    
    if (!user_id || !challenge_id) {
      return {
        code: 400,
        message: '缺少必要参数',
        data: null
      };
    }
    
    // 查询用户是否参与了该挑战
    const result = await sql`
      SELECT *
      FROM user_challenges
      WHERE user_id = ${user_id} AND challenge_id = ${challenge_id}
    `;
    
    if (result.length > 0) {
      return {
        code: 200,
        message: '用户已参与该挑战',
        data: result[0]
      };
    } else {
      return {
        code: 404,
        message: '用户未参与该挑战',
        data: null
      };
    }

  } catch (error) {
    console.error('检查用户挑战关系失败:', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message,
      data: null
    };
  }
});