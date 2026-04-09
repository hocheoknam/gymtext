import { defineEventHandler, readBody, createError } from 'h3';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  // 核心安全检查：只有 admin 能发布
  // 实际项目中应从 session/token 获取用户信息，这里假设你前端传了 role
  if (body.userRole !== 'admin') {
    throw createError({ statusCode: 403, message: '只有管理员能发布挑战' });
  }

  try {
    const result = await sql`
      INSERT INTO user_challenges (
        title, description, duration_days, start_date, status
      ) VALUES (
        ${body.title}, ${body.description}, ${body.duration_days}, ${body.start_date}, 'upcoming'
      ) RETURNING *;
    `;
    return { code: 200, data: result[0] };
  } catch (error) {
    return { code: 500, message: error.message };
  }
});