# 树和列表加载约定

节点树、节点与资产混合树、数量统计和右侧列表分别维护请求与取消状态。树展开或翻页不等待统计结果；列表请求不等待树完成；列表与 OPTIONS 元数据并行获取。切换筛选条件会取消旧列表请求，旧响应不能覆盖新数据。

分页树使用虚拟滚动，只渲染视口附近的行。混合树每页同时获取直属子节点和直属资产，各自维护分页进度；一类数据加载完后，后续请求只获取另一类。未展开的后代不会递归加载。

## 树结构接口

`GET /api/v1/assets/nodes/children/tree/`

| 参数 | 含义 | 未传时行为 | 兼容旧参数 |
| --- | --- | --- | --- |
| `parent_key` | 要展开的父节点的树路径 | 当前组织根节点；全局组织返回组织根节点 | `key` |
| `include_nodes` | 返回直属子节点 | `true` | `nodes` |
| `include_assets` | 返回直属资产 | `false` | `assets` |
| `include_asset_count` | 在结构请求内计算资产数量 | `true`，新前端明确传 `false`，由独立统计请求获取数量 | `asset_amount` |
| `node_page_size` | 每页子节点数，1–100 | 兼容原有不分页请求 | `node_limit` |
| `node_cursor` | 下一页子节点游标 | 第一页 | 名称保留 |
| `asset_page_size` | 每页资产数，1–1000 | 兼容原有不分页请求 | `assets_limit` |
| `asset_offset` | 资产分页偏移量 | `0` | `assets_offset` |
| `asset_order_by` | 资产排序字段，`name` 或 `address` | `name` | `asset_order` |

前端默认每页 100 个子节点、100 台资产。根节点首屏可能额外包含根节点本身。分页响应中的 `node_pagination` 和 `asset_pagination` 分别描述两类数据的后续进度。

默认值、空筛选值和不参与该请求的字段不发送，例如资产请求不带节点名称、层级，节点请求不带资产排序和偏移。

## 数量和授权范围

`POST /api/v1/perms/asset-permissions/tree-metrics/` 与 `POST /api/v1/assets/nodes/tree-metrics/` 使用 `resources: [{type, id}]` 和 `metric`。后端兼容旧字段 `items`，按资源类型和 ID 去重，取消原来每次最多 200 条的限制。节点资产数量接口 `assets-amount` 的 `node_ids` 同样取消此限制。

前端把本次加载的资源加入独立统计队列，一次提交当前待统计资源，不再拆成 200 条；已返回数量和正在请求的资源不重复提交。树翻页和局部显示调整不会取消正在执行的统计。

授权列表使用 `include_inherited=false` 查询直接授权；包含继承授权是默认行为，无需传参。后端兼容原来的 `all`，两个参数同时出现时以 `include_inherited` 为准。

## 验证

前端运行 `yarn lint` 和 `yarn build:prod`。后端参数兼容、批量限制和布尔筛选回归用例位于 `assets.tests.test_tree_loading`，不创建业务数据。
