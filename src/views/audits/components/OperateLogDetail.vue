<template>
  <div>
    <div v-if="isEmpty()" style="text-align: center">
      {{ this.$tc('common.NoContent') }}
    </div>
    <div v-else>
      <el-table
        :data="row.diff"
        height="500"
        style="width: 100%"
      >
        <el-table-column
          :label="this.$tc('audits.ChangeField')"
          prop="field"
          show-overflow-tooltip
          width="100"
        />
        <el-table-column
          :label="this.$tc('audits.BeforeChange')"
          prop="before"
          show-overflow-tooltip
        />
        <el-table-column
          :label="this.$tc('audits.AfterChange')"
          prop="after"
          show-overflow-tooltip
        />
      </el-table>
    </div>
  </div>
</template>

<script>

export default {
  name: 'OperateLogDetail',
  props: {
    row: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    isEmpty() {
      const content = this.row.diff
      return !content || JSON.stringify(content) === '{}'
    }
  }
}

</script>

<style scoped>
  .el-tag {
    width: 100%;
    white-space: normal;
    height: auto;
  }

  .el-table::before {
    background-color: inherit;
  }
</style>
