<template>
  <GenericCreateUpdatePage v-bind="$data" :initial="initial" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { Required } from '@/components/DataForm/rules'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      fields: [
        [
          this.$t('common.Basic'), [
            'name', 'provider', 'access_key_id', 'access_key_secret', 'comment'
          ]
        ]
      ],
      url: '/api/v1/xpack/cloud/accounts/',
      fieldsMeta: {
        provider: {
          rules: [Required],
          el: {
            disabled: true
          }
        },
        access_key_id: {
          rules: [
            { required: this.$route.meta.action === 'create', message: this.$t('common.fieldRequiredError') }
          ]
        },
        access_key_secret: {
          el: {
            showPassword: true
          },
          rules: [
            { required: this.$route.meta.action === 'create', message: this.$t('common.fieldRequiredError') }
          ]
        }
      },
      updateSuccessNextRoute: { name: 'CloudCenter' },
      createSuccessNextRoute: { name: 'CloudCenter' }
    }
  },
  computed: {
    initial() {
      return this.$route.query
    }
  }
}

</script>

<style lang="less" scoped>
</style>
