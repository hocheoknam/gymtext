import { defineEventHandler, getQuery } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数中的用户ID
    const { user_id } = getQuery(event);
    
    if (!user_id) {
      return {
        code: 400,
        message: '缺少用户ID参数',
        data: null
      };
    }
    
    // 查询用户是否存在
    const result = await sql`
      SELECT id, username, email
      FROM gym_app_user
      WHERE id = ${user_id}
    `;
    
    if (result.length > 0) {
      return {
        code: 200,
        message: '用户存在',
        data: result[0]
      };
    } else {
      return {
        code: 404,
        message: '用户不存在',
        data: null
      };
    }

  } catch (error) {
    console.error('检查用户失败:', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message,
      data: null
    };
  }
});