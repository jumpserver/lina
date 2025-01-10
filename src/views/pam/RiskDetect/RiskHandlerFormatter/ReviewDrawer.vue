<template>
  <el-drawer
    :title="$t('Details')"
    :visible.sync="iVisible"
    append-to-body
    destroy-on-close
    direction="rtl"
    style="z-index: 999"
    class="risk-review-drawer"
    @open="handleOpen"
  >
    <div class="drawer-body">
      <div v-for="r in iRows" :key="r.id" class="risk-item">
        <div class="host-username">
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
      type: Array, // 可能会批量 review 所以有了它
      default: () => []
    }
  },
  data() {
    return {
      riskActions,
      title: this.$t('Details of')
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
          return this.$tc('NewFound')
        case 'long_time_no_login':
          return this.$tc('LastLoginTime') + ': ' + this.formatTimestamp(detail.date)
        case 'group_changed':
        case 'sudoers_changed':
        case 'authorized_key_changed':
          return this.$t('Diff') + `:
            <pre>
${detail.diff}
            </pre>
            `
        case 'long_time_password':
          return this.$t('LastChangeTime') + ': ' + this.formatTimestamp(detail.date)
        case 'account_deleted':
          return this.$t('AccountDeleted')
        case 'weak_password':
          return this.$t('WeakPassword')
        case 'repeat_password':
          return this.$t('RepeatPassword')
        case 'leak_password':
          return this.$t('LeakPassword')
        default:
          return this.$t('Other')
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.risk-review-drawer {
  ::v-deep {
     .el-drawer__header {
      padding: 16px 20px;
      margin-bottom: 0;
      border-bottom: 1px solid var(--color-border);
      color: var(--color-text-primary);
      font-weight: 500;
      font-size: 16px;
      background: #fff;
    }

    .el-drawer__body {
      background: #f3f3f3;
      height: 100%;
    }
  }
}

.drawer-body {
  height: calc(100% - 120px);
  padding: 0;
  overflow-y: auto;

  .risk-item {
    background: #fff;
    margin: 16px;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(208, 153, 153, 0.06);

    &:first-child {
      margin-top: 16px;
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
        font-size: 14px;
      }
    }

    ::v-deep .el-timeline {
      padding: 16px 20px 20px 40px;
      margin: 0;
    }
  }
}

.drawer-footer {
  height: 60px;
  padding: 16px 30px;
  background: #fff;
}
</style>
