<template>
  <span>
    <span v-if="iValue === '0'" class="risk-handler">
      <el-dropdown trigger="click" @command="handleDropdown" @visible-change="handleVisibleChange">
        <el-button class="confirm action" size="small">
          <i class="fa fa-check" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="item of actions"
            :key="item.name"
            :command="item.name"
            :disabled="item.disabled"
          >
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-tooltip :content="$tc('IgnoreAlert')" :open-delay="400">
        <el-button
          class="ignore action"
          size="small"
          :disabled="!$hasPerm('accounts.change_accountrisk')"
          @click="handleDropdown('ignore')"
        >
          <svg-icon icon-class="ignore" />
        </el-button>
      </el-tooltip>
    </span>
    <el-tooltip v-else :content="iLabel" :open-delay="400" class="platform-status">
      <el-button size="small" type="text" @click="showDetail">
        <span class="detail-icon">
          <i v-if="iValue === '1'" class="fa fa-check-circle color-primary" />
          <svg-icon v-else icon-class="ignore" />
        </span>
      </el-button>
    </el-tooltip>
    <ReviewDraw
      :row="row"
      :rows="rows"
      :selected-rows="selectedRows"
      :show-buttons="reviewButtons"
      :visible.sync="reviewDrawer"
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
.action.el-button--mini {
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
