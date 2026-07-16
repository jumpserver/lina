<template>
  <CardTable
    ref="CardTable"
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :table-config="tableConfig"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
import CardTable from '../CardTable/index.vue'

const drawerType = [String, Function]

export default {
  name: 'DrawerCardTable',
  components: {
    CardTable
  },
  props: {
    detailDrawer: {
      type: drawerType,
      default: ''
    },
    tableConfig: {
      type: Object,
      required: true
    },
    headerActions: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    reloadTable() {
      this.$refs.CardTable.reloadTable()
    }
  }
}
</script>
