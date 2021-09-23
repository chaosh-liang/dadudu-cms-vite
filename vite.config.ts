import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
// import vitePluginImp from "vite-plugin-imp";

// 开发代理设置
const setProxy = () => {
  let proxy = {
    // 代理，默认配置
    "/api": {
      // url 会自动补全：`${target}/api`
      target: "http://localhost:7716/cms/dadudu", // 本地服务
      // target: 'http://101.34.21.222/cms/dadudu', // 线上服务-无需端口
      secure: false,
      changeOrigin: true,
    },
  };

  try {
    fs.accessSync(path.join(__dirname, "local-proxy.js"));
    const localProxy = require("./local-proxy");
    proxy = localProxy;
  } catch (error) {}

  return proxy;
};

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    reactRefresh(),
    /* vitePluginImp({
      libList: [
        {
          libName: "antd",
          style: (name) => `antd/lib/${name}/style/index.css`,
        },
      ],
    }), */
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true, // 支持内联 JavaScript
      },
    },
  },
  server: {
    port: 3001,
    open: 'chrome',
    proxy: setProxy(),
  },
  build: {
    outDir: "build",
    terserOptions: {
      compress: {
        ecma: 5,
        inline: 2,
        comparisons: false,
        drop_debugger: true,
        drop_console: true,
      },
    },
  },
});
