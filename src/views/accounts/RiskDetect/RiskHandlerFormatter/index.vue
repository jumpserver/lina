<template>
  <span>
    <span
      v-if="iValue === '0'"
      class="risk-handler"
      :class="{ 'risk-handler--labeled': showLabels }"
    >
      <el-dropdown
        trigger="click"
        popper-class="action-dropdown"
        @command="handleDropdown"
        @visible-change="handleVisibleChange"
      >
        <el-button class="confirm action" size="small" :type="showLabels ? 'primary' : ''">
          <i
            class="fa fa-check action-leading-icon"
            :class="{ 'action-leading-icon--compact': !showLabels }"
          />
          <span v-if="showLabels">{{ $t('Actions') }}</span>
          <i v-if="showLabels" class="fa fa-caret-down dropdown-indicator" />
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item of actions"
              :key="item.name"
              :command="item.name"
              :disabled="item.disabled"
            >
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-tooltip :content="$tc('IgnoreAlert')" :show-after="400">
        <el-button
          class="ignore action"
          size="small"
          :disabled="!$hasPerm('accounts.change_accountrisk')"
          @click="handleDropdown('ignore')"
        >
          <svg-icon icon-class="ignore" />
          <span v-if="showLabels">{{ $t('Ignore') }}</span>
        </el-button>
      </el-tooltip>
    </span>
    <el-tooltip v-else :content="iLabel" :show-after="400" class="platform-status">
      <el-button size="small" link @click="showDetail">
        <span class="detail-icon">
          <i v-if="iValue === '1'" class="fa fa-check-circle color-primary" />
          <svg-icon v-else icon-class="ignore" />
        </span>
      </el-button>
    </el-tooltip>
    <ReviewDraw
      v-model:visible="reviewDrawer"
      :row="row"
      :rows="rows"
      :selected-rows="selectedRows"
      :show-buttons="reviewButtons"
      @handle="handleDrawerEvent"
    />
    <ProcessingDialog :visible="processing" />
  </span>
</template>
<script>
import ProcessingDialog from '@/components/Dialog/ProcessingDialog.vue'
import BaseFormatter from '@/components/Table/TableFormatters/base.vue'
import { sleep } from '@/utils/common/time'
import ReviewDraw from '@/views/accounts/RiskDetect/RiskHandlerFormatter/ReviewDrawer.vue'
import { riskActions } from './const'

export default {
  name: 'RiskSummaryFormatter',
  components: { ProcessingDialog, ReviewDraw },
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default: () => ({})
    },
    changed: {
      type: Boolean,
      default: false
    },
    rows: {
      type: Array,
      default: () => []
    },
    selectedRows: {
      type: Array,
      default: () => []
    },
    showLabels: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      processing: false,
      reviewDrawer: false,
      reviewButtons: true,
      showViewSecretDialog: false,
      account: {},
      secretUrl: '',
      actions: [],
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  computed: {
    iActions() {
      return this.getActions()
    },
    iValue() {
      if (this.cellValueIsLabelChoice()) {
        return this.cellValue.value
      } else {
        return this.cellValue
      }
    },
    iLabel() {
      if (this.cellValueIsLabelChoice()) {
        return this.cellValue.label
      } else {
        return this.cellValue
      }
    }
  },
  watch: {
    changed() {
      this.handleVisibleChange(true)
    }
  },
  methods: {
    async handleDrawerEvent(payload) {
      const action = payload.action
      delete payload.action
      await this.handleCommon(action, payload)
      this.reviewDrawer = false
    },
    showDetail() {
      this.reviewDrawer = true
    },
    showReview() {
      if (this.selectedRows.length === 0 && !this.row.id) {
        return this.$message.warning(this.$t('PleaseSelectTheDataYouWantToCheck'))
      }
      this.reviewDrawer = true
    },
    async handleCommon(cmd, payload) {
      let rows = this.rows
      this.processing = true
      if (this.rows.length === 0) {
        rows = [this.row]
      }
      if (!payload) {
        payload = {}
      }

      for (const [i, row] of Object.entries(rows)) {
        const data = {
          username: row.username,
          asset: row.asset.id,
          risk: row.risk.value,
          action: cmd,
          ...payload
        }
        row.status = { value: '3', label: this.$t('Processing') }
        let risk = {}
        try {
          risk = await this.$axios.post(`/api/v1/accounts/account-risks/handle/`, data)
        } catch (e) {
          this.$emit('processDone', { index: i, row })
          continue
        }
        await sleep(100)
        if (risk.status) {
          Object.assign(row, risk)
        } else {
          if (cmd !== 'ignore') {
            row.status = { value: '1', label: this.$t('Confirmed') }
          } else {
            row.status = { value: '2', label: this.$t('Ignored') }
          }
        }
        this.$emit('processDone', { index: i, row })
      }
      setTimeout(() => {
        this.processing = false
      }, 500)
    },
    handleDropdown(cmd) {
      if (cmd === 'review') {
        this.showReview()
      } else {
        this.handleCommon(cmd)
      }
    },
    async checkDisabled(action) {
      let disabled = action.disabled === undefined ? false : action.disabled
      if (typeof disabled === 'function') {
        disabled = await action.disabled.call(this)
      }
      return disabled
    },
    async handleVisibleChange(visible) {
      if (!visible) {
        return false
      }
      if (this.actions.length === 0 || this.changed === true) {
        this.actions = await this.getActions()
      }
      return this.actions.length > 0
    },
    async checkHas(action) {
      const has = action.has === undefined ? false : action.has
      if (typeof has === 'function') {
        return await action.has.call(this)
      }
      if (Array.isArray(has)) {
        return has.includes(this.row.risk.value) || action.name === 'review'
      }
      return false
    },
    async getActions() {
      const actions = _.cloneDeep(riskActions)
      const filteredActions = []
      for (const action of actions) {
        action.disabled =
          (await this.checkDisabled(action)) ||
          (action.name !== 'review' && this.$store.getters.currentOrgIsRoot)
        const has = await this.checkHas(action)
        if (has) {
          filteredActions.push(action)
        }
      }
      return filteredActions
    }
  }
}
</script>

<style lang="scss" scoped>
.risk-handler {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.action-leading-icon--compact {
  transform: translate(1px, 1px);
}

.action.el-button--small {
  cursor: pointer;
  padding: 1px 4px;

  &.confirm {
    :deep(i) {
      color: var(--color-primary);
    }
  }

  &.remove {
    :deep(i) {
      color: var(--color-danger);
    }
  }
}

.risk-handler--labeled {
  gap: 8px;

  .action.el-button--small {
    min-width: 72px;
    min-height: 30px;
    height: 30px;
    padding: 8px 12px;
    border-radius: 2px;
    font-size: 12px;
    font-weight: 400;
    line-height: 1;

    &.confirm {
      :deep(i) {
        color: var(--el-color-white);
      }

      .action-leading-icon {
        margin-right: 6px;
      }

      .dropdown-indicator {
        margin-left: 6px;
      }
    }
  }
}

.detail-icon {
  margin-right: 3px;

  i {
    font-size: 14px;
  }
}

.draw-body {
  padding: 20px;
  font-size: 13px;
}
</style>
