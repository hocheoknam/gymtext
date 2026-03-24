import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式（和第一个文件完全一致）
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 直接使用 sql 查询，和第一个文件写法统一
    const exerciseLogs = await sql`
  SELECT id, name, category, level, equipment, description, target_muscle, sets_reps, image_url
  FROM exercise_logs`;

    return {
      code: 200,
      message: 'success',
      data: exerciseLogs || []
    };
  } catch (error) {
    console.error('获取运动记录失败:', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message,
      data: []
    };
  }
});