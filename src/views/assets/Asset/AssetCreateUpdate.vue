<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import Protocols from './components/Protocols'
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
        [this.$t('assets.Protocols'), ['protocols']],
        [this.$t('assets.Auth'), ['admin_user']],
        [this.$t('assets.Node'), ['nodes']],
        [this.$t('assets.Label'), ['labels']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        ip: {
          label: this.$t('assets.ipDomain')
        },
        protocols: {
          component: Protocols
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
        admin_user: {
          el: {
            multiple: false,
            ajax: {
              url: '/api/v1/assets/system-users/?type=admin',
              transformOption: (item) => {
                const username = item.username || '*'
                return { label: item.name + '(' + username + ')', value: item.id }
              }
            }
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
      createSuccessNextRoute: { name: 'AssetDetail' },
      hasDetailInMsg: false
    }
  }
}
</script>

<style>

</style>
