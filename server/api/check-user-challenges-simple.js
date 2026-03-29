import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 简单查询 user_challenges 表
    const result = await sql`
      SELECT *
      FROM user_challenges
      LIMIT 1
    `;
    
    return {
      code: 200,
      message: '查询成功',
      data: result
    };

  } catch (error) {
    console.error('查询失败:', error);
    return {
      code: 500,
      message: '查询失败',
      error: error.message,
      data: null
    };
  }
});