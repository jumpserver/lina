# Lina

Lina 是 JumpServer 的前端 UI 项目, 主要使用 [Vue](https://cn.vuejs.org/), [Element UI](https://element.eleme.cn/) 完成, 
名字来源于 Dota 英雄 [Lina](https://baike.baidu.com/item/%E8%8E%89%E5%A8%9C/16693979)

## 开发运行

```
0. 前置条件: 部署运行好 JumpServer API 服务器
   Node.js 24.x, yarn 4.x

1. 安装依赖
$ corepack enable
$ yarn install

2. 修改 `.env.development` 中的 `VITE_CORE_HOST`
# ...
VITE_CORE_HOST = 'JUMPSERVER_APIHOST'

3. 运行
$ yarn serve

4. 构建
$ yarn build:prod
```

## 浏览器兼容

保留 Vite 8，并按以下范围维护生产环境兼容性：

| 浏览器 | 完全兼容 | 部分兼容 |
| --- | --- | --- |
| Chrome / Edge | 109+ | 97–108 |
| Firefox | 115+ | 96–114 |
| Safari | 16+ | 15.x |

部分兼容仍要求主要功能正常，允许不影响主要操作的轻微样式差异。
构建目标在 `vite.config.js` 中配置，CSS 前缀范围在 `package.json` 的
`browserslist` 中配置；调整兼容范围时需要同步修改。缺失的运行时 API 由
`src/utils/browser-polyfills.js` 按需补齐，不能只依赖 Vite 的语法转换。

发布前需使用生产构建，在最低支持版本及完全兼容的最低版本上验证登录、
组织切换、表格操作、表单提交、弹窗和会话入口。构建成功不能替代浏览器验收。

## 生产中部署
下载 RELEASE 文件，放到合适的目录，修改 nginx配置文件如下
```
server {
  listen 80;

  location /ui/ {
    try_files $uri / /ui/index.html;
    alias /opt/lina/;
  }

  location / {
    rewrite ^/(.*)$ /ui/$1 last;
  }
}
```

## 致谢
- [Vue](https://cn.vuejs.org) 前端框架
- [Element UI](https://element.eleme.cn/) 饿了么 UI组件库
- [Vue-element-admin](https://github.com/PanJiaChen/vue-element-admin) 项目脚手架


## License & Copyright

This project is licensed under the GNU General Public License version 3 (GPLv3), consistent with the [JumpServer main repository](https://github.com/jumpserver/jumpserver). See [LICENSE](LICENSE) for the full license text.
