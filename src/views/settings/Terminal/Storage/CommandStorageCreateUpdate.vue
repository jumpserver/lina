<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :create-success-next-route="successUrl"
    :update-success-next-route="successUrl"
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
      successUrl: { name: 'TerminalSetting', params: { activeMenu: 'CommandStorage' }},
      initial: { type: commandType, doc_type: 'command' },
      fields: [
        [this.$t('common.Basic'), ['name', 'type', 'meta', 'is_default', 'comment']]
      ],
      fieldsMeta: {
        type: {
          type: 'select',
          disabled: true
        },
        is_default: {
          helpText: this.$t('sessions.SetToDefaultStorage')
        },
        meta: {
          fields: ['HOSTS', 'INDEX_BY_DATE', 'INDEX', 'IGNORE_VERIFY_CERTS'],
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
      url: '/api/v1/terminal/command-storages/',
      hasDetailInMsg: false,
      afterGetFormValue(validValues) {
        if (!validValues?.meta?.HOSTS) {
          return validValues
        }
        validValues.meta.HOSTS = validValues.meta.HOSTS.toString()
        return validValues
      },
      cleanFormValue(value) {
        value.meta.HOSTS = value.meta.HOSTS.split(',').map(item => (item.trim()))
        return value
      }
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
