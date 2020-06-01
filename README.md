# Lina

Lina 是 JumpServer 的前端 UI 项目, 主要使用 [Vue](https://cn.vuejs.org/), [Element UI](https://element.eleme.cn/) 完成, 
名字来源于 Dota 英雄 [Lina](https://baike.baidu.com/item/%E8%8E%89%E5%A8%9C/16693979)

## 开发运行

前置条件: 部署运行好 JumpServer API 服务器

```
1. 安装依赖
$ yarn install

2. 修改 .env.development VUE_APP_CORE_HOST
# ...
VUE_APP_CORE_HOST = 'JUMPSERVER_APIHOST'

3. 运行
$ yarn serve

4. 构建
$ yarn build
```

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
Copyright (c) 2014-2020 飞致云 FIT2CLOUD, All rights reserved.

Licensed under The GNU General Public License version 2 (GPLv2) (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

https://www.gnu.org/licenses/gpl-2.0.html

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.


