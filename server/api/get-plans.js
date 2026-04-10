import { defineEventHandler, getQuery } from 'h3';
import { neon } from '@neondatabase/serverless';

// 1. 初始化数据库连接
// 确保你的 .env 文件中有 DATABASE_URL
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    const method = event.node.req.method;

    // --- 处理 GET 请求：获取用户的计划 ---
    if (method === 'GET') {
      const { user_id, day } = getQuery(event); // 可以传 day 参数查询某一天，不传则查全部

      if (!user_id) {
        return { code: 400, message: '请提供 user_id' };
      }

      try {
        // 构建查询条件
        let whereClause = sql`WHERE user_id = ${user_id}`;
        if (day) {
          whereClause = sql`${whereClause} AND day = ${day}`;
        }

        // 查询数据
        const [exerciseRes, mealRes] = await Promise.all([
          sql`
            SELECT * FROM exercise_plan 
            ${whereClause}
            ORDER BY day, id
          `,
          sql`
            SELECT * FROM meal_plan 
            ${whereClause}
            ORDER BY day, id
          `
        ]);

        // 处理健身计划数据，智能判断 workout_plan 类型
        const processedExercises = exerciseRes.map(ex => {
          let parsedPlan = [];
          
          if (ex.workout_plan) {
            // 如果已经是对象（JSONB 自动处理了），直接用；如果是字符串，才解析
            if (typeof ex.workout_plan === 'string') {
              try {
                parsedPlan = JSON.parse(ex.workout_plan);
              } catch (e) {
                console.error('解析 workout_plan 失败:', e);
                parsedPlan = [];
              }
            } else {
              parsedPlan = ex.workout_plan;
            }
          }

          return {
            ...ex,
            workout_plan: parsedPlan
          };
        });

        // 处理饮食计划数据，保持字段名一致
        const processedMeals = mealRes.map(meal => ({
          ...meal
        }));

        return {
          code: 200,
          message: 'success',
          data: {
            exercises: processedExercises,
            meals: processedMeals
          }
        };

      } catch (err) {
        console.error('查询计划失败:', err);
        return { code: 500, message: '查询失败', error: err.message };
      }
    }

    // 不支持的请求方法
    return { code: 405, message: 'Method Not Allowed' };

  } catch (error) {
    console.error('API 处理异常:', error);
    return { code: 500, message: '服务器内部错误', error: error.message };
  }
});