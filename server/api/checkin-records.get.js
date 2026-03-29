import { defineEventHandler, getQuery } from 'h3';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

// 1. 初始化数据库连接
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 从请求头中获取令牌
    const authHeader = event.node.req.headers.authorization;
    
    if (!authHeader) {
      return { code: 401, message: '未提供认证令牌' };
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return { code: 401, message: '未提供认证令牌' };
    }

    // 验证令牌
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      console.error('令牌验证失败:', error);
      return { code: 401, message: '无效的认证令牌' };
    }

    // 从令牌中获取用户 ID
    const user_id = decoded.user_id;

    if (!user_id) {
      return { code: 400, message: '缺少必要参数：user_id' };
    }

    try {
      // 查询用户的健身打卡记录
      const records = await sql`
        SELECT id, user_id, exercises, duration, location, checkin_time as time
        FROM checkin_records 
        WHERE user_id = ${user_id}
        ORDER BY checkin_time DESC
      `;

      // 解析 exercises 字段，因为它存储的是 JSON 字符串
      const parsedRecords = records.map(record => ({
        ...record,
        exercises: typeof record.exercises === 'string' ? JSON.parse(record.exercises) : record.exercises
      }));

      return {
        code: 200,
        message: 'success',
        data: parsedRecords
      };

    } catch (err) {
      console.error('查询健身打卡记录失败:', err);
      return { code: 500, message: '查询失败' };
    }

  } catch (error) {
    console.error('API 异常:', error);
    return { code: 500, message: '服务器内部错误' };
  }
});
