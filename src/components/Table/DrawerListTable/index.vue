<template>
  <div>
    <ListTable
      ref="ListTable"
      :header-actions="iHeaderActions"
      :table-config="iTableConfig"
      v-bind="$attrs"
    />
    <PageDrawer
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
import PageDrawer from './PageDrawer.vue'
import { setUrlParam, toSentenceCase } from '@/utils/common'
import { mapGetters } from 'vuex'

const drawerType = [String, Function]

export default {
  name: 'GenericListPage',
  components: {
    ListTable, PageDrawer
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
    }
  },
  data() {
    return {
      visible: false,
      drawerVisible: false,
      drawerComponent: '',
      action: ''
    }
  },
  computed: {
    ...mapGetters(['inDrawer']),
    drawerTitle() {
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
      let action = this.action
      if (action === 'clone') {
        action = 'create'
      }
      title = toSentenceCase(action) + this.$t('WordSep') + title.toLowerCase()
      return title
    },
    iHeaderActions() {
      const actions = this.headerActions
      if (!actions.onCreate) {
        actions.onCreate = this.onCreate
      }
      return actions
    },
    iTableConfig() {
      const config = {
        ...this.tableConfig
      }
      const actionMap = {
        'columnsMeta.actions.formatterArgs.onUpdate': this.onUpdate,
        'columnsMeta.actions.formatterArgs.onClone': this.onClone,
        'columnsMeta.name.formatterArgs.drawer': true,
        'columnsMeta.name.formatterArgs.drawerComponent': this.detailDrawer
      }
      for (const [key, value] of Object.entries(actionMap)) {
        if (_.get(config, key)) {
          continue
        }
        _.set(config, key, value)
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
    }
  },
  methods: {
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
    showDrawer(action) {
      this.action = action
      if (action === 'create') {
        this.drawerComponent = this.createDrawer
      } else if (action === 'update') {
        this.drawerComponent = this.updateDrawer || this.createDrawer
      } else if (action === 'detail') {
        this.drawerComponent = this.detailDrawer
      } else if (action === 'clone') {
        this.drawerComponent = this.createDrawer || this.getDefaultDrawer('create')
      } else {
        this.drawerComponent = this.createDrawer
      }
      if (!this.drawerComponent) {
        this.drawerComponent = this.getDefaultDrawer(action)
      }
      console.log('Show drawer', this.drawerComponent)
      this.drawerVisible = true
    },
    onCreate(meta) {
      if (!meta) {
        meta = {}
      }
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'create', ...meta
      }).then(() => {
        this.showDrawer('create')
      })
    },
    reloadTable() {
      if (this.reloadOrderQuery) {
        this.iTableConfig.url = setUrlParam(this.iTableConfig.url, 'order', this.reloadOrderQuery)
      }
      this.$refs.ListTable.reloadTable()
    },
    onClone({ row, col }) {
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'clone', row: row, col: col, id: row.id
      }).then(() => {
        this.showDrawer('clone')
      })
    },
    onUpdate({ row, col }) {
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'update', row: row, col: col, id: row.id
      }).then(() => {
        this.showDrawer('update')
      })
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
