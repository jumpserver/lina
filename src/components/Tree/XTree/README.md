# XTree contract

`XTree` is the only base tree renderer. New pages must configure or compose it
instead of introducing another tree implementation.

## Loading

Use `createXTreeSetting` and choose one loading mode:

- `static`: render `initialData` without requesting an API.
- `eager`: request the complete tree from `dataSource.root`.
- `lazy`: request the root first and call `dataSource.children` on expansion.

`dataSource` has one contract for synchronous loaders, asynchronous loaders,
and declarative HTTP operations:

```js
const setting = createXTreeSetting({
  loadMode: X_TREE_LOAD_MODES.LAZY,
  dataSource: createXTreeDataSource(request, {
    root: '/api/tree/',
    children: {
      url: '/api/tree/',
      params: ({ parent }) => ({ key: parent.id })
    },
    search: ({ keyword }) => localSearch(keyword)
  })
})
```

Supported operations are `root`, `children`, `search`, `metrics`, `create`,
`update`, `remove`, and `move`. An HTTP descriptor may configure `method`,
`url`, `params`, `data`, `options`, `when`, `empty`, and `transform`. Each value
may be static or derived from the operation payload.

Use `dataSourceContext` to add reactive business state, such as permission
scope, ordering, or search target, to every data-source call.

## Composition

Business-specific components may provide settings and the `toolbar-prepend`,
`tools-menu`, `node-icon`, `node-actions`, and `rMenu` slots. They must render
`XTree` for the actual tree. `TreePanel` only supplies the shared title, border,
sizing, and surface layout; it does not own data loading or node behavior.

Set `showSearch: true` with `searchPlacement: X_TREE_SEARCH_PLACEMENTS.HEADER`
to keep the search input visible in XTree's own in-flow toolbar. When composing
it with `TreePanel`, set `showHeader: false` so only that toolbar is rendered.
The default `X_TREE_SEARCH_PLACEMENTS.PANEL` keeps the search action in the
external tree header and opens the input above the tree body.

Use `initialExpandedKeys` (an array or a function returning an array) to define
the initial expansion for a business tree. `TreePanel` also proxies XTree's
shared selection and expansion methods: `selectNode`, `clearSelection`,
`getExpandedKeys`, `setExpandedKeys`, `expandAll`, `collapseAll`,
`collapseStepwise`, and `expandToNode`. `collapseStepwise` first keeps root-level
branches expanded and collapses fully on the next call. It also proxies
`showOnlyNodes(nodeIds, options)` and `restoreAllNodes()` so a composition can
configure a temporary visible scope without replacing the shared renderer.
Configure `countUrl`, `loadNodeAmounts`, or `dataSource.metrics` to load counts
asynchronously; XTree batches those requests progressively for the visible rows.
