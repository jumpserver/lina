<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :create-success-next-route="successUrl"
    :update-success-next-route="successUrl"
    :has-detail-in-msg="false"
    :after-get-form-value="afterGetFormValue"
    :perform-submit="performSubmit"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { Required } from '@/components/DataForm/rules'
export default {
  name: 'CommandStorageUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const commandType = this.$route.query.type || 'es'
    return {
      successUrl: { name: 'Storage', params: { activeMenu: 'CommandStorage' }},

      initial: { type: commandType, doc_type: 'command' },
      fields: [
        [this.$t('common.Basic'), ['name', 'type', 'meta', 'comment']]
      ],
      fieldsMeta: {
        type: {
          type: 'select',
          disabled: true
        },
        meta: {
          fields: ['HOSTS', 'INDEX', 'IGNORE_VERIFY_CERTS'],
          fieldsMeta: {
            HOSTS: {
              helpText: this.$t('sessions.helpText.esUrl')
            },
            INDEX: {
              rules: [Required],
              helpText: this.$t('sessions.helpText.esIndex')
            }
          }
        }
      },
      getUrl() {
        const params = this.$route.params
        let url = `/api/v1/terminal/command-storages/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return `${url}?type=${commandType}`
      },
      url: '/api/v1/terminal/command-storages/'
    }
  },
  computed: {
  },
  methods: {
    afterGetFormValue(validValues) {
      if (!validValues?.meta?.HOSTS) {
        return validValues
      }
      validValues.meta.HOSTS = validValues.meta.HOSTS.toString()
      return validValues
    },
    performSubmit(formValues) {
      const validValues = _.cloneDeep(formValues)
      const method = this.getMethod()
      validValues.meta.HOSTS = validValues.meta.HOSTS.split(',').map(item => (item.trim()))
      const url = this.getUrl()
      return this.$axios[method](url, validValues)
    },
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

<style scoped>

</style>
