<template>
  <div>
    <el-row :gutter="24">
      <el-col :md="24" :sm="24">
        <AccountListTable
          ref="ListTable"
          :asset="object"
          :columns="columns"
          :has-clone="false"
          :has-import="false"
          :has-left-actions="true"
          :header-extra-actions="headerExtraActions"
          :url="iUrl"
          v-bind="$attrs"
        />
        <AccountTemplateDialog
          v-if="templateDialogVisible"
          :show-create="false"
          :visible.sync="templateDialogVisible"
          @onConfirm="onConfirm"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { AccountListTable } from '@/components'
import AccountTemplateDialog from '@/views/assets/Asset/AssetCreateUpdate/components/AccountTemplateDialog'

export default {
  name: 'Detail',
  components: {
    AccountListTable,
    AccountTemplateDialog
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    },
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      templateDialogVisible: false,
      columns: [
        'name', 'username', 'version', 'privileged', 'connectivity',
        'is_active', 'date_created', 'date_updated', 'actions'
      ],
      headerExtraActions: [
        {
          name: this.$t('route.AccountTemplate'),
          title: this.$t('route.AccountTemplate'),
          can: () => this.$hasPerm('accounts.view_accounttemplate'),
          callback: () => {
            this.templateDialogVisible = true
          }
        }
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
        i.template = true
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
