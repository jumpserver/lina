<template>
  <CardTable
    ref="table"
    :columns="3"
    :table-config="tableConfig"
    v-bind="$attrs"
  >
    <template v-slot:default="slotProps">
      <CardPanel
        :object="slotProps.item"
        :table-config="tableConfig"
        v-bind="subComponentProps"
        @refresh="reloadTable"
      />
    </template>
  </CardTable>
</template>

<script type="text/jsx">
import CardTable from '@/components/Table/CardTable/index.vue'
import CardPanel from './Panel.vue'

export default {
  name: 'SmallCard',
  components: {
    CardPanel,
    CardTable
  },
  props: {
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    subComponentProps: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  },
  methods: {
    reloadTable() {
      this.$refs.table.reloadTable()
    }
  }
}
</script>
