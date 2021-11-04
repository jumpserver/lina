<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { Select2, UploadKey } from '@/components'
import { UpdateToken } from '@/components/FormFields'

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
          component: UpdateToken
        },
        is_active: {
          type: 'switch'
        },
        private_key: {
          component: UploadKey
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
      url: `/api/v1/assets/gateways/`,
      hasDetailInMsg: false,
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
      },
      cleanFormValue(values) {
        if (this.$route.params.id && !values.password) {
          delete values['password']
        }
        return values
      }
    }
  },
  methods: {
  }
}
</script>

<style lang='less' scoped>

</style>
