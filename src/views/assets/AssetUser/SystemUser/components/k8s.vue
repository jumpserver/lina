<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :initial="initial"
    :fields-meta="fieldsMeta"
    :url="url"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { Required } from '@/components/DataForm/rules'

export default {
  name: 'SystemUserCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {
        protocol: this.$route.query.protocol
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'priority', 'protocol']],
        [this.$t('common.Auth'), ['token']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        token: {
          rules: [Object.assign({}, Required)],
          el: {
            type: 'textarea',
            autosize: { minRows: 3 }
          },
          hidden: form => {
            const params = this.$route.params
            const method = params.id ? 'update' : 'create'
            if (method === 'update') {
              this.fieldsMeta.token.rules[0].required = false
            }
          }
        },
        protocol: {
          rules: [Required],
          el: {
            disabled: true,
            style: 'width:100%'
          }
        }
      },
      url: '/api/v1/assets/system-users/'
    }
  }
}
</script>

<style lang='less' scoped>

</style>
