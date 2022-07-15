<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import Protocols from './components/Protocols'
import AssetAccounts from '@/components/FormFields/AssetAccounts'
import rules from '@/components/DataForm/rules'

export default {
  name: 'AssetCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const nodesInitial = []
    if (this.$route.query['node']) {
      nodesInitial.push(this.$route.query.node)
    }
    return {
      initial: {
        is_active: true,
        platform: 'Linux',
        protocols: ['ssh/22'],
        nodes: nodesInitial
      },
      fields: [
        [this.$t('common.Basic'), ['hostname', 'ip', 'platform', 'public_ip', 'domain']],
        [this.$t('assets.Protocol'), ['protocols']],
        [this.$t('assets.Node'), ['nodes']],
        [this.$t('assets.Account'), ['accounts']],
        [this.$t('assets.Label'), ['labels']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        ip: {
          label: this.$t('assets.ipDomain')
        },
        protocols: {
          component: Protocols,
          on: {
            input: ([value], updateForm) => {
              console.log('protocls: ', value)
              this.fieldsMeta.accounts.el.protocols = value.map(item => {
                return item.split('/')[0]
              })
            }
          }
        },
        platform: {
          el: {
            multiple: false,
            ajax: {
              url: '/api/v1/assets/platforms/',
              transformOption: (item) => {
                return { label: `${item.name}`, value: item.name }
              }
            }
          }
        },
        domain: {
          el: {
            multiple: false,
            clearable: true,
            ajax: {
              url: '/api/v1/assets/domains/'
            }
          }
        },
        accounts: {
          component: AssetAccounts,
          label: '',
          el: {
            protocols: [],
            default: []
          }
        },
        nodes: {
          rules: [rules.RequiredChange],
          el: {
            ajax: {
              url: '/api/v1/assets/nodes/',
              transformOption: (item) => {
                return { label: `${item.full_value}`, value: item.id }
              }
            },
            clearable: true
          }
        },
        labels: {
          el: {
            ajax: {
              url: '/api/v1/assets/labels/',
              transformOption: (item) => {
                return { label: `${item.name}:${item.value}`, value: item.id }
              }
            }
          }
        },
        is_active: {
          type: 'switch'
        }
      },
      url: '/api/v1/assets/assets/',
      createSuccessNextRoute: { name: 'AssetDetail', query: { 'activeTab': 'Account' }},
      hasDetailInMsg: false
    }
  }
}
</script>

<style>

</style>
