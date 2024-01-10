<template>
  <el-row :gutter="20">
    <el-col :md="16" :sm="24">
      <Account :columns-meta="columnsMeta" :object.sync="object" />
    </el-col>
    <el-col :md="8" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
    </el-col>
  </el-row>
</template>

<script>
import Account from '@/views/assets/Asset/AssetDetail/Account'
import { QuickActions } from '@/components'

export default {
  name: 'Accounts',
  components: {
    QuickActions, Account
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      columnsMeta: {
        name: {
          formatter: (row) => <span>{row.name}</span>
        },
        asset: {
          label: this.$t('Asset'),
          formatter: (row) => <span>{row.asset.name}</span>
        }
      },
      quickActions: [
        {
          title: this.$t('GenerateAccounts'),
          attrs: {
            type: 'primary',
            label: this.$t('Generate')
          },
          callbacks: {
            click: function() {
              this.$axios.put(
                `/api/v1/terminal/applet-hosts/${this.object.id}/generate-accounts/`,
              ).then(res => {
                this.$message.success(this.$tc('GenerateSuccessMsg'))
              })
            }.bind(this)
          }
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
