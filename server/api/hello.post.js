export default defineEventHandler(async (event) => {
  // 获取参数
  const body = await readBody(event);

  // 查询数据库
  // const result = await mySql`SELECT * FROM table WHERE id = ${body.id}`;

  // 返回结果
  return {
    code: 200,
    data: 'success',
  };
});