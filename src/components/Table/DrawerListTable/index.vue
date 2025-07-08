<template>
  <div>
    <ListTable
      ref="ListTable"
      :header-actions="iHeaderActions"
      :table-config="iTableConfig"
      v-bind="$attrs"
    />
    <Drawer
      v-if="drawerComponent"
      :action="action"
      :class="[action]"
      :component="drawerComponent"
      :props="drawerProps"
      :title="drawerTitle"
      :visible.sync="drawerVisible"
      class="page-drawer"
    />
  </div>
</template>

<script>
import ListTable from '../ListTable'
import Drawer from '@/components/Drawer/index.vue'
import { setUrlParam, toLowerCaseExcludeAbbr, toSentenceCase } from '@/utils/common/index'
import { mapGetters } from 'vuex'
import { resolveRoute } from '@/utils/vue/index'

const drawerType = [String, Function]

export default {
  name: 'GenericListPage',
  components: {
    ListTable, Drawer
  },
  props: {
    detailDrawer: {
      type: drawerType,
      default: ''
    },
    createDrawer: {
      type: drawerType,
      default: ''
    },
    updateDrawer: {
      type: drawerType,
      default: ''
    },
    tableConfig: {
      type: Object,
      required: true
    },
    headerActions: {
      type: Object,
      required: true
    },
    drawerProps: {
      type: Object,
      default: () => ({})
    },
    reloadOrderQuery: {
      type: String,
      default: '-date_updated'
    },
    resource: {
      type: String,
      default: ''
    },
    getDrawerTitle: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      drawerTitle: '',
      action: '',
      drawerVisible: false,
      drawerComponent: ''
    }
  },
  computed: {
    ...mapGetters(['inDrawer']),
    iHeaderActions() {
      const actions = this.headerActions
      if (!actions.onCreate) {
        actions.onCreate = this.onCreate
      }
      return actions
    },
    iTableConfig() {
      const config = _.cloneDeep(this.tableConfig)
      const actionMap = {
        'columnsMeta.actions.formatterArgs.onUpdate': this.onUpdate,
        'columnsMeta.actions.formatterArgs.onClone': this.onClone,
        'columnsMeta.name.formatterArgs.onClick': this.onDetail
      }
      for (const [key, value] of Object.entries(actionMap)) {
        if (_.get(config, key)) {
          continue
        }
        _.set(config, key, value)
      }
      const columnsMeta = config.columnsMeta
      for (const value of Object.values(columnsMeta)) {
        const formatter = value?.formatter
        const formatterArgs = value?.formatterArgs
        // console.log('>>> name: ', key)
        // console.log('>>> formatter: ', formatter)
        const detailFormaters = ['AmountFormatter', 'DetailFormatter']
        if (formatter && detailFormaters.includes(formatter.name) && formatterArgs.drawer !== false) {
          formatterArgs.onClick = this.onDetail
        }
      }
      return config
    }
  },
  watch: {
    inDrawer(val) {
      if (!this.drawerVisible) {
        return
      }
      if (!val) {
        this.drawerVisible = false
        this.reloadTable()
      }
    },
    drawerVisible: {
      handler(val, oldVal) {
        this.$log.debug('>>> drawerVisible changed: ', oldVal, '->', val)
        if (!val && oldVal) {
          this.$nextTick(() => {
            this.afterCloseDrawer()
          })
        }
      }
    }
  },
  mounted() {
    this.routeFreeze = {
      params: _.cloneDeep(this.$route.params),
      query: _.cloneDeep(this.$route.query)
    }
    this.$log.debug('>>> DrawerListTable mounted: ', this.routeFreeze)
  },
  destroyed() {
    this.$log.debug('>>> DrawerListTable destroyed')
  },
  activated() {
    this.$log.debug('>>> DrawerListTable activated')
  },
  deactivated() {
    this.$log.debug('>>> DrawerListTable deactivated')
  },
  methods: {
    afterCloseDrawer() {
      // 清空路由参数, 恢复路由参数
      for (const key of ['params', 'query']) {
        const curValue = this.$route[key] || {}
        for (const k in curValue) {
          this.$route[key][k] = ''
        }
        const value = this.routeFreeze[key] || {}
        for (const k in value) {
          this.$route[key][k] = value[k]
        }
      }
      this.drawerComponent = ''
    },
    getDetailDrawerTitle({ col, row, cellValue, payload = {} }) {
      this.$log.debug('>>> getDetailDrawerTitle: ', col, row, cellValue, payload)
      const { detailRoute = {}, formatterArgs = {} } = payload
      const getTitle = formatterArgs.getDrawerTitle
      this.$log.debug('>>> getTitle: ', getTitle)
      if (getTitle && typeof getTitle === 'function') {
        return getTitle({ col, row, cellValue })
      }
      if (formatterArgs.title) {
        return formatterArgs.title
      }
      const resolvedRoute = resolveRoute(detailRoute, this.$router)
      let title = cellValue || row.name
      if (formatterArgs.getTitle) {
        title = formatterArgs.getTitle({ col, row, cellValue })
      }
      let resource = resolvedRoute?.meta?.title || resolvedRoute?.name || ''
      resource = resource.replace('Detail', '').replace('详情', '')

      if (resource) {
        title = `${resource}: ${title}`
      }
      return title
    },
    getActionDrawerTitle({ action, row, col, cellValue, payload }) {
      if (action === 'detail') {
        return this.getDetailDrawerTitle({ col, row, cellValue, payload })
      }

      let title = this.title
      if (!title && this.resource) {
        title = this.resource
      }
      if (!title) {
        title = this.$route.meta?.title
        title = title.replace('List', '').replace('列表', '')
        title = _.trimEnd(title, 's')
      }
      if (!title) {
        title = this.$t('NoTitle')
      }
      let actionLabel = ''
      if (action === 'clone' || action === 'create') {
        actionLabel = this.$t('Create')
      } else if (action === 'update') {
        actionLabel = this.$t('Update')
      } else if (action === 'detail') {
        actionLabel = this.$t('Detail')
      }
      title = actionLabel + this.$t('WordSep') + toLowerCaseExcludeAbbr(title)
      return title
    },
    getDefaultDrawer(action) {
      const route = this.$route.name
      const actionRouteName = route.replace('List', toSentenceCase(action))
      return this.getRouteNameComponent(actionRouteName, action)
    },
    getRouteNameComponent(name, action) {
      const route = { name: name }
      if (action === 'detail' || action === 'update') {
        route.params = { id: '1' }
      }
      return resolveRoute(route, this.$router)
    },
    getDetailComponent({ detailRoute }) {
      if (!detailRoute) {
        return this.detailDrawer
      }
      this.$log.debug('>>> getDetailComponent: ', detailRoute)
      const route = resolveRoute(detailRoute, this.$router)
      let component = null
      if (route) {
        component = route.components.default
      }
      if (!component) {
        component = this.detailDrawer
      }
      return component
    },
    getDrawerComponent(action, payload) {
      this.$log.debug('>>> getDrawerComponent: ', action, payload)
      // console.log('>>> createDrawer: ', this.createDrawer)
      switch (action) {
        case 'create':
          return this.createDrawer
        case 'update':
          return this.updateDrawer || this.createDrawer
        case 'detail':
          return this.getDetailComponent(payload)
        case 'clone':
          return this.createDrawer || this.getDefaultDrawer('create')
        default:
          return this.createDrawer
      }
    },

    async showDrawer(action, { row = {}, col = {}, query = {}, cellValue = '', payload = {} } = {}) {
      try {
        // 1. 先重置状态
        this.drawerVisible = false
        this.action = action

        for (const key in query) {
          this.$route.query[key] = query[key]
        }

        // 2. 等待下一个 tick，确保状态已重置
        await this.$nextTick()

        // 3. 设置组件
        this.drawerComponent = this.getDrawerComponent(action, payload)
        this.$log.debug('>>> drawerComponent: ', this.drawerComponent)
        this.drawerTitle = this.getActionDrawerTitle({ action, row, col, cellValue, payload })

        // 4. 如果没有组件，尝试获取默认组件
        if (!this.drawerComponent) {
          this.drawerComponent = this.getDefaultDrawer(action)
        }

        // 5. 如果还是没有组件，报错
        if (!this.drawerComponent) {
          throw new Error(`No drawer component found for action: ${action}`)
        }

        // 6. 获取标题
        if (this.getDrawerTitle) {
          const actionMeta = await this.$store.getters['common/drawerActionMeta']
          this.title = this.getDrawerTitle({ action, ...actionMeta })
        }

        // 7. 等待下一个 tick，确保组件已设置
        await this.$nextTick()

        // 8. 显示抽屉
        this.drawerVisible = true

        this.$log.debug('Drawer initialized:', {
          title: this.title,
          visible: this.drawerVisible,
          component: this.drawerComponent,
          action: this.action,
          'this': this,
          'vm': this.vm
        })
      } catch (error) {
        console.error('Failed to show drawer:', error)
        this.drawerVisible = false
        this.drawerComponent = ''
      }
    },
    reloadTable() {
      if (this.reloadOrderQuery) {
        this.iTableConfig.url = setUrlParam(this.iTableConfig.url, 'order', this.reloadOrderQuery)
      }
      this.$refs.ListTable.reloadTable()
    },
    async onDetail({ row, col, cellValue, detailRoute, formatterArgs }) {
      this.$log.debug('>>> onDetail: ', detailRoute, formatterArgs)
      this.$route.params.id = row.id
      // 因为使用 detail formatter 时，id 可能并非 row 的，比如 execution 的 task id
      const query = detailRoute?.query || {}
      const params = detailRoute?.params || {}
      for (const key in query) {
        this.$route.query[key] = query[key]
      }
      for (const key in params) {
        this.$route.params[key] = params[key]
      }
      // 有可能来自 params 或者 row
      const id = params.id || row.id
      await this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'detail', row: row, col: col, id: id
      })
      await this.showDrawer('detail', { row, col, cellValue, payload: { detailRoute, formatterArgs } })
    },
    async onCreate(meta) {
      if (!meta) {
        meta = {}
      }
      this.$route.params.id = ''
      await this.$store.dispatch('common/setDrawerActionMeta', { action: 'create', ...meta })
      await this.showDrawer('create', meta)
    },
    async onClone({ row, col, query = {} }) {
      this.$route.params.id = ''
      await this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'clone', row: row, col: col, id: row.id
      })
      await this.showDrawer('clone', { query })
    },
    async onUpdate({ row, col, query = {} }) {
      this.$route.params.id = row.id
      this.$route.params.action = 'update'
      await this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'update', row: row, col: col, id: row.id
      })
      await this.showDrawer('update', { query })
    }
  }
}
</script>
