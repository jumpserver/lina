<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :create-success-next-route="successUrl"
    :update-success-next-route="successUrl"
    :has-detail-in-msg="false"
    :clean-form-value="cleanFormValue"
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
      fields: [[this.$t('common.Basic'), ['name', 'type', 'HOSTS', 'INDEX', 'comment']]],
      fieldsMeta: {
        type: {
          type: 'select',
          disabled: true
        },
        HOSTS: {
          helpText: this.$t('sessions.helpText.esUrl')
        },
        INDEX: {
          rules: [Required],
          helpText: this.$t('sessions.helpText.esIndex')
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
    cleanFormValue(value) {
      console.log(value)
      return value
    },
    performSubmit(validValues) {
      const method = this.getMethod()
      const commandType = this.$route.query.type || 'es'
      switch (commandType) {
        case 'es':
          validValues.meta = {
            HOSTS: validValues.HOSTS.split(',').map(item => (item.trim())),
            INDEX: validValues.INDEX
          }
          break
        default:
          validValues.meta = {
            HOSTS: validValues.HOSTS.split(',').map(item => (item.trim())),
            INDEX: validValues.INDEX
          }
          break
      }
      return this.$axios[method](`${this.getUrl()}`, validValues)
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
