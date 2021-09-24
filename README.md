# dadudu-cms-vite

- 个人开发者的本地代理配置 <code>local-proxy.js</code> 位于项目根目录下，内容应该长这样：

```javascript
module.exports = {
  '/api': {
    // url 会自动补全：`${target}/api`
    target: 'http://localhost:7716/cms/dadudu', // 本地服务
    secure: false,
    changeOrigin: true
  }
}
```
