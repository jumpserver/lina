<template>
  <Dialog
    v-if="iVisible"
    :title="$tc('assets.SelectTemplate')"
    :visible.sync="iVisible"
    :destroy-on-close="true"
    width="70%"
    v-bind="$attrs"
    v-on="$listeners"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <template>
      <el-button
        type="primary"
        size="small"
        style="margin-bottom: 10px;"
        :disabled="!$hasPerm('accounts.view_accounttemplate')"
        @click="onAddClick"
      >
        {{ $t('common.Add') }}
      </el-button>
      <AutoDataTable :config="tableConfig" />
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import AutoDataTable from '@/components/AutoDataTable'

export default {
  name: 'AccountTemplateDialog',
  components: {
    Dialog,
    AutoDataTable
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    accounts: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      accountsSelected: [],
      tableConfig: {
        url: '/api/v1/assets/account-templates/',
        columns: ['name', 'username', 'privileged'],
        columnsMeta: {
          privileged: {
            width: '100px'
          }
        },
        listeners: {
          'toggle-row-selection': (isSelected, row) => {
            if (isSelected) {
              this.addRowToSelect(row)
            } else {
              this.removeRowToSelect(row)
            }
          }
        },
        theRowDefaultIsSelected: (row) => {
          return this.accounts.some((account) => {
            return account.id === row.id
          })
        }
      }
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
    }
  },
  methods: {
    handleConfirm() {
      this.iVisible = false
      // 过滤掉添加里还没有id的账号
      const hasIdAccounts = this.accounts.filter(i => i?.id)
      const data = _.xorBy(hasIdAccounts, this.accountsSelected, 'id')
      this.accounts.push(...data)
    },
    handleCancel() {
      this.iVisible = false
    },
    onAddClick() {
      this.$router.push({ name: 'AccountTemplateList' })
    },
    hasSelectValue(row) {
      return this.accountsSelected.some(item => item.id === row.id)
    },
    addRowToSelect(row) {
      const hasSelectValue = this.hasSelectValue(row)
      if (!hasSelectValue) {
        this.accountsSelected.push(row)
      }
    },
    removeRowToSelect(row) {
      const hasSelectValue = this.hasSelectValue(row)
      if (hasSelectValue) {
        this.accountsSelected.splice(hasSelectValue, 1)
      }
    }
  }
}
</script>

<style scoped>

</style>
