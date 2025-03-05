<template>
  <el-drawer
    :title="$t('Details')"
    :visible.sync="iVisible"
    append-to-body
    class="risk-review-drawer"
    destroy-on-close
    direction="rtl"
    style="z-index: 999"
  >
    <div class="drawer-container">
      <div class="drawer-body">
        <div v-for="r in iRows" :key="r.id" class="risk-item">
          <IBox :title="getAccountTitle(r)">
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
          </IBox>
        </div>
      </div>
      <div class="drawer-footer">
        <div v-if="row.status && row.status.value === '0'">
          <el-input v-model="comment" :placeholder="$tc('PleaseEnterReason')" type="textarea" />
          <span class="buttons">
            <el-button size="small" type="primary" @click="handleClose">
              {{ $t("Close") }}
            </el-button>
            <el-button size="small" @click="handleIgnore">
              {{ $t("IgnoreAlert") }}
            </el-button>
          </span>
        </div>
        <div v-else>
          <el-button size="small" @click="handleReopen">{{ $t('Reopen') }}</el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { toSafeLocalDateStr } from '@/utils/time'
import { riskActions } from './const'
import IBox from '@/components/Common/IBox/index.vue'

export default {
  name: 'ReviewDraw',
  components: { IBox },
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
      comment: ''
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
  methods: {
    getAccountTitle(row) {
      let asset, username
      if (row.account) {
        asset = row.account.asset
        username = row.account.username
      } else {
        asset = row.asset
        username = row.username
      }
      return `${username}@${asset.name}`
    },
    handleClose() {
      this.$emit('handle', { action: 'close', comment: this.comment })
    },
    formatTimestamp(datetime) {
      return toSafeLocalDateStr(datetime)
    },
    handleReopen() {
      this.$emit('handle', { action: 'reopen' })
    },
    handleIgnore() {
      this.$emit('handle', { action: 'ignore', comment: this.comment })
    },
    getDetailIcon(detail) {
      if (detail.action === 'reopen') {
        return 'el-icon-refresh'
      }
      switch (detail.status) {
        case '1':
          return 'el-icon-check'
        case '2':
          return 'el-icon-close-notification'
        default:
          return ''
      }
    },
    getDetailType(detail) {
      if (detail.type !== 'process') {
        return 'warning'
      }
      switch (detail.action) {
        case 'ignore':
          return 'danger'
        case 'reopen':
          return 'primary'
        default:
          return 'success'
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
      const { action, processor, comment } = detail
      let actionLabel = this.actionMap[action]?.label || action
      if (comment) {
        actionLabel = `${actionLabel} (${comment})`
      }
      return `
          <div>${actionLabel}</div>
          <div class="processor"><i class="fa fa-user-o"></i> <span> ${processor}</span></div>
      `
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
      padding: 0;
      overflow: hidden;
      position: relative;
    }

    .el-timeline {
      padding: 0 20px;

      .el-timeline-item__node--normal {
        width: 15px;
        height: 15px;
      }
    }
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
    box-shadow: 0 1px 2px rgba(208, 153, 153, 0.06);

    &:first-child {
      margin-top: 16px;
    }

    &:last-child {
      margin-bottom: 16px;
    }

    ::v-deep {
      .processor {
        margin-top: 5px;
        font-size: 12px;

        color: var(--color-text-secondary)
      }
    }
  }
}

.drawer-footer {
  background: #fff;
  padding: 15px 20px;
  border-top: 1px solid var(--color-border);

  ::v-deep {
    .el-textarea {
      margin-bottom: 5px;
    }
  }
}
</style>
