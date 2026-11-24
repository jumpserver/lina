<template>
  <div>
    <ListTable
      v-bind="$attrs"
      ref="ListTable"
      :header-actions="iHeaderActions"
      :table-config="iTableConfig"
    />
    <Drawer
      v-if="drawerComponent"
      :key="drawerKey"
      v-model:visible="drawerVisible"
      :action="action"
      :class="[action]"
      :component="drawerComponent"
      :component-listeners="drawerListeners"
      :component-props="mergedDrawerProps"
      :title="drawerTitle"
      class="page-drawer"
      @close-drawer="handleDrawerShellClose"
      @closed="afterCloseDrawer"
    />
  </div>
</template>

<script>
import ListTable from '../ListTable'
import Drawer from '@/components/Drawer/index.vue'
import { setUrlParam, toLowerCaseExcludeAbbr, toSentenceCase } from '@/utils/common/index'
import { getRuntimeActionMeta } from '@/libs/context/runtime'
import { markRaw, toRaw } from 'vue'
import { mapGetters } from 'vuex'
import { resolveRoute } from '@/utils/vue/index'

const drawerType = [String, Function]
const ROUTE_KEY_NOT_FOUND = Symbol('route-key-not-found')

export default {
  name: 'GenericListPage',
  components: {
    ListTable,
    Drawer
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
      drawerComponent: '',
      drawerContext: null,
      drawerKey: 0
    }
  },
  computed: {
    ...mapGetters(['inDrawer']),
    drawerListeners() {
      return {
        'close-drawer': this.handleDrawerRequestClose,
        'detail-delete-success': this.handleDetailDeleteSuccess,
        'open-update-drawer': this.handleDrawerRequestUpdate,
        'reload-table': this.reloadTable
      }
    },
    mergedDrawerProps() {
      return {
        ...this.drawerProps,
        drawerContext: this.drawerContext
      }
    },
    iHeaderActions() {
      const actions = { ...this.headerActions }
      actions.onCreate = actions.onCreate || this.onCreate
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
        const detailFormatters = ['AmountFormatter', 'DetailFormatter']
        if (
          formatter &&
          detailFormatters.includes(formatter.name) &&
          formatterArgs.drawer !== false
        ) {
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
      flush: 'sync',
      handler(visible) {
        if (!visible) this.restoreLegacyRouteState()
      }
    },
    drawerComponent: {
      handler(val, oldVal) {
        this.$log.debug('>>> drawerComponent changed: ', {
          oldVal: oldVal ? (typeof oldVal === 'function' ? 'FUNCTION' : String(oldVal)) : 'EMPTY',
          newVal: val ? (typeof val === 'function' ? 'FUNCTION' : String(val)) : 'EMPTY',
          drawerVisible: this.drawerVisible
        })
      },
      immediate: true
    }
  },
  mounted() {
    this.routeMutationState = {
      params: {},
      query: {}
    }
    this.$log.debug('>>> DrawerListTable mounted')
  },
  unmounted() {
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
      if (this.drawerVisible) return
      this.$log.debug('>>> afterCloseDrawer called', {
        drawerComponent: this.drawerComponent ? 'EXISTS' : 'EMPTY',
        drawerVisible: this.drawerVisible
      })
      this.$log.debug('>>> afterCloseDrawer: clearing drawerComponent')
      this.drawerComponent = ''
      this.drawerContext = null
      this.$log.debug('>>> afterCloseDrawer: drawerComponent cleared', {
        drawerComponent: this.drawerComponent ? 'EXISTS' : 'EMPTY'
      })
    },
    buildDrawerContext(meta = {}, extra = {}) {
      return {
        isDrawer: true,
        action: meta.action || '',
        row: meta.row || {},
        col: meta.col || {},
        id: meta.id || meta.row?.id || '',
        query: _.cloneDeep(extra.query || {}),
        params: _.cloneDeep(extra.params || {}),
        routeName: this.$route.name || ''
      }
    },
    async setDrawerRuntime(actionMeta = {}, extra = {}) {
      await this.$store.dispatch('common/setDrawerActionMeta', actionMeta)
      this.drawerContext = this.buildDrawerContext(actionMeta, extra)
      return this.drawerContext
    },
    setLegacyRouteState(routeKey, name, value) {
      const routeBucket = this.$route?.[routeKey]
      if (!routeBucket) {
        return
      }
      if (!Object.prototype.hasOwnProperty.call(this.routeMutationState[routeKey], name)) {
        this.routeMutationState[routeKey][name] = Object.prototype.hasOwnProperty.call(
          routeBucket,
          name
        )
          ? routeBucket[name]
          : ROUTE_KEY_NOT_FOUND
      }
      routeBucket[name] = value
    },
    syncLegacyRouteState({ params = {}, query = {} } = {}) {
      Object.entries(params).forEach(([key, value]) => {
        this.setLegacyRouteState('params', key, value)
      })
      Object.entries(query).forEach(([key, value]) => {
        this.setLegacyRouteState('query', key, value)
      })
    },
    restoreLegacyRouteState() {
      for (const routeKey of ['params', 'query']) {
        const routeBucket = this.$route?.[routeKey]
        const mutationBucket = this.routeMutationState?.[routeKey] || {}
        if (!routeBucket) {
          continue
        }
        Object.entries(mutationBucket).forEach(([key, value]) => {
          if (value === ROUTE_KEY_NOT_FOUND) {
            Reflect.deleteProperty(routeBucket, key)
            return
          }
          routeBucket[key] = value
        })
        this.routeMutationState[routeKey] = {}
      }
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
      try {
        const route = this.$route.name
        if (!route) {
          this.$log.debug('>>> getDefaultDrawer: no route name')
          return ''
        }
        const actionRouteName = route.replace('List', toSentenceCase(action))
        this.$log.debug('>>> getDefaultDrawer:', { action, route, actionRouteName })
        return this.getRouteNameComponent(actionRouteName, action)
      } catch (error) {
        this.$log.debug('>>> getDefaultDrawer error:', error, { action })
        return ''
      }
    },
    getRouteNameComponent(name, action) {
      try {
        const route = { name: name }

        if (action === 'detail' || action === 'update') {
          route.params = { id: '1' }
        }

        const resolved = resolveRoute(route, this.$router)
        this.$log.debug('>>> getRouteNameComponent:', {
          name,
          action,
          resolved: resolved ? 'EXISTS' : 'EMPTY'
        })

        if (resolved && resolved.components && resolved.components.default) {
          return resolved.components.default
        }

        return ''
      } catch (error) {
        this.$log.debug('>>> getRouteNameComponent error:', error, { name, action })
        return ''
      }
    },
    getDetailComponent({ detailRoute }) {
      if (!detailRoute) {
        return this.detailDrawer
      }

      const route = resolveRoute(detailRoute, this.$router)
      let component = null

      if (route && route.components && route.components.default) {
        component = route.components.default
      }

      if (!component) {
        component = this.detailDrawer
      }

      return component
    },
    getDrawerComponent(action, payload) {
      console.log('[DrawerListTable] getDrawerComponent:', {
        action,
        createDrawer: this.createDrawer,
        createDrawerType: typeof this.createDrawer,
        updateDrawer: this.updateDrawer,
        detailDrawer: this.detailDrawer
      })
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

    async showDrawer(
      action,
      { row = {}, col = {}, query = {}, cellValue = '', payload = {} } = {}
    ) {
      try {
        const component = this.getDrawerComponent(action, payload) || this.getDefaultDrawer(action)
        if (!component) {
          throw new Error(`No drawer component found for action: ${action}`)
        }

        this.action = action
        this.syncLegacyRouteState({ query })
        if (this.getDrawerTitle) {
          const actionMeta = this.drawerContext || (await getRuntimeActionMeta(this))
          this.title = this.getDrawerTitle({ action, ...actionMeta })
        }
        this.drawerTitle = this.getActionDrawerTitle({ action, row, col, cellValue, payload })
        this.drawerComponent = markRaw(toRaw(component))
        // Each action provides its own context, even when two actions render the same form.
        this.drawerKey++
        this.drawerVisible = true
        await this.$nextTick()
      } catch (error) {
        console.error('Failed to show drawer:', error)
        this.drawerVisible = false
        this.restoreLegacyRouteState()
        this.afterCloseDrawer()
      }
    },
    reloadTable() {
      if (this.reloadOrderQuery) {
        this.iTableConfig.url = setUrlParam(this.iTableConfig.url, 'order', this.reloadOrderQuery)
      }
      this.$refs.ListTable.reloadTable()
    },
    handleDetailDeleteSuccess(payload) {
      this.$emit('detail-delete-success', payload)
    },
    handleDrawerShellClose() {
      this.$store.dispatch('common/cleanDrawerActionMeta')
    },
    handleDrawerRequestClose() {
      this.drawerVisible = false
      this.$nextTick(() => {
        this.$store.dispatch('common/cleanDrawerActionMeta')
      })
    },
    handleDrawerRequestUpdate({ row, col, query = {} } = {}) {
      const nextRow = row || this.drawerContext?.row || {}
      if (!nextRow?.id) {
        return
      }
      this.onUpdate({ row: nextRow, col, query })
    },
    async onDetail({ row, col, cellValue, detailRoute, formatterArgs }) {
      this.$log.debug('>>> onDetail: ', detailRoute, formatterArgs)
      // 因为使用 detail formatter 时，id 可能并非 row 的，比如 execution 的 task id
      const query = detailRoute?.query || {}
      const params = detailRoute?.params || {}
      // 有可能来自 params 或者 row
      const id = params.id || row.id
      this.syncLegacyRouteState({
        params: {
          id: row.id,
          ...params
        },
        query
      })
      await this.setDrawerRuntime(
        {
          action: 'detail',
          row,
          col,
          id
        },
        { query, params }
      )
      await this.showDrawer('detail', {
        row,
        col,
        cellValue,
        payload: { detailRoute, formatterArgs }
      })
    },
    async onCreate(meta) {
      console.log('[DrawerListTable] onCreate called', { meta, createDrawer: this.createDrawer })
      this.$log.debug('>>> onCreate called', { meta })
      if (!meta) {
        meta = {}
      }
      this.syncLegacyRouteState({
        params: {
          id: ''
        },
        query: meta.query || {}
      })
      const actionMeta = { action: 'create', ...meta }
      await this.setDrawerRuntime(actionMeta, {
        query: meta.query,
        params: meta.params
      })
      this.$log.debug('>>> onCreate: calling showDrawer')
      await this.showDrawer('create', meta)
      this.$log.debug('>>> onCreate: showDrawer completed')
    },
    async onClone({ row, col, query = {} }) {
      this.syncLegacyRouteState({
        params: {
          id: ''
        },
        query
      })
      const actionMeta = {
        action: 'clone',
        row: row,
        col: col,
        id: row.id
      }
      await this.setDrawerRuntime(actionMeta, { query })
      await this.showDrawer('clone', { query })
    },
    async onUpdate({ row, col, query = {} }) {
      this.syncLegacyRouteState({
        params: {
          id: row.id,
          action: 'update'
        },
        query
      })
      const actionMeta = {
        action: 'update',
        row: row,
        col: col,
        id: row.id
      }
      await this.setDrawerRuntime(actionMeta, {
        query,
        params: { id: row.id, action: 'update' }
      })
      await this.showDrawer('update', { query })
    }
  }
}
</script>
