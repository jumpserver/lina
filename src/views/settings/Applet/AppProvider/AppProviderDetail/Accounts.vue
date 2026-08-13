<template>
  <TwoCol>
    <template #default>
      <Account
        v-if="object.host"
        :columns-meta="columnsMeta"
        :object="object.host"
        :url="accountsUrl"
      />
    </template>
    <template #right>
      <QuickActions :actions="quickActions" type="primary" />
    </template>
  </TwoCol>
</template>

<script lang="jsx">
import { QuickActions } from '@/components'
import Account from '@/views/assets/Asset/AssetDetail/Account'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { openTaskPage } from '@/utils/jms/index'

export default {
  name: 'AppProviderAccounts',
  components: {
    TwoCol,
    Account,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
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
          title: this.$t('TestAssetsConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('Test'),
            disabled: !this.object.host || !this.$hasPerm('accounts.verify_account')
          },
          callbacks: {
            click: () => {
              this.$axios
                .post('/api/v1/accounts/accounts/tasks/', {
                  action: 'verify',
                  assets: [this.object.host.id]
                })
                .then((res) => openTaskPage(res.task))
            }
          }
        }
      ]
    }
  },
  computed: {
    accountsUrl() {
      return `/api/v1/terminal/app-providers/${this.object.id}/accounts/`
    }
  }
}
</script>
