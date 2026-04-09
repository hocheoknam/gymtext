import { defineEventHandler, readBody } from 'h3';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // 1. 基础权限验证
  if (body.userRole !== 'admin') {
    return { code: 403, message: '权限不足' };
  }

  try {
    // 2. 插入数据，设置默认状态和初始统计，自动计算结束日期
    const result = await sql`
      INSERT INTO challenge_activities (
        title,
        description,
        target_duration,
        start_date,
        end_date,
        status,
        participant_count,
        completion_rate
      ) VALUES (
        ${body.title},
        ${body.description},
        ${parseInt(body.target_duration)}, -- 强制转为整数类型
        ${body.start_date},
        ${body.start_date}::date + (${parseInt(body.target_duration)} - 1) * interval '1 day', -- 自动计算结束日期
        'upcoming',
        0,
        0
      ) RETURNING *;
    `;

    return { code: 200, message: '发布成功', data: result[0] };
  } catch (error) {
    // 这行会在你的终端显示具体错误，请根据这个错误调整 SQL
    console.error("数据库报错详情:", error.message);
    return { code: 500, message: "数据库写入失败: " + error.message };
  }
});