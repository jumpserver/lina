import { markRaw, toRaw } from 'vue'
import { mapGetters } from 'vuex'
import { toLowerCaseExcludeAbbr, toSentenceCase } from '@/utils/common/index'
import { resolveRoute } from '@/utils/vue/index'

const drawerType = [String, Function, Object]

// Shared lifecycle for local CRUD drawers and the single URL-driven detail host.
export default {
  props: {
    detailDrawer: { type: drawerType, default: '' },
    createDrawer: { type: drawerType, default: '' },
    updateDrawer: { type: drawerType, default: '' },
    drawerProps: { type: Object, default: () => ({}) },
    resource: { type: String, default: '' },
    getDrawerTitle: { type: Function, default: null }
  },
  data() {
    return {
      drawerTitle: '',
      action: '',
      drawerVisible: false,
      drawerComponent: null,
      drawerContext: null,
      drawerGeneration: 0
    }
  },
  computed: {
    ...mapGetters(['inDrawer', 'drawerCloseNonce']),
    drawerListeners() {
      return {
        'close-drawer': this.handleDrawerRequestClose,
        'detail-delete-success': this.handleDetailDeleteSuccess,
        'open-update-drawer': this.handleDrawerRequestUpdate,
        'reload-table': this.reloadTable,
        submitSuccess: this.handleDrawerSubmitSuccess
      }
    },
    mergedDrawerProps() {
      return { ...this.drawerProps, drawerContext: this.drawerContext }
    }
  },
  watch: {
    inDrawer(value) {
      if (!value && !this.routeManaged) this.drawerVisible = false
    },
    drawerCloseNonce() {
      const top = this.$store.state.common.drawerStack.at(-1)
      if (top?.token === this.drawerToken) this.handleDrawerRequestClose()
    },
    drawerVisible(value) {
      if (!value) {
        this.$nextTick(() => {
          if (!this.drawerVisible) this.afterCloseDrawer()
        })
      }
    }
  },
  created() {
    this.drawerToken = Symbol('drawer')
    this.legacyRouteState = []
  },
  beforeUnmount() {
    this.clearDrawerRuntime()
  },
  deactivated() {
    this.drawerVisible = false
    this.clearDrawerRuntime()
  },
  methods: {
    clearDrawerRuntime() {
      this.restoreLegacyRouteState()
      this.drawerComponent = null
      this.drawerContext = null
      this.$store.dispatch('common/leaveDrawer', this.drawerToken)
    },
    afterCloseDrawer() {
      if (!this.drawerComponent && !this.drawerContext) return
      this.clearDrawerRuntime()
      this.onDrawerClosed()
    },
    onDrawerClosed() {},
    // Transitional support for older CRUD forms. Detail deep links do not use
    // this adapter. Keep the original buckets so navigation never mutates the
    // destination route while cleaning up a cached page.
    syncLegacyRouteState({ params = {}, query = {} } = {}) {
      for (const [bucket, values] of [
        ['params', params],
        ['query', query]
      ]) {
        const target = this.$route[bucket]
        for (const [key, value] of Object.entries(values)) {
          if (bucket === 'query' && key === 'tab') continue
          let saved = this.legacyRouteState.find(
            (item) => item.target === target && item.key === key
          )
          if (!saved) {
            saved = { target, key, existed: Object.hasOwn(target, key), value: target[key] }
            this.legacyRouteState.push(saved)
          }
          saved.applied = value
          target[key] = value
        }
      }
    },
    restoreLegacyRouteState() {
      for (const { target, key, existed, value, applied } of this.legacyRouteState || []) {
        if (target[key] !== applied) continue
        if (existed) target[key] = value
        else Reflect.deleteProperty(target, key)
      }
      this.legacyRouteState = []
    },
    setDrawerRuntime(meta = {}, extra = {}) {
      this.drawerContext = {
        isDrawer: true,
        action: meta.action || '',
        row: meta.row || {},
        col: meta.col || {},
        id: meta.id || meta.row?.id || '',
        query: _.cloneDeep(extra.query || {}),
        params: _.cloneDeep(extra.params || {}),
        routeName: extra.route?.name || this.$route.name || '',
        ...extra,
        ...meta
      }
    },
    getDetailDrawerTitle({ col, row, cellValue, payload = {} }) {
      const { detailRoute = {}, formatterArgs = {} } = payload
      if (typeof formatterArgs.getDrawerTitle === 'function') {
        return formatterArgs.getDrawerTitle({ col, row, cellValue })
      }
      if (formatterArgs.title) return formatterArgs.title
      const route = resolveRoute(detailRoute, this.$router)
      let title = cellValue || row.name || ''
      if (formatterArgs.getTitle) title = formatterArgs.getTitle({ col, row, cellValue })
      const resource = (route?.meta?.title || route?.name || '')
        .replace('Detail', '')
        .replace('详情', '')
      return resource ? `${resource}: ${title}` : title
    },
    getActionDrawerTitle({ action, row, col, cellValue, payload }) {
      if (this.getDrawerTitle) return this.getDrawerTitle({ ...this.drawerContext, action })
      if (action === 'detail') return this.getDetailDrawerTitle({ col, row, cellValue, payload })
      const title =
        this.resource ||
        String(this.$route.meta?.title || '')
          .replace('List', '')
          .replace('列表', '') ||
        this.$t('NoTitle')
      const label = this.$t(action === 'update' ? 'Update' : 'Create')
      return label + this.$t('WordSep') + toLowerCaseExcludeAbbr(title)
    },
    getDefaultDrawer(action) {
      const name = String(this.$route.name || '').replace(/(List|Detail)$/, toSentenceCase(action))
      return this.getRouteNameComponent(name, action)
    },
    getRouteNameComponent(name, action) {
      const route = resolveRoute(
        { name, params: ['detail', 'update'].includes(action) ? { id: '1' } : {} },
        this.$router
      )
      return route?.components?.default
    },
    getDrawerComponent(action, payload = {}) {
      if (payload.component) return payload.component
      if (action === 'create' || action === 'clone') {
        return this.createDrawer || this.getDefaultDrawer('create')
      }
      if (action === 'update') {
        return (
          this.updateDrawer ||
          this.createDrawer ||
          resolveRoute(payload.route, this.$router)?.components?.default
        )
      }
      return (
        resolveRoute(payload.detailRoute, this.$router)?.components?.default || this.detailDrawer
      )
    },
    showDrawer(action, { row = {}, col = {}, cellValue = '', payload = {} } = {}) {
      try {
        const component = this.getDrawerComponent(action, payload) || this.getDefaultDrawer(action)
        if (!component) throw new Error(`No drawer component found for action: ${action}`)
        this.action = action
        this.drawerComponent = markRaw(toRaw(component))
        this.drawerTitle = this.getActionDrawerTitle({ action, row, col, cellValue, payload })
        this.drawerGeneration += 1
        this.$store.dispatch('common/setDrawerActionMeta', {
          ...this.drawerContext,
          __drawerToken: this.drawerToken
        })
        this.drawerVisible = true
      } catch (error) {
        console.error('Failed to show drawer:', error)
        this.drawerVisible = false
        this.afterCloseDrawer()
      }
    },
    handleDrawerRequestClose() {
      this.drawerVisible = false
    },
    handleDrawerRequestUpdate({ row, col, query = {}, route } = {}) {
      const nextRow = row || this.drawerContext?.row || {}
      if (nextRow.id) this.onUpdate({ row: nextRow, col, query, route })
    },
    onCreate(meta = {}) {
      this.restoreLegacyRouteState()
      this.syncLegacyRouteState({ params: { id: '' }, query: meta.query || {} })
      this.setDrawerRuntime(
        { ...meta, action: 'create' },
        { query: meta.query || {}, params: meta.params || {} }
      )
      this.showDrawer('create', meta)
    },
    onClone({ row, col, query = {} }) {
      this.restoreLegacyRouteState()
      this.syncLegacyRouteState({ params: { id: '' }, query })
      this.setDrawerRuntime({ action: 'clone', row, col, id: row.id }, { query })
      this.showDrawer('clone', { row, col })
    },
    onUpdate({ row, col, query = {}, route }) {
      this.restoreLegacyRouteState()
      const params = { id: row.id, action: 'update' }
      this.syncLegacyRouteState({ params, query })
      const location = route ? this.$router.resolve({ ...route, query }) : undefined
      this.setDrawerRuntime(
        { action: 'update', row, col, id: row.id },
        { query, params, route: location }
      )
      this.showDrawer('update', { row, col, payload: { route } })
    },
    openLocalDetail({ row, col, cellValue, detailRoute, formatterArgs }) {
      const query = detailRoute?.query || {}
      const params = { id: row.id, ...detailRoute?.params }
      this.restoreLegacyRouteState()
      this.syncLegacyRouteState({ params, query })
      this.setDrawerRuntime({ action: 'detail', row, col, id: params.id }, { query, params })
      this.showDrawer('detail', { row, col, cellValue, payload: { detailRoute, formatterArgs } })
    }
  }
}
