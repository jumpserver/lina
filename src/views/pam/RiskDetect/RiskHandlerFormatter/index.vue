<template>
  <span>
    <span v-if="iValue === '0'" class="risk-handler">
      <el-dropdown trigger="click" @command="handleRisk" @visible-change="handleVisibleChange">
        <el-button class="confirm action" size="mini">
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
      <el-tooltip :content="$tc('Ignore')" :open-delay="400">
        <el-button class="ignore action" size="mini" @click="handleRisk('ignore')">
          <svg-icon icon-class="ignore" />
        </el-button>
      </el-tooltip>
    </span>
    <el-tooltip v-else :content="$t('Detail')" :open-delay="400" class="platform-status">
      <el-button size="mini" type="text" @click="showDetail">
        <i v-if="iValue === '1'" class="fa fa-check color-primary" />
        <svg-icon v-else icon-class="ignore" />
        {{ iLabel }}
      </el-button>
    </el-tooltip>
    <ReviewDraw :row="row" :rows="rows" :show-buttons="reviewButtons" :visible.sync="reviewDrawer" />
    <ProcessingDialog :visible="processing" />
  </span>
</template>
<script>
import BaseFormatter from '@/components/Table/TableFormatters/base.vue'
import ReviewDraw from '@/views/pam/RiskDetect/RiskHandlerFormatter/ReviewDrawer.vue'
import ProcessingDialog from '@/components/Dialog/ProcessingDialog.vue'
import { riskActions } from './const'
import { sleep } from '@/utils/time'

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
    }
  },
  data() {
    return {
      reviewDrawer: false,
      reviewButtons: true,
      processing: false,
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
    showDetail() {
      this.reviewButtons = false
      this.reviewDrawer = true
    },
    handleReview() {
      this.reviewButtons = true
      this.reviewDrawer = true
    },
    async handleCommon(cmd) {
      let rows = this.rows
      if (this.rows.length === 0) {
        rows = [this.row]
        this.processing = true
      }

      for (const [i, row] of Object.entries(rows)) {
        const data = {
          username: row.username,
          asset: row.asset.id,
          risk: row.risk.value,
          action: cmd
        }
        row.status = { value: '3', label: this.$t('Processing') }
        await this.$axios.post(`/api/v1/accounts/account-risks/handle/`, data)
        await sleep(100)
        if (cmd !== 'ignore') {
          row.status = { value: '1', label: this.$t('Confirmed') }
        } else {
          row.status = { value: '2', label: this.$t('Ignored') }
        }
        this.$emit('processDone', { index: i, row })
      }
      setTimeout(() => {
        this.processing = false
      }, 500)
    },
    handleRisk(cmd) {
      if (cmd === 'review') {
        this.handleReview()
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
    checkHas(action) {
      return action.has.includes(this.row.risk.value) || action.name === 'review'
    },
    async getActions() {
      let actions = _.cloneDeep(riskActions)
      actions = actions.filter((action) => {
        return this.checkHas(action)
      })
      for (const action of actions) {
        action.disabled = await this.checkDisabled(action)
      }
      return actions
    }
  }
}
</script>

<style lang='scss' scoped>
.action.el-button--mini {
  cursor: pointer;
  padding: 1px 4px;

  &.confirm {
    ::v-deep i {
      color: var(--color-primary);
    }
  }

  &.remove {
    ::v-deep i {
      color: var(--color-danger);
    }
  }

  &.ignore {
    ::v-deep svg.svg-icon {
    }
  }
}

.draw-body {
  padding: 20px;
  font-size: 13px;
}

</style>
