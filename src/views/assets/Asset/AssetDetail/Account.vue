<template>
  <div>
    <el-row :gutter="24">
      <el-col :md="24" :sm="24">
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
      headerExtraActions: [
        {
          name: this.$t('AccountTemplate'),
          title: this.$t('AccountTemplate'),
          can: () => this.$hasPerm('accounts.view_accounttemplate') && !this.$store.getters.currentOrgIsRoot,
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
        i.asset = this.object.id
        return i
      })
      this.$axios.post(`/api/v1/accounts/accounts/`, data).then(() => {
        this.templateDialogVisible = false
        this.$refs.ListTable.addAccountSuccess()
        this.$message.success(this.$tc('AddSuccessMsg'))
      })
    }
  }
}
</script>

<style lang='less' scoped>

</style>
