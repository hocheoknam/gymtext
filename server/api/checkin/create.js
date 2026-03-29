import { defineEventHandler, readBody } from 'h3';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 1. 获取请求体数据
    const body = await readBody(event);
    const { challenge_id, proof } = body;

    // 2. 从请求头中获取令牌
    const authHeader = event.node.req.headers.authorization;
    
    if (!authHeader) {
      return {
        code: 401,
        message: '未提供认证令牌',
        data: null
      };
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return {
        code: 401,
        message: '未提供认证令牌',
        data: null
      };
    }

    // 3. 验证令牌
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      console.error('令牌验证失败:', error);
      return {
        code: 401,
        message: '无效的认证令牌',
        data: null
      };
    }

    // 4. 从令牌中获取用户 ID
    const user_id = decoded.user_id;

    // 5. 基础参数校验
    if (!user_id || !challenge_id) {
      return {
        code: 400,
        message: '缺少必要参数：user_id 或 challenge_id',
        data: null
      };
    }

    // 3. 检查用户是否参与了该挑战
    const userChallengeResult = await sql`
      SELECT id
      FROM user_challenges
      WHERE user_id = ${user_id} AND challenge_id = ${challenge_id}
    `;

    if (userChallengeResult.length === 0) {
      return {
        code: 400,
        message: '用户未参与该挑战，请先参与挑战',
        data: null
      };
    }

    // 4. 检查今天是否已经打卡
    const todayCheckin = await sql`
      SELECT id
      FROM checkins
      WHERE user_id = ${user_id}
      AND challenge_id = ${userChallengeResult[0].id}
      AND DATE(checkin_time) = CURRENT_DATE
    `;

    if (todayCheckin.length > 0) {
      return {
        code: 400,
        message: '今天已经打卡过了，每个挑战每天只能打卡一次',
        data: null
      };
    }

    // 5. 执行数据库插入
    const result = await sql`
      INSERT INTO checkins (user_id, challenge_id, proof)
      VALUES (${user_id}, ${userChallengeResult[0].id}, ${proof || null})
      RETURNING id, user_id, challenge_id, checkin_time, proof
    `;

    // 5. 返回结果
    return {
      code: 200,
      message: '打卡成功',
      data: result[0] // 返回插入的单条记录
    };

  } catch (error) {
    console.error('打卡失败:', error);

    // 判断是否是外键约束错误
    if (error.code === '23503') {
      return {
        code: 400,
        message: '提交失败：用户挑战关系无效，请确认后再试。',
        error: error.message,
        data: null
      };
    }

    // 通用服务器错误
    return {
      code: 500,
      message: '服务器错误',
      error: error.message,
      data: null
    };
  }
});