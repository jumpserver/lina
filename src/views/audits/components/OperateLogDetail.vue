<template>
  <div>
    <div v-if="isEmpty()" style="text-align: center">
      {{ this.$tc('common.NoContent') }}
    </div>
    <div v-else>
      <el-table
        :data="row.diff"
        style="width: 100%"
        height="500"
      >
        <el-table-column
          prop="field"
          :label="this.$tc('audits.ChangeField')"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column
          prop="before"
          :label="this.$tc('audits.BeforeChange')"
          show-overflow-tooltip
        />
        <el-table-column
          prop="after"
          :label="this.$tc('audits.AfterChange')"
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
  data() {},
  methods: {
    isEmpty() {
      const content = this.row.diff
      return !content || JSON.stringify(content) === '{}'
    }
  }
}

</script>

<style scoped>
  .el-tag{
    width: 100%;
    white-space: normal;
    height:auto;
}
</style>
