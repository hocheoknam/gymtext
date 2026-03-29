import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 尝试插入一条数据
    const result = await sql`
      INSERT INTO checkins (user_id, challenge_id, proof)
      VALUES (3, 1, '测试打卡')
      RETURNING *
    `;
    
    return {
      code: 200,
      message: '插入成功',
      data: result
    };

  } catch (error) {
    console.error('插入失败:', error);
    return {
      code: 500,
      message: '插入失败',
      error: error.message,
      data: null
    };
  }
});