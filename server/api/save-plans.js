import { defineEventHandler, readBody } from 'h3';
import { neon } from '@neondatabase/serverless';

// 1. 初始化数据库连接
// 确保你的 .env 文件中有 DATABASE_URL
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    const method = event.node.req.method;

    // --- 处理 POST 请求：保存 AI 生成的计划 ---
    if (method === 'POST') {
      const body = await readBody(event);
      console.log('收到保存计划请求:', body);

      // 1. 参数校验
      if (!body.user_id) {
        return { code: 400, message: '缺少必要字段: user_id' };
      }

      // 前端发送的数据结构是 { user_id: ..., exercises: [...], meals: [...] }
      const exercises = body.exercises || [];
      const meals = body.meals || [];

      try {
        // 2. 开启事务 (确保健身计划和饮食计划要么全成功，要么全失败)
        await sql`BEGIN`;

        // 3. 清理旧数据 (每次保存都替换旧计划)
        await sql`DELETE FROM exercise_plan WHERE user_id = ${body.user_id}`;
        await sql`DELETE FROM meal_plan WHERE user_id = ${body.user_id}`;

        // 4. 插入健身计划
        for (const ex of exercises) {
          await sql`
            INSERT INTO exercise_plan 
            (user_id, day, title, type, duration, intensity, details, workout_plan, description, sets, reps, rest_time)
            VALUES 
            (${body.user_id}, ${ex.day}, ${ex.title}, ${ex.type || null}, ${ex.duration || 0}, ${ex.intensity || '中等'}, ${ex.details || ''}, ${ex.workout_plan ? JSON.stringify(ex.workout_plan) : null}, ${ex.description || ''}, ${ex.sets || 0}, ${ex.reps || 0}, ${ex.rest_time || 0})
          `;
        }

        // 5. 插入饮食计划
        for (const meal of meals) {
          await sql`
            INSERT INTO meal_plan 
            (user_id, day, meal_type, title, nutrition, calories, details)
            VALUES 
            (${body.user_id}, ${meal.day}, ${meal.mealType}, ${meal.title}, ${meal.nutrition || ''}, ${meal.calories || 0}, ${meal.details || ''})
          `;
        }

        // 6. 提交事务
        await sql`COMMIT`;

        return { code: 200, message: '计划保存成功' };

      } catch (err) {
        // 7. 发生错误回滚
        await sql`ROLLBACK`;
        console.error('保存计划失败:', err);
        return { code: 500, message: '服务器保存失败', error: err.message };
      }
    }

    // 不支持的请求方法
    return { code: 405, message: 'Method Not Allowed' };

  } catch (error) {
    console.error('API 处理异常:', error);
    return { code: 500, message: '服务器内部错误', error: error.message };
  }
});