# 详情抽屉与直达链接

从通用列表或卡片列表点击详情时只打开本地抽屉，不修改地址栏或浏览器历史。抽屉内切换 tab、打开编辑表单和关闭抽屉也不会生成分享地址。

需要直达详情时，可以显式创建以下链接；应用仍支持解析它，接收者须登录并拥有当前组织下目标资源和 tab 的访问权限。链接不指定组织。

```text
/ui/#/console/assets/assets?tab=database&drawer=AssetDetail&drawerId=<id>&drawerTab=Account
```

- `tab`：背景页面的 tab，列表筛选参数继续保留。
- `drawer`：已注册、通过权限过滤的详情路由名称。
- `drawerId`：对象 ID。
- `drawerTab`：详情组件 submenu 中的 tab 名称，例如 `Account`。
- `drawerQuery`：可选的 JSON 对象，保存详情路由额外的 query，例如角色的 `scope`。它与背景列表 query 隔离，不包含行数据或运行时回调。

直接访问或刷新显式链接会恢复详情。无效、隐藏或禁用的 tab 回退到可访问的 tab，并规范化 URL。只有通过显式链接打开时，详情 tab 才同步 `drawerTab`；关闭后保留背景页面。

## 开发入口

`DrawerListTable` 和 `CardTable` 的详情点击使用本地抽屉。`AppMain` 中的 `RouteDrawerHost` 仅响应显式写入 URL 的抽屉参数，不依赖列表是否已经加载或对象是否在当前分页中。详情路由须有 `:id` 参数、名称以 `Detail` 结尾且没有重定向；`meta.drawer: false` 可以明确禁用。

`Drawer` 提供响应式上下文。详情页读取对象参数应使用 `$context.get('id')` 等，API/权限推导使用 `getRuntimeRoute()`，不要修改背景页面的 `$route`。

`GenericDetailPage` 和 `GenericCreateUpdatePage` 共用 `pagePresentation`：普通路由组件默认显示为整页；列表事件在 `Drawer` 中挂载同一组件时，抽屉上下文会在首次渲染前切换为抽屉模式，隐藏页面自身的标题栏。特殊分享地址中的 `drawer` 参数由 `RouteDrawerHost` 解析并挂载到 `Drawer`，因此仍显示抽屉。组件的 `presentation="page"` 或 `presentation="drawer"` 可用于少量需要显式指定模式的嵌入场景。抽屉动作和对象 ID 仍从运行上下文读取，不根据页面标题或全局抽屉栈推断展示模式。

本地 CRUD 和路由详情共用 `pageMixin` 的组件切换、上下文和栈清理。旧 CRUD 表单的直接路由读取暂由其中的兼容层处理；新增页面应直接使用上下文。背景页面不会继承前台抽屉的动作。

显式链接只恢复最外层详情。嵌套详情和新增/编辑表单仍为本地状态；只有通过显式链接打开的最外层 `TabPage` 同步 `drawerTab`。

## 验证

```bash
node --test tests/drawer-navigation.test.mjs
yarn lint
yarn build:prod
```

回归覆盖列表与卡片点击不改地址、首次关闭、不同对象复用同一组件、响应式上下文、嵌套栈、背景页面隔离、显式链接冷启动、tab 恢复与回退、前进后退，以及列表缓存 key。
