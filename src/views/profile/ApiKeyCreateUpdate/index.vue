<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'

export default {
  name: 'ApiKeyCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        rules: {
          ip_group: ['*']
        }
      },
      url: '/api/v1/authentication/access-keys/',
      hasDetailInMsg: false,
      fields: [
        'id',
        'ip_group',
        'is_active'
      ],
      fieldsMeta: {
        id: {
          el: {
            disabled: true,
            type: 'string'
          }
        },
        rules: {
          fields: [
            'ip_group'
          ],
          fieldsMeta: {
            ip_group: {
              label: this.$t('profile.AccessIP'),
              helpText: this.$t('acl.ipGroupHelpText')
            }
          }
        }
      },
      getUrl() {
        const query = this.$route.query
        const params = this.$route.params
        let url = `/api/v1/authentication/access-keys/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        if (query.user) {
          url = `${url}?user=${query.user}`
        }
        return url
      },
      cleanFormValue(value) {
        if (!Array.isArray(value.ip_group)) {
          value.ip_group = value.ip_group ? value.ip_group.split(',') : []
        }
        return value
      },
      updateSuccessNextRoute: {
        name: 'ApiKey'
      }
    }
  },
  mounted() {
  },
  methods: {}
}
</script>

<style>

</style>
