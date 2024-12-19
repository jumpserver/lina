<template>
  <div>
    <ListTable
      ref="ListTable"
      :header-actions="iHeaderActions"
      :table-config="iTableConfig"
      v-bind="$attrs"
    />
    <PageDrawer
      v-if="drawerVisible"
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
import { toSentenceCase } from '@/utils/common'

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
    }
  },
  data() {
    return {
      visible: false,
      drawerVisible: false,
      drawerComponent: '',
      drawerProps: {},
      iHeaderActions: {},
      iTableConfig: {},
      action: '',
      iCreateDrawer: this.createDrawer,
      iUpdateDrawer: this.updateDrawer,
      iDetailDrawer: this.detailDrawer
    }
  },
  computed: {
    drawerTitle() {
      let title = this.title || this.$route.meta.title
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
        this.$store.dispatch('common/cleanDrawerActionMeta')
      }
    }
  },
  mounted() {
    if (!this.createDrawer) {
      this.iCreateDrawer = this.getDefaultDrawer('create')
    }
    if (!this.updateDrawer) {
      this.iUpdateDrawer = this.getDefaultDrawer('update')
    }
    if (!this.detailDrawer) {
      this.iDetailDrawer = this.getDefaultDrawer('detail')
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
    _.set(this.iTableConfig, 'columnsMeta.actions.formatterArgs.onUpdate', this.onUpdate)
    _.set(this.iTableConfig, 'columnsMeta.actions.formatterArgs.onClone', this.onClone)
    _.set(this.iTableConfig, 'columnsMeta.name.formatterArgs.onClick', this.onDetail)
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
    onCreate() {
      this.action = 'create'
      this.drawerComponent = this.iCreateDrawer
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'create'
      }).then(() => {
        this.drawerVisible = true
      })
    },
    reloadTable() {
      this.$refs.ListTable.reloadTable()
    },
    onClone({ row, col }) {
      this.drawerComponent = this.iCreateDrawer
      this.action = 'clone'
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'clone',
        row: row,
        col: col
      }).then(() => {
        this.drawerVisible = true
      })
    },
    onUpdate({ row, col }) {
      this.action = 'update'
      let updateDrawer = this.iUpdateDrawer
      if (!updateDrawer) {
        updateDrawer = this.iCreateDrawer
      }
      this.drawerComponent = updateDrawer
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'update',
        row: row,
        col: col
      }).then(() => {
        this.drawerVisible = true
      })
    },
    onDetail({ row, cellValue }) {
      this.action = 'detail'
      this.drawerComponent = this.iDetailDrawer
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'detail',
        row: row,
        cellValue: cellValue
      }).then(() => {
        this.drawerVisible = true
      })
    }
  }
}
</script>
<style lang="scss" scoped>

.page-drawer ::v-deep .form-group-header {
  margin-left: 1px;
}

</style>
