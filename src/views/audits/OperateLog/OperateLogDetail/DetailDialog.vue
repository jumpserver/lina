<template>
  <Dialog
    v-if="logDetailVisible"
    :show-confirm="false"
    :show-cancel="false"
    :title="this.$tc('route.OperateLog')"
    :visible.sync="logDetailVisible"
  >
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
  </Dialog>
</template>

<script>
import { Dialog } from '@/components'

export default {
  name: 'DetailDialog',
  components: {
    Dialog
  },
  props: {},
  data() {
    return {
      row: {
        diff: ''
      },
      logDetailVisible: false
    }
  },
  methods: {
    isEmpty() {
      const content = this.row.diff
      return !content || JSON.stringify(content) === '{}'
    },
    show(objId) {
      this.$axios.get(
        `/api/v1/audits/operate-logs/${objId}/?type=action_detail`,
      ).then(res => {
        this.row.diff = res.diff
        this.logDetailVisible = true
      })
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
