<template>
  <span class="risk">
    <span v-for="[k, v] of Object.entries(cellValue) " :key="k">
      <span v-if="v !== 0" size="mini" type="getRiskType(k)">
        {{ getRiskLabel(k) }}: {{ v }};
      </span>
    </span>
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
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs),
      riskLabel: {
        zombie: '长时间未使用',
        ghost: '未托管',
        long_time_password: '长时间未修改密码',
        weak_password: '弱密码',
        password_error: '密码错误',
        password_expired: '密码过期',
        group_changed: '组变更',
        sudo_changed: 'sudo提权',
        account_deleted: '账号删除',
        no_admin_account: '无管理账号',
        no_user_account: '无用户账号',
        other: '其它'
      },
      riskType: {
        zombie: 'warning',
        ghost: 'danger',
        long_time_password: 'warning',
        weak_password: 'warning',
        password_error: 'danger',
        password_expired: 'danger',
        group_changed: 'warning',
        sudo_changed: 'warning',
        account_deleted: 'danger',
        no_admin_account: 'danger',
        no_user_account: 'danger',
        other: 'warning'
      }
    }
  },
  methods: {
    getRiskLabel(key) {
      return this.riskLabel[key.replace('_count', '')] || key
    },
    getRiskType(key) {
      return this.riskType[key.replace('_count', '')] || 'info'
    }
  }
}
</script>

<style lang='scss' scoped>
.risk {
  font-size: 12px;
  color: #1c84c6;

  .el-tag {
    margin-right: 2px;
  }
}

</style>
