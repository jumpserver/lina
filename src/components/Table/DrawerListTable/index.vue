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
      onUpdate: this.onUpdate,
      onClone: this.onClone,
      onDetail: this.onDetail
    }
    for (const [key, value] in Object.entries(actionMap)) {
      if (_.get(this.iTableConfig, 'columnsMeta.actions.formatterArgs.' + key)) {
        continue
      }
      _.set(this.iTableConfig, 'columnsMeta.actions.formatterArgs.' + key, value)
    }
    console.log('Table Config: ', this.iTableConfig)
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
      console.log('Drawer Component: ', this.drawerComponent)
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
      console.log('Update: ', row, col)
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'update', row: row, col: col, id: row.id
      }).then(() => {
        this.showDrawer('update')
      })
    },
    onDetail({ row, cellValue }) {
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'detail', row: row, cellValue: cellValue
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
