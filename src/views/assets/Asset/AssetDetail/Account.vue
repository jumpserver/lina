<template>
  <div>
    <el-row :gutter="24">
      <el-col :md="16" :sm="24">
        <AccountListTable
          ref="ListTable"
          v-bind="$attrs"
          :asset="object"
          :url="iUrl"
          :has-import="false"
          :has-clone="false"
          :has-left-actions="true"
          :columns="columns"
          :header-extra-actions="headerExtraActions"
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
        if (i.hasOwnProperty('id')) {
          delete i['id']
        }
        i.asset = this.object.id
        return i
      })
      this.$axios.post(`/api/v1/accounts/accounts/`, data).then(() => {
        this.templateDialogVisible = false
        this.$refs.ListTable.addAccountSuccess()
        this.$message.success(this.$tc('common.createSuccessMsg'))
      }).catch(() => {
        this.$message.error(this.$tc('common.createErrorMsg'))
      })
    }
  }
}
</script>

<style lang='less' scoped>

</style>
