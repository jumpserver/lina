<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'

export default {
  name: 'GatewayCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {},
      url: '/api/v1/assets/account-templates/',
      hasDetailInMsg: false,
      fields: [
        [this.$t('common.Basic'), ['name', 'username', 'privileged']],
        [this.$t('assets.Secret'), ['secret_type', 'secret']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        secret_type: {
          on: {
            change: this.secretTypeChange
          }
        },
        secret: {
          el: {
            type: 'input',
            rows: 4
          }
        }
      },
      createSuccessNextRoute: { name: 'AccountTemplateList' },
      updateSuccessNextRoute: { name: 'AccountTemplateList' }
    }
  },
  methods: {
    secretTypeChange([value]) {
      if (value !== 'password') {
        this.$set(this.fieldsMeta.secret.el, 'type', 'textarea')
      } else {
        this.$set(this.fieldsMeta.secret.el, 'type', 'input')
      }
    }
  }
}
</script>

<style>

</style>
