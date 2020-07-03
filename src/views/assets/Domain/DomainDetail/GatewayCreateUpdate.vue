<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :initial="initial"
    :fields-meta="fieldsMeta"
    :url="url"
    :get-next-route="getNextRoute"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import Uploadkey from '@/components/UploadKey/'
import { Select2 } from '@/components'
export default {
  name: 'GatewayCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {
        protocol: 'ssh',
        port: 22,
        domain: this.$route.query.domain,
        is_active: true
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'ip', 'port', 'protocol', 'domain']],
        [this.$t('assets.Auth'), ['username', 'password', 'private_key']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        ip: {
          type: 'input',
          el: {
            type: 'input'
          }
        },
        domain: {
          component: Select2,
          el: {
            ajax: {
              url: '/api/v1/assets/domains/'
            },
            disabled: true,
            multiple: false
          }
        },
        protocol: {
          helpText: this.$t('assets.GatewayProtocolHelpText')
        },
        password: {
          helpText: this.$t('assets.PasswordWithoutSpecialCharHelpText')
        },
        is_active: {
          type: 'switch'
        },
        private_key: {
          component: Uploadkey
        }
      },
      updateSuccessNextRoute: {
        name: 'DomainDetail',
        params: {
          id: ''
        }
      },
      createSuccessNextRoute: {
        name: 'DomainDetail',
        params: {
        }
      },
      url: `/api/v1/assets/gateways/`
    }
  },
  methods: {
    getNextRoute(res, method) {
      const domain = res.domain
      const route = {
        name: 'DomainDetail',
        params: {
          id: domain
        },
        query: {
          activeTab: 'GatewayList'
        }
      }
      return route
    }
  }
}
</script>

<style lang='less' scoped>

</style>
