<template>
  <GenericCreateUpdatePage
    :create-success-next-route="successUrl"
    :update-success-next-route="successUrl"
    v-bind="$data"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage/index.vue'
import { GetUrl, cleanForm } from './utils.js'
import { typeField, hostsField, indexField, commentField } from './const.js'

export default {
  name: 'CommandStorageUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const commandType = this.$route.query.type || 'es'
    return {
      successUrl: { name: 'Storage', params: { activeMenu: 'CommandStorage' }},
      initial: {
        type: commandType,
        doc_type: 'command',
        is_default: false,
        meta: {
          INDEX_BY_DATE: false,
          IGNORE_VERIFY_CERTS: false
        }
      },
      fields: [
        [this.$t('Basic'), ['name', 'type', 'meta']],
        [this.$t('Other'), ['is_default', 'comment']]
      ],
      fieldsMeta: {
        type: typeField,
        meta: {
          fields: ['HOSTS', 'INDEX_BY_DATE', 'INDEX', 'IGNORE_VERIFY_CERTS'],
          fieldsMeta: {
            HOSTS: hostsField,
            INDEX: indexField
          }
        },
        comment: commentField
      },
      url: '/api/v1/terminal/command-storages/',
      getUrl() {
        return GetUrl(this.url, this.$route.params.id, commandType)
      },
      hasDetailInMsg: false,
      cleanFormValue(value) {
        return cleanForm(value)
      }
    }
  }
}
</script>
