import { neon } from '@neondatabase/serverless';
import { defineEventHandler, getQuery } from 'h3';

// 初始化 Neon 客户端
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数中的用户ID
    const { user_id } = getQuery(event);
    
    if (!user_id) {
      return {
        code: 400,
        message: '缺少用户ID参数'
      };
    }
    
    console.log('获取用户勋章列表，用户ID:', user_id);
    
    // 查询用户的勋章列表
    const result = await sql`
      SELECT 
        a.name,
        a.description,
        a.icon_url,
        u.obtained_at
      FROM 
        user_achievements u
      JOIN 
        achievements a ON u.achievement_code = a.code
      WHERE 
        u.user_id = ${user_id}
      ORDER BY 
        u.obtained_at DESC
    `;
    
    console.log('查询结果:', result);
    
    return {
      code: 200,
      data: result
    };
    
  } catch (error) {
    console.error('获取用户勋章列表失败:', error);
    return {
      code: 500,
      message: '服务器内部错误'
    };
  }
});