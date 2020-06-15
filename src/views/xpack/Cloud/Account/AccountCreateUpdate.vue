<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      fields: [
        [
          this.$t('common.BasicInfo'), [
            'name', 'provider', 'access_key_id', 'access_key_secret', 'comment'
          ]
        ]
      ],
      url: '/api/v1/xpack/cloud/accounts/',
      fieldsMeta: {
        access_key_id: {
          rules: [
            { required: this.$route.meta.action === 'create', message: this.$t('common.fieldRequiredError') }
          ]
        },
        access_key_secret: {
          rules: [
            { required: this.$route.meta.action === 'create', message: this.$t('common.fieldRequiredError') }
          ]
        }
      },
      updateSuccessNextRoute: { name: 'CloudCenter' },
      createSuccessNextRoute: { name: 'CloudCenter' }
    }
  }
}

</script>

<style lang="less" scoped>
</style>
