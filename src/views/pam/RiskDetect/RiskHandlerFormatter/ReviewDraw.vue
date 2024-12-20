<template>
  <el-drawer
    :title="$t('Details')"
    :visible.sync="iVisible"
    append-to-body
    destroy-on-close
    direction="rtl"
    style="z-index: 999"
    @open="handleOpen"
  >
    <div class="drawer-body">
      <div v-for="r in iRows" :key="r.id">
        <div class="host-username">{{ r.asset ? r.asset.name : r }} - {{ r.username }}</div>
        <el-timeline :reverse="true">
          <el-timeline-item
            v-for="detail in r.details"
            :key="detail.datetime"
            :icon="getDetailIcon(detail)"
            :timestamp="formatTimestamp(detail.datetime)"
            :type="getDetailType(detail)"
            placement="top"
          >
            <span v-html="handleDetail(r, detail)" />
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
    <div v-if="showButtons" class="drawer-footer">
      <span class="buttons">
        <el-button size="small" type="primary" @click="handleConfirm">{{ $t("Confirm") }}</el-button>
        <el-button size="small">{{ $t('Ignore') }}</el-button>
      </span>
    </div>
  </el-drawer>
</template>

<script>
import { toSafeLocalDateStr } from '@/utils/time'
import { riskActions } from './const'

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
    },
    showButtons: {
      type: Boolean,
      default: true
    },
    rows: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      riskActions
    }
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    actionMap() {
      return riskActions.reduce((acc, cur) => {
        acc[cur.name] = cur
        return acc
      }, {})
    },
    iRows() {
      if (this.rows.length === 0) {
        return [this.row]
      } else {
        return this.rows
      }
    }
  },
  mounted() {
  },
  methods: {
    handleOpen() {
    },
    formatTimestamp(datetime) {
      return toSafeLocalDateStr(datetime)
    },
    handleConfirm() {
    },
    getDetailIcon(detail) {
      if (detail.status === '1') {
        return 'el-icon-check'
      } else if (detail.status === '0') {
        return 'el-icon-close'
      }
    },
    getDetailType(detail) {
      if (detail.type !== 'process') {
        return ''
      }
      if (detail.status === '1') {
        return 'primary'
      } else {
        return 'danger'
      }
    },
    handleDetail(row, detail) {
      if (!detail.type || ['init', 'refind'].includes(detail.type)) {
        return this.handleInit(row, detail)
      } else if (detail.type === 'process') {
        return this.handleProcess(row, detail)
      }
    },
    handleProcess(row, detail) {
      const { action, processor } = detail
      const actionLabel = this.actionMap[action]?.label || action
      return `${processor} ${actionLabel}`
    },
    handleInit(row, detail) {
      switch (row.risk.value) {
        case 'new_found':
          return this.$tc('New found')
        case 'long_time_no_login':
          return this.$tc('Last login time') + ': ' + this.formatTimestamp(detail.date)
        case 'group_changed':
        case 'sudoers_changed':
        case 'authorized_key_changed':
          return `变更:
            <pre>
${detail.diff}
            </pre>
            `
        case 'long_time_password':
          return this.$t('Last change time') + ': ' + this.formatTimestamp(detail.date)
        case 'account_deleted':
          return this.$t('Account deleted')
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

  ::v-deep .el-drawer__body {
    overflow: auto;
  }

  ::v-deep pre {
    overflow: auto;
  }

  .host-username {
    margin-left: 40px;
    margin-bottom: 10px;
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
