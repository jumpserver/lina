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
          '', [
            'name', 'provider', 'attrs', 'access_key_id', 'access_key_secret', 'comment'
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
      createSuccessNextRoute: { name: 'CloudCenter' },
      getUrl() {
        const params = this.$route.params
        let url = `/api/v1/xpack/cloud/accounts/`
        const method = this.getMethod()
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return method === 'post' ? `${url}?provider=${this.$route.query.provider}` : `${url}?provider=azure`
      }
    }
  },
  computed: {
    initial() {
      return this.$route.query
    }
  },
  methods: {
    getMethod() {
      const params = this.$route.params
      if (params.id) {
        return 'put'
      } else {
        return 'post'
      }
    }
  }
}

</script>

<style lang="less" scoped>
</style>
