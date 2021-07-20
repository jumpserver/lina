<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :has-detail-in-msg="false"
    :initial="initial"
    :fields-meta="fieldsMeta"
    :url="url"
    :get-next-route="getNextRoute"
    :clean-form-value="cleanFormValue"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { Select2, UploadKey } from '@/components'
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
        [this.$t('assets.Auth'), ['username', 'update_password', 'password', 'private_key']],
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
        update_password: {
          label: this.$t('users.UpdatePassword'),
          type: 'checkbox',
          hidden: (formValue) => {
            if (formValue.update_password) {
              return true
            }
            return !this.$route.params.id
          }
        },
        password: {
          helpText: this.$t('assets.PasswordWithoutSpecialCharHelpText'),
          hidden: (formValue) => {
            if (!this.$route.params.id) {
              return false
            }
            return !formValue.update_password
          }
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
    },
    cleanFormValue(values) {
      if (this.$route.params.id && !values.update_password) {
        delete values['password']
      }
      return values
    }
  }
}
</script>

<style lang='less' scoped>

</style>
