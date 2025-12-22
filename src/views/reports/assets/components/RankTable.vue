<template>
  <div class="box">
    <el-table
      :data="config.data"
      class="table"
      style="width: 100%"
    >
      <el-table-column :label="$tc('Ranking')" width="100">
        <template #header>
          <el-tooltip :content="$t('Ranking')" placement="top" :open-delay="500">
            <span style="cursor: pointer;">{{ $t('Ranking') }}</span>
          </el-tooltip>
        </template>
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column
        v-for="i in config.columns"
        :key="i.prop"
        :prop="i.prop"
        :width="getColumnWidth(i)"
      >
        <template #header>
          <el-tooltip :content="i.label" placement="top" :open-delay="500">
            <span style="cursor: pointer;">{{ i.label }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

export default {
  props: {
    config: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
    }
  },
  methods: {
    getColumnWidth(column) {
      if (column.prop === 'total') {
        const locale = this.$i18n.locale
        switch (locale) {
          case 'en':
            return '120px'
          case 'pt-br':
            return '220px'
          default:
            return '100px'
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  margin-top: 16px;
  padding: 20px;
  background: #fff;

  .head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
}

:deep(.el-table) {
  td, th {
  padding: 5px 0;
}

:deep(.el-table) {
  th, tr {
  background-color: #F5F6F7 !important;

}

:deep(.el-table) {
  .cell {
  white-space: nowrap;
}
</style>
