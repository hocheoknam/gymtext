import { neon } from '@neondatabase/serverless';

// 从环境变量获取数据库连接字符串
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL 环境变量未设置');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function checkUsers() {
  try {
    console.log('正在查询数据库中的用户...');
    
    // 查询所有用户ID
    const users = await sql`SELECT id FROM gym_app_user`;
    console.log('数据库中的用户ID:', users.map(user => user.id));
    
    // 检查用户ID为3的用户
    const user3 = await sql`SELECT id FROM gym_app_user WHERE id = 3`;
    console.log('用户ID为3的用户:', user3.length > 0 ? '存在' : '不存在');
    
  } catch (error) {
    console.error('查询用户失败:', error);
  }
}

checkUsers();