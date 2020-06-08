<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import Protocols from './components/Protocols'
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
        [this.$t('assets.Basic'), ['hostname', 'ip', 'platform', 'public_ip', 'domain']],
        [this.$t('assets.Protocols'), ['protocols']],
        [this.$t('assets.Auth'), ['admin_user']],
        [this.$t('assets.Node'), ['nodes']],
        [this.$t('assets.Label'), ['labels']],
        [this.$t('assets.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
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
            ajax: {
              url: '/api/v1/assets/domains/'
            }
          }
        },
        admin_user: {
          el: {
            multiple: false,
            ajax: {
              url: '/api/v1/assets/admin-users/'
            }
          },
          rules: [{
            required: false
          }]
        },
        nodes: {
          el: {
            ajax: {
              url: '/api/v1/assets/nodes/',
              transformOption: (item) => {
                return { label: `${item.full_value}`, value: item.id }
              }
            }
          }
        },
        labels: {
          el: {
            ajax: {
              url: '/api/v1/assets/labels/'
            }
          }
        },
        is_active: {
          type: 'switch'
        }
      },
      url: '/api/v1/assets/assets/'
    }
  }
}
</script>

<style>

</style>
