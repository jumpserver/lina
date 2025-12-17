<template>
  <Account
    :url="url"
    :columns-meta="columnsMeta"
    :extra-quick-actions="quickActions"
    :object="object"
  />
</template>

<script lang="jsx">
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
