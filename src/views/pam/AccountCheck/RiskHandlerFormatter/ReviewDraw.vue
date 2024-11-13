<template>
  <el-drawer
    v-if="iVisible"
    :visible.sync="iVisible"
    append-to-body
    direction="rtl"
    style="z-index: 999"
    title="审查"
  >
    <div class="drawer-body">
      <el-timeline :reverse="true">
        <el-timeline-item
          v-for="detail in row.details"
          :key="detail.datetime"
          :timestamp="formatTimestamp(detail.datetime)"
          placement="top"
        >
          <span v-html="handleDetail(row, detail)" />
        </el-timeline-item>
      </el-timeline>
    </div>
    <div class="drawer-footer">
      <span class="buttons">
        <el-button size="small" type="primary" @click="handleConfirm">确认</el-button>
        <el-button size="small">忽略</el-button>
      </span>
    </div>
  </el-drawer>
</template>

<script>
import { toSafeLocalDateStr } from '@/utils/time'

export default {
  name: 'ReviewDraw',
  props: {
    row: {
      type: Object,
      default: () => ({})
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  methods: {
    formatTimestamp(datetime) {
      return toSafeLocalDateStr(datetime)
    },
    handleConfirm() {

    },
    handleDetail(row, detail) {
      switch (row.risk.value) {
        case 'ghost':
          return '发现时间: ' + this.formatTimestamp(detail.datetime)
        case 'zombie':
          return '上次登录时间: ' + this.formatTimestamp(detail.date)
        case 'group_changed':
        case 'sudoers_changed':
        case 'authorized_key_changed':
          return `变更:
            <pre>
${detail.diff}
            </pre>
            `
        case 'long_time_password':
          return '上次改密时间: ' + this.formatTimestamp(detail.date)
        case 'account_deleted':
          return '账号被删除'
        default:
          return '其它'
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.drawer-body {
  height: calc(100% - 40px - 40px);
  overflow: auto;

  ::v-deep pre {
    overflow: auto;
  }
}

.drawer-footer {
  border-top: solid 1px var(--color-border);
  height: 70px;
  padding: 15px 30px;

  .buttons {
  }
}

</style>
