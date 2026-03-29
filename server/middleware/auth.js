import { defineEventHandler, createError } from 'h3';
import jwt from 'jsonwebtoken';

export default defineEventHandler((event) => {
  // 从请求头中获取令牌
  const authHeader = event.node.req.headers.authorization;
  
  if (!authHeader) {
    // 对于非认证接口，允许继续执行
    return;
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    // 对于非认证接口，允许继续执行
    return;
  }

  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 将用户信息添加到请求对象中
    event.context.user = {
      user_id: decoded.user_id,
      email: decoded.email
    };
  } catch (error) {
    // 令牌验证失败，但对于非认证接口，允许继续执行
    console.error('令牌验证失败:', error);
  }
});