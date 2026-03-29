import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 检查 user_challenges 表结构
    const userChallengesResult = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'user_challenges'
    `;
    
    // 检查 checkins 表结构
    const checkinsResult = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'checkins'
    `;
    
    return {
      code: 200,
      message: '表结构检查成功',
      data: {
        user_challenges: userChallengesResult,
        checkins: checkinsResult
      }
    };

  } catch (error) {
    console.error('检查表结构失败:', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message,
      data: null
    };
  }
});