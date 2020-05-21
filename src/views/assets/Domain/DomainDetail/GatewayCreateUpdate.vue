<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :initial="initial"
    :fields-meta="fieldsMeta"
    :url="url"
    :create-success-next-route="createSuccessNextRoute"
    :update-success-next-route="updateSuccessNextRoute"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
export default {
  name: 'GatewayCreateUpate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {
        protocol: 'ssh',
        domain: this.$route.params.domainid,
        is_active: true
      },
      fields: [
        [this.$t('assets.Basic'), ['name', 'ip', 'port', 'protocol', 'domain']],
        [this.$t('assets.Auth'), ['username', 'password']],
        [this.$t('assets.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        ip: {
          type: 'input',
          el: {
            type: 'input'
          }
        },
        domain: {
          type: 'input',
          el: {
            disabled: true,
            multiple: false,
            value: this.$route.params.ruleid
          }
        },
        username: {
          el: {
            placeholder: '用户名'
          }
        },
        password: {
          helpText: '不能包含特殊字符'
        },
        is_active: {
          type: 'switch'
        }
      },
      updateSuccessNextRoute: {
        name: 'DomainList'
      },
      createSuccessNextRoute: {
        name: 'DomainList'
      },
      url: `/api/v1/assets/gateways/`
    }
  },
  computed: {

  }
}
</script>

<style lang='less' scoped>

</style>
