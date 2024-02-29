<template>
  <el-row :gutter="20">
    <el-col :md="24" :sm="24">
      <Account :columns-meta="columnsMeta" :object.sync="object" :extra-quick-actions="quickActions" />
    </el-col>
  </el-row>
</template>

<script>
import Account from '@/views/assets/Asset/AssetDetail/Account'

export default {
  name: 'Accounts',
  components: {
    Account
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      columnsMeta: {
        name: {
          formatter: (row) => <span>{row.name}</span>
        },
        asset: {
          label: this.$t('assets.Asset'),
          formatter: (row) => <span>{row.asset.name}</span>
        }
      },
      quickActions: [
        {
          title: this.$t('accounts.GenerateAccounts'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Generate')
          },
          callbacks: {
            click: function() {
              this.$axios.put(
                `/api/v1/terminal/applet-hosts/${this.object.id}/generate-accounts/`,
              ).then(res => {
                this.$message.success(this.$tc('accounts.GenerateSuccessMsg'))
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
