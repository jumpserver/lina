<template>
  <div>
    <ListTable
      v-bind="$attrs"
      ref="ListTable"
      :header-actions="iHeaderActions"
      :table-config="iTableConfig"
    >
      <template v-if="$slots['search-after']" #search-after>
        <slot name="search-after" />
      </template>
    </ListTable>
    <Drawer
      v-if="drawerComponent"
      v-model:visible="drawerVisible"
      :action="action"
      :class="[action]"
      :component="drawerComponent"
      :component-key="drawerGeneration"
      :component-listeners="drawerListeners"
      :component-props="mergedDrawerProps"
      :title="drawerTitle"
      class="page-drawer"
    />
  </div>
</template>

<script>
import ListTable from '../ListTable'
import Drawer from '@/components/Drawer/index.vue'
import drawerPageMixin from '@/components/Drawer/pageMixin'
import { setUrlParam } from '@/utils/common/index'
import { eventBus } from '@/utils/vue/eventbus'

export default {
  name: 'GenericListPage',
  components: { ListTable, Drawer },
  mixins: [drawerPageMixin],
  props: {
    tableConfig: { type: Object, required: true },
    headerActions: { type: Object, required: true },
    reloadOrderQuery: { type: String, default: '-date_updated' }
  },
  data() {
    return { tableActive: true }
  },
  computed: {
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
          formatterArgs?.drawer !== false
        ) {
          value.formatterArgs = { ...formatterArgs, onClick: this.onDetail }
        }
      }
      return config
    }
  },
  mounted() {
    this.ownerPath = this.$route.path
    eventBus.on('drawer-resource-change', this.onRouteDrawerResourceChange)
  },
  beforeUnmount() {
    eventBus.off('drawer-resource-change', this.onRouteDrawerResourceChange)
  },
  activated() {
    this.tableActive = true
  },
  deactivated() {
    this.tableActive = false
  },
  methods: {
    onDetail(payload) {
      this.openLocalDetail(payload)
    },
    onRouteDrawerResourceChange({ path }) {
      if (this.tableActive && path === this.ownerPath) this.reloadTable()
    },
    reloadTable() {
      if (this.reloadOrderQuery) {
        this.iTableConfig.url = setUrlParam(this.iTableConfig.url, 'order', this.reloadOrderQuery)
      }
      this.$refs.ListTable?.reloadTable()
    },
    toggleRowSelection(row, isSelected) {
      return this.$refs.ListTable?.toggleRowSelection(row, isSelected)
    },
    handleDetailDeleteSuccess(payload) {
      this.$emit('detail-delete-success', payload)
    },
    handleDrawerSubmitSuccess(payload) {
      this.reloadTable()
      this.$emit('resource-change', payload)
    }
  }
}
</script>
