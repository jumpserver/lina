<template>
  <CardTable
    v-bind="$attrs"
    ref="table"
    :columns="3"
    :table-config="tableConfig"
    class="info-card-table"
  >
    <template #default="slotProps">
      <CardPanel
        v-bind="subComponentProps"
        :object="slotProps.item"
        :on-view="slotProps.onView"
        :table-config="tableConfig"
        @refresh="reloadTable"
      />
    </template>
  </CardTable>
</template>

<script>
import CardTable from '@/components/Table/CardTable/index.vue';
import CardPanel from './Panel.vue';

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

<style lang="scss" scoped>
.info-card-table {
  :deep(.the-card) {
    display: flex;
    height: auto !important;
    min-height: 180px;
    padding: 0 !important;

    .el-card__body {
      display: flex;
      flex: 1 1 auto;
      min-height: 0;
      height: auto !important;
    }

    .el-card__body > div,
    .el-card__body > div > div {
      height: auto !important;
    }
  }
}
</style>
