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
      :component="drawerComponent"
      :props="drawerProps"
      :title="drawerTitle"
      :visible.sync="drawerVisible"
      class="page-drawer"
      @reload-table="reloadTable"
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
      iHeaderActions: {},
      iTableConfig: {},
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
        title = this.$t('NoTitle')
      }
      title = toSentenceCase(this.action) + ' ' + title.toLowerCase()
      return title
    }
  },
  watch: {
    drawerVisible(val) {
      if (!val) {
        // this.$store.dispatch('common/cleanDrawerActionMeta')
      }
    },
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
  created() {
    this.iHeaderActions = {
      ...this.headerActions,
      onCreate: this.onCreate
    }
    this.iTableConfig = {
      ...this.tableConfig
    }
    const actionMap = {
      'columnsMeta.actions.formatterArgs.onUpdate': this.onUpdate,
      'columnsMeta.actions.formatterArgs.onClone': this.onClone,
      'columnsMeta.name.formatterArgs.drawer': true,
      'columnsMeta.name.formatterArgs.drawerComponent': this.detailDrawer
    }
    for (const [key, value] of Object.entries(actionMap)) {
      if (_.get(this.iTableConfig, key)) {
        continue
      }
      _.set(this.iTableConfig, key, value)
    }
  },
  methods: {
    getDefaultDrawer(action) {
      const route = this.$route.name
      const actionRouteName = route.replace('List', toSentenceCase(action))
      return this.getRouteNameComponent(actionRouteName)
    },
    getRouteNameComponent(name) {
      const routes = this.$router.resolve({ name: name })
      if (!routes) {
        return
      }
      const matched = routes.resolved.matched.filter(item => item.name === name && item.components)
      if (matched.length === 0) {
        return
      }

      if (matched[0] && matched[0].components?.default) {
        return matched[0].components.default
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
        this.drawerComponent = this.createDrawer
      } else {
        this.drawerComponent = this.createDrawer
      }
      if (!this.drawerComponent) {
        this.drawerComponent = this.getDefaultDrawer(action)
      }
      this.drawerVisible = true
    },
    onCreate() {
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'create'
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

.page-drawer ::v-deep {
  .form-group-header {
    margin-left: 1px;
  }

  .sql.container {
    display: none;
  }

  .page {
    overflow-y: auto;
  }

  .ibox {
    margin-bottom: 10px;
  }

  .page-content {
    height: unset;

    & > div {
      margin-bottom: 1px;
    }
  }
}

</style>
