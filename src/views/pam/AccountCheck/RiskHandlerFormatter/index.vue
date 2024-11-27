<template>
  <span>
    <span v-if="iValue === 'pending'" class="risk-handler">
      <el-dropdown trigger="click" @command="handleRisk">
        <el-button class="confirm action" size="mini">
          <i class="fa fa-check" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="item of iActions" :key="item.name" :command="item.name">
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-tooltip :content="$tc('Ignore')" :open-delay="400">
        <el-button class="ignore action" size="mini">
          <svg-icon icon-class="ignore" />
        </el-button>
      </el-tooltip>
    </span>
    <el-tooltip v-else :content="iLabel" :open-delay="400" class="platform-status">
      <span v-if="iValue === 'confirmed' ">
        <i class="fa fa-check color-primary" />
      </span>
      <span v-else>
        <svg-icon icon-class="ignore" />
      </span>
    </el-tooltip>
    <ReviewDraw :row="row" :visible.sync="reviewDrawer" />
  </span>
</template>
<script>
import BaseFormatter from '@/components/Table/TableFormatters/base.vue'
import ReviewDraw from '@/views/pam/AccountCheck/RiskHandlerFormatter/ReviewDraw.vue'

export default {
  name: 'RiskSummaryFormatter',
  components: { ReviewDraw },
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs),
      reviewDrawer: false
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
    },
    iConfirmIcon() {
      const icon = this.formatterArgs.confirmIcon
      if (typeof icon === 'function') {
        return icon({ row: this.row, cellValue: this.cellValue })
      } else {
        return icon
      }
    }
  },
  methods: {
    handleRisk(cmd) {
      const data = {
        username: this.row.username,
        asset: this.row.asset.id,
        risk: this.row.risk.value,
        action: cmd
      }
      switch (cmd) {
        case 'review':
          this.reviewDrawer = true
          break
        default:
          this.$axios.post(`/api/v1/accounts/account-risks/handle/`, data).then(() => {
            this.row.status = 'confirmed'
          })
      }
    },
    getActions() {
      const actions = [
        {
          name: 'disable_remote',
          label: this.$t('Disable remote'),
          has: ['long_time_no_login', 'new_found']
        },
        {
          name: 'delete_remote',
          label: this.$t('Delete Account'),
          has: ['long_time_no_login', 'new_found']
        },
        {
          name: 'delete_both',
          label: this.$t('Delete Both'),
          has: ['long_time_no_login']
        },
        {
          name: 'add_account',
          label: this.$t('Add to Account'),
          has: ['new_found']
        },
        {
          name: 'change_password',
          label: this.$t('Change Password'),
          has: ['long_time_password', 'weak_password', 'password_expired']
        },
        // {
        //   name: 'addPrivilegedAccount',
        //   label: this.$t('Add Privileged Account'),
        //   has: ['no_admin_account']
        // },
        // {
        //   name: 'modifyPassword',
        //   label: this.$t('Modify Password'),
        //   has: ['password_error']
        // },
        {
          name: 'review',
          label: this.$t('Review'),
          has: ['group_changed', 'sudo_changed', 'authorized_key_changed', 'account_deleted', 'others']
        }
      ]
      return actions.filter(action => {
        return action.has.includes(this.row.risk.value) || action.name === 'review'
      })
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
