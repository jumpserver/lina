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
import { setUrlParam, toLowerCaseExcludeAbbr, toSentenceCase } from '@/utils/common'
import { mapGetters } from 'vuex'

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
      title: '',
      action: '',
      drawerVisible: false,
      drawerComponent: '',
      drawerTitle: ''
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
        if (
          value.formatter && value.formatter.name === 'AmountFormatter' &&
          value.formatterArgs && value.formatterArgs.drawer !== false
        ) {
          value.formatterArgs.onClick = this.onDetail
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
        // this.drawerVisible = false
      }
    },
    drawerVisible: {
      immediate: true,
      handler(val, oldVal) {
        this.$log.debug('>>> drawerVisible changed: ', oldVal, '->', val)
        if (!val && oldVal) {
          this.afterCloseDrawer()
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
      for (const key in ['params', 'query']) {
        for (const k in this.$route[key]) {
          this.$route[key][k] = ''
        }
        const value = this.routeFreeze[key]
        for (const k in value) {
          this.$route[key][k] = value[k]
        }
      }

      this.drawerComponent = ''
    },
    getDetailDrawerTitle({ col, row, cellValue, route }) {
      let title = cellValue || row.name
      const resource = route?.meta?.title || route?.name

      if (resource) {
        title = `${resource}: ${title}`
      }

      return title
    },
    getDefaultTitle({ row, col, cellValue, detailRoute }) {
      let title = this.title
      let dispatchAction = ''
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
      const action = this.action
      if (action === 'clone' || action === 'create') {
        dispatchAction = this.$t('Create')
      } else if (action === 'update') {
        dispatchAction = this.$t('Update')
      } else if (action === 'detail') {
        dispatchAction = this.$t('Detail')
      }
      title = dispatchAction + this.$t('WordSep') + toLowerCaseExcludeAbbr(title)
      if (this.action === 'detail') {
        title = this.getDetailDrawerTitle({ row, col, cellValue, route: detailRoute })
      }
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
      const routes = this.$router.resolve(route)
      if (!routes) {
        return
      }
      const matched = routes.resolved.matched.filter(item => item.name === name && item.components)
      if (matched.length === 0) {
        return
      }

      if (matched[0] && matched[0].components?.default) {
        const component = matched[0].components.default
        return component
      }
    },
    resolveRoute(route) {
      const routes = this.$router.resolve(route)
      if (!routes) {
        return
      }
      const matched = routes.resolved.matched.filter(item => item.name === route.name && item.components)
      if (matched.length === 0) {
        return
      }
      if (matched[0] && matched[0].components?.default) {
        return matched[0]
      }
    },
    getDetailComponent(r) {
      const route = this.resolveRoute(r)
      if (route) {
        return route.components.default
      }
    },
    async showDrawer(action, { row, col, cellValue, detailRoute }) {
      this.drawerTitle = this.getDefaultTitle({ row, col, cellValue, detailRoute })
      try {
        // 1. 先重置状态
        this.drawerVisible = false
        this.action = action

        // 2. 等待下一个 tick，确保状态已重置
        await this.$nextTick()

        // 3. 设置组件
        if (action === 'create') {
          this.drawerComponent = this.createDrawer
        } else if (action === 'update') {
          this.drawerComponent = this.updateDrawer || this.createDrawer
        } else if (action === 'detail') {
          this.drawerComponent = this.detailDrawer || this.getDetailComponent(detailRoute)
        } else if (action === 'clone') {
          this.drawerComponent = this.createDrawer || this.getDefaultDrawer('create')
        } else {
          this.drawerComponent = this.createDrawer
        }

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
    async onDetail({ row, col, cellValue, detailRoute }) {
      this.$route.params.id = row.id
      await this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'detail', row: row, col: col, id: row.id
      })
      await this.showDrawer('detail', { row, col, cellValue, detailRoute })
    },
    async onCreate(meta) {
      if (!meta) {
        meta = {}
      }
      this.$route.params.id = ''
      await this.$store.dispatch('common/setDrawerActionMeta', { action: 'create', ...meta })
      await this.showDrawer('create')
    },
    async onClone({ row, col }) {
      this.$route.params.id = ''
      await this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'clone', row: row, col: col, id: row.id
      })
      await this.showDrawer('clone', { row, col })
    },
    async onUpdate({ row, col }) {
      this.$route.params.id = row.id
      this.$route.params.action = 'update'
      await this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'update', row: row, col: col, id: row.id
      })
      await this.showDrawer('update', { row, col })
    }
  }
}
</script>
