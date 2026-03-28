import { defineEventHandler, readBody, getQuery } from 'h3';
import { neon } from '@neondatabase/serverless';

// 连接数据库
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  // 处理GET请求 - 获取API Key
  if (method === 'GET') {
    try {
      // 从数据库获取API Key
      const result = await sql`
        SELECT api_key 
        FROM deepseek_api_keys 
        WHERE id = 1 
        LIMIT 1
      `;

      if (result.length > 0) {
        // 调试打印（确认拿到的字符串是干净的）
        console.log('获取到的 API Key:', result[0].api_key);
        console.log('Key 长度:', result[0].api_key.length);
        return {
          code: 200,
          message: 'success',
          data: {
            apiKey: result[0].api_key
          }
        };
      } else {
        return {
          code: 404,
          message: 'API Key not found',
          data: null
        };
      }
    } catch (error) {
      console.error('获取API Key失败:', error);
      return {
        code: 500,
        message: '服务器错误',
        error: error.message
      };
    }
  }

  // 处理POST请求 - 保存API Key
  if (method === 'POST') {
    try {
      const body = await readBody(event);
      const { api_key } = body;

      if (!api_key) {
        return {
          code: 400,
          message: '缺少api_key字段',
          data: null
        };
      }

      // 检查是否存在记录
      const existing = await sql`
        SELECT id 
        FROM deepseek_api_keys 
        WHERE id = 1
      `;

      let result;
      if (existing.length > 0) {
        // 更新现有记录
        result = await sql`
          UPDATE deepseek_api_keys 
          SET api_key = ${api_key}, updated_at = NOW() 
          WHERE id = 1 
          RETURNING id
        `;
      } else {
        // 插入新记录
        result = await sql`
          INSERT INTO deepseek_api_keys (id, api_key, created_at, updated_at) 
          VALUES (1, ${api_key}, NOW(), NOW()) 
          RETURNING id
        `;
      }

      return {
        code: 200,
        message: 'API Key保存成功',
        data: {
          id: result[0].id
        }
      };
    } catch (error) {
      console.error('保存API Key失败:', error);
      return {
        code: 500,
        message: '服务器错误',
        error: error.message
      };
    }
  }

  // 处理不支持的请求方法
  return {
    code: 405,
    message: '不支持的请求方法',
    data: null
  };
});
