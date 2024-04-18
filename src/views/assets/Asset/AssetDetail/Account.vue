<template>
  <div>
    <el-row :gutter="24">
      <el-col :md="14" :sm="24">
        <AccountListTable
          ref="ListTable"
          :asset="object"
          :has-clone="false"
          :has-import="false"
          :has-left-actions="true"
          :header-extra-actions="headerExtraActions"
          :url="iUrl"
          v-bind="$attrs"
        />
        <AccountTemplateDialog
          v-if="templateDialogVisible"
          :asset="object"
          :show-create="false"
          :visible.sync="templateDialogVisible"
          @onConfirm="onConfirm"
        />
      </el-col>
      <el-col :md="10" :sm="24">
        <QuickActions :actions="quickActions" :title="title" type="primary" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { AccountListTable } from '@/components'
import QuickActions from '@/components/QuickActions'
import AccountTemplateDialog from '@/views/assets/Asset/AssetCreateUpdate/components/AccountTemplateDialog'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'Detail',
  components: {
    QuickActions,
    AccountListTable,
    AccountTemplateDialog
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    },
    url: {
      type: String,
      default: ''
    },
    extraQuickActions: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      title: this.$t('accounts.QuickTest'),
      templateDialogVisible: false,
      headerExtraActions: [
        {
          name: this.$t('route.AccountTemplate'),
          title: this.$t('route.AccountTemplate'),
          can: () => this.$hasPerm('accounts.view_accounttemplate') && !this.$store.getters.currentOrgIsRoot,
          callback: () => {
            this.templateDialogVisible = true
          }
        }
      ],
      quickActions: [
        {
          title: this.$t('accounts.BulkVerify'),
          attrs: {
            type: 'primary',
            label: this.$tc('accounts.Test'),
            disabled: ['clickhouse', 'redis', 'website', 'chatgpt'].indexOf(this.object.type.value) !== -1 ||
                this.$store.getters.currentOrgIsRoot
          },
          callbacks: Object.freeze({
            click: () => {
              this.$axios.post(
                `/api/v1/accounts/accounts/tasks/`,
                { action: 'verify', assets: [this.object.id] }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }
          })
        },
        ...this.extraQuickActions
      ]
    }
  },
  computed: {
    iUrl() {
      return this.url || `/api/v1/accounts/accounts/?asset=${this.object.id}`
    }
  },
  methods: {
    onConfirm(data) {
      data = data?.map(i => {
        i.asset = this.object.id
        return i
      })
      this.$axios.post(`/api/v1/accounts/accounts/`, data).then(() => {
        this.templateDialogVisible = false
        this.$refs.ListTable.addAccountSuccess()
        this.$message.success(this.$tc('common.AddSuccessMsg'))
      })
    }
  }
}
</script>

<style lang='less' scoped>

</style>
