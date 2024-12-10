<template>
  <span class="conform-td">
    <span v-if="iValue === statusMap.pending">
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
          <svg-icon icon-class="ignore" @click="handleRisk('ignore')" />
        </el-button>
      </el-tooltip>
    </span>
    <el-tooltip v-else :content="iLabel" :open-delay="400" class="platform-status">
      <span v-if="iValue === statusMap.confirmed ">
        <i class="fa fa-check color-primary" />
      </span>
      <span v-else>
        <svg-icon icon-class="ignore" />
      </span>
    </el-tooltip>
    <ProcessingDialog :visible="processing" />
  </span>
</template>

<script>
import BaseFormatter from './base.vue'
import ProcessingDialog from '@/components/Dialog/ProcessingDialog.vue'

const statusMap = {
  pending: '0',
  confirmed: '1',
  ignored: '2'
}
export default {
  name: 'ConfirmOrIgnoreFormatter',
  components: { ProcessingDialog },
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          confirm: ({ row, cellValue }) => {
          },
          ignore: ({ row, cellValue }) => {
          },
          remove: ({ row, cellValue }) => {
          },
          confirmIcon: 'fa fa-check'
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs),
      processing: false,
      statusMap: statusMap
    }
  },
  computed: {
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
    iActions() {
      return this.getActions()
    }
  },
  methods: {
    handleRemove() {
      this.formatterArgs.remove({ row: this.row, cellValue: this.cellValue })
    },
    handleRisk(cmd) {
      const data = {
        asset: this.row.asset.id,
        username: this.row.username,
        action: cmd,
        risk: ''
      }
      this.processing = true
      this.$axios.post(`/api/v1/accounts/account-risks/handle/`, data).then(() => {
        if (cmd === 'add_account') {
          this.row.present = true
        }
        if (cmd === 'ignore') {
          this.row.status = { 'value': statusMap.ignored }
        }
        this.row.status = { 'value': statusMap.confirmed }
      }).finally(() => {
        setTimeout(() => {
          this.processing = false
        }, 500)
      })
    },
    getActions() {
      const actions = [
        // {
        //   name: 'disable_account',
        //   label: this.$t('Disable remote account'),
        //   has: this.row.remote_present
        // },
        {
          name: 'delete_remote',
          label: this.$t('Delete remote account'),
          has: this.row.remote_present
        },
        {
          name: 'add_account',
          label: this.$t('Add account'),
          has: !this.row.present
        },
        {
          name: 'add_account_after_change_password',
          label: this.$t('Add account after changing password'),
          has: !this.row.present
        }
      ]
      return actions.filter(action => {
        return action.has
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

.action.ignore {
  margin-left: 2px;
}

</style>
