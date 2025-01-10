<template>
  <el-drawer
    :title="$t('Details')"
    :visible.sync="iVisible"
    append-to-body
    destroy-on-close
    direction="rtl"
    class="risk-review-drawer"
    style="z-index: 999"
    @open="handleOpen"
  >
    <div class="drawer-container">
      <div class="drawer-body">
        <div v-for="r in iRows" :key="r.id" class="risk-item">
          <div class="host-username">
            <i class="fa fa-server" />
            <span>{{ r.asset ? r.asset.name : r }} - {{ r.username }}</span>
          </div>
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
.risk-review-drawer {
  ::v-deep .el-drawer {
    background: #f6f8fa;
  }

  ::v-deep .el-drawer__header {
    padding: 16px 20px;
    margin-bottom: 0;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-primary);
    font-weight: 500;
    font-size: 16px;
    background: #fff;
  }

  ::v-deep .el-drawer__body {
    height: 100%;
    padding: 0;
    overflow: hidden;
    position: relative;
  }
}

.drawer-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100%;
}

.drawer-body {
  flex: 1;
  min-height: 0;
  padding: 0;
  overflow-y: auto;

  .risk-item {
    background: #fff;
    margin: 16px;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

    &:first-child {
      margin-top: 16px;
    }

    &:last-child {
      margin-bottom: 16px;
    }

    .host-username {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--color-border);
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-primary);
      border-radius: 8px 8px 0 0;

      i {
        color: var(--color-primary);
        font-size: 16px;
      }
    }

    ::v-deep .el-timeline {
      padding: 16px 20px 20px 40px;
      margin: 0;

      .el-timeline-item {
        padding-bottom: 24px;

        &:last-child {
          padding-bottom: 0;
        }

        .el-timeline-item__node {
          width: 12px;
          height: 12px;
          left: -6px;

          &.el-timeline-item__node--primary {
            background-color: var(--color-primary);
          }

          &.el-timeline-item__node--danger {
            background-color: var(--color-danger);
          }
        }

        .el-timeline-item__tail {
          left: 0;
          border-left: 1px solid var(--color-border);
        }

        .el-timeline-item__timestamp {
          color: var(--color-text-secondary);
          font-size: 12px;
          padding-top: 0;
          margin-bottom: 4px;
        }

        .el-timeline-item__content {
          color: var(--color-text-regular);
          font-size: 13px;
          line-height: 1.6;
        }

        pre {
          margin: 8px 0;
          padding: 12px;
          background: #f6f8fa;
          border-radius: 4px;
          border: 1px solid #ebeef5;
          font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
          font-size: 12px;
          line-height: 1.4;
          color: #24292e;
          overflow: auto;
        }
      }
    }
  }
}

.drawer-footer {
  flex-shrink: 0;
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid var(--color-border);
  text-align: right;
  box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.03);
  position: sticky;
  bottom: 0;
  z-index: 10;

  .buttons {
    .el-button {
      padding: 8px 20px;
      margin-left: 8px;
      transition: all 0.3s ease;

      &:first-child {
        margin-left: 0;
      }

      &:hover {
        transform: translateY(-1px);
      }
    }
  }
}
</style>
