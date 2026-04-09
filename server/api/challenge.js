import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式（保持与 exercise_logs 一致）
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 查询挑战活动列表
    // 注意：这里假设表名为 challenge_activities，字段与你刚才要求的 SQL 一致
    const challenges = await sql`
      SELECT 
        id, 
        title, 
        description, 
        status, 
        target_duration, 
        start_date, 
        end_date, 
        participant_count, 
        completion_rate,
        created_at,
        updated_at
      FROM challenge_activities
      ORDER BY 
        start_date ASC
    `;

    return {
      code: 200,
      message: 'success',
      data: challenges || []
    };
  } catch (error) {
    console.error('获取挑战活动失败:', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message,
      data: []
    };
  }
});