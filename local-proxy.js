/*
 * @Author: Broli
 * @Email: broli.up.up.up@gmail.com
 * @Date: 2021-09-16 10:06:32
 * @LastEditors: Broli
 * @LastEditTime: 2021-12-22 14:51:39
 * @Description: 本地地理配置，不用提交
 */
module.exports = {
  '/api': {
    // url 会自动补全：`${target}/api`
    target: 'http://localhost:7716/cms/yjdp', // 本地服务
    // target: 'http://101.34.21.222/cms/yjdp', // 线上服务-无需端口
    secure: false,
    changeOrigin: true
  }
}
