import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';

// 确保环境变量中已配置 DATABASE_URL
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 直接从 exercise_logs 查询所有字段
    // 这里的字段名必须与你 Neon 数据库中的列名完全一致
    const logs = await sql`
      SELECT 
        id, 
        name, 
        category, 
        level, 
        equipment, 
        description, 
        target_muscle, 
        sets_reps, 
        gif_url
      FROM exercise_logs
      ORDER BY id ASC`;

    // 格式化输出，确保前端字段匹配
    const formattedData = logs.map(item => ({
      id: item.id,
      name: item.name,
      // 【关键修改】：将 category 映射为前端筛选用的 body_part
      body_part: item.category,
      level: item.level,
      equipment: item.equipment,
      description: item.description,
      target_muscle: item.target_muscle,
      sets_reps: item.sets_reps,
      // 确保这里映射正确，前端才能看到 GIF
      image_url: item.gif_url || '/exercises/placeholder.png'
    }));

    return {
      code: 200,
      message: 'success',
      data: formattedData
    };
  } catch (error) {
    console.error('从 exercise_logs 获取数据失败:', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message,
      data: []
    };
  }
});