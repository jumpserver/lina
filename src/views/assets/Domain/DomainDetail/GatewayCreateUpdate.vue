<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { Select2, UploadKey } from '@/components'
import { UpdateToken } from '@/components/FormFields'
import ProtocolSelector from '../components/ProtocolSelector'

export default {
  name: 'GatewayCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {
        is_active: true,
        protocols: '',
        domain: this.$route.query.domain
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'address']],
        [this.$t('assets.Network'), ['domain', 'protocols']],
        [this.$t('assets.Auth'), ['username', 'password', 'private_key', 'passphrase']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
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
        protocols: {
          component: ProtocolSelector,
          el: {
          },
          hidden: (form) => {
            const fieldsMeta = this.fieldsMeta
            if (form['protocols']) {
              fieldsMeta['protocols'].el.choices = form['protocols']
            }
          }
        },
        password: {
          component: UpdateToken
        },
        private_key: {
          component: UploadKey
        },
        is_active: {
          type: 'switch'
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
  mounted() {
    console.log('---', this.object)
  },
  methods: {
  }
}
</script>

<style lang='less' scoped>

</style>
