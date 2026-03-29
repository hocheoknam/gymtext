import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

// 1. 初始化数据库连接
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 从 URL 查询参数中获取 challenge_id
    const url = new URL(event.node.req.url, `http://${event.node.req.headers.host}`);
    const challenge_id = url.searchParams.get('challenge_id');

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

    if (!user_id || !challenge_id) {
      return { code: 400, message: '缺少必要参数：user_id 或 challenge_id' };
    }

    try {
      // 检查用户是否参与了该挑战
      const userChallengeResult = await sql`
        SELECT id
        FROM user_challenges
        WHERE user_id = ${user_id} AND challenge_id = ${challenge_id}
      `;

      if (userChallengeResult.length === 0) {
        return { code: 400, message: '用户未参与该挑战，请先参与挑战' };
      }

      // 检查今天是否已经打卡
      const todayCheckin = await sql`
        SELECT id
        FROM checkins
        WHERE user_id = ${user_id}
        AND challenge_id = ${userChallengeResult[0].id}
        AND DATE(checkin_time) = CURRENT_DATE
      `;

      return {
        code: 200,
        message: 'success',
        data: {
          todayCheckedIn: todayCheckin.length > 0
        }
      };

    } catch (err) {
      console.error('查询记录失败:', err);
      return { code: 500, message: '查询失败' };
    }

  } catch (error) {
    console.error('API 异常:', error);
    return { code: 500, message: '服务器内部错误' };
  }
});