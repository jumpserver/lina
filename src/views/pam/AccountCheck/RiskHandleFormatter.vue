<template>
  <span class="risk-handler">
    <el-dropdown trigger="click">
      <el-button class="confirm action" size="mini">
        <i class="fa fa-check" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="item of iActions" :key="item.name">
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
</template>
<script>
import BaseFormatter from '@/components/Table/TableFormatters/base.vue'

export default {
  name: 'RiskSummaryFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  computed: {
    iActions() {
      return this.getActions()
    }
  },
  methods: {
    getActions() {
      const actions = [
        {
          name: 'disableAccount',
          label: this.$t('Disable Account'),
          has: ['zombie', 'ghost'],
          callback: () => {
          }
        },
        {
          name: 'deleteAccount',
          label: this.$t('Delete Account'),
          has: ['zombie', 'ghost']
        },
        {
          name: 'addToAccount',
          label: this.$t('Add to Account'),
          has: ['ghost']
        },
        {
          name: 'changePassword',
          label: this.$t('Change Password'),
          has: ['long_time_password', 'weak_password', 'password_expired']
        },
        {
          name: 'addPrivilegedAccount',
          label: this.$t('Add Privileged Account'),
          has: ['no_admin_account']
        },
        {
          name: 'modifyPassword',
          label: this.$t('Modify Password'),
          has: ['password_error']
        },
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

</style>
