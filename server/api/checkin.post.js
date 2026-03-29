import { defineEventHandler, readBody } from 'h3';
import { neon } from '@neondatabase/serverless';

// 1. 初始化数据库连接
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('收到打卡请求:', body);

    // 1. 参数校验
    if (!body.user_id) {
      return { code: 400, message: '缺少必要字段: user_id' };
    }

    if (!body.exercises || (body.exercises.length === 0 && !body.exercise)) {
      return { code: 400, message: '训练内容不能为空' };
    }

    try {
      // 2. 开启事务
      await sql`BEGIN`;

      // 3. 插入打卡记录
      // 注意：PostgreSQL 中的 JSON 字段可以直接存对象数组
      // 这里兼容了前端两种可能的写法：exercises 数组 或 exercise 字符串
      const exercisesData = body.exercises || body.exercise;

      const result = await sql`
        INSERT INTO checkin_records 
        (user_id, exercises, duration, location, checkin_time)
        VALUES 
        (${body.user_id}, ${JSON.stringify(exercisesData)}, ${body.duration || 0}, ${body.location || '未知位置'}, NOW())
        RETURNING id, checkin_time
      `;

      // 4. 提交事务
      await sql`COMMIT`;

      return { 
        code: 200, 
        message: '打卡成功',
        data: {
          id: result[0].id,
          time: result[0].checkin_time
        }
      };

    } catch (err) {
      await sql`ROLLBACK`;
      console.error('打卡失败:', err);
      return { code: 500, message: '服务器保存失败', error: err.message };
    }

  } catch (error) {
    console.error('API 异常:', error);
    return { code: 500, message: '服务器内部错误' };
  }
});