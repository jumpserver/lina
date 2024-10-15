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
  name: 'LogStorageUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const storageType = this.$route.query.type || 'es'
    return {
      successUrl: { name: 'Storage', params: { activeMenu: 'LogStorage' }},
      initial: {
        type: storageType,
        meta: {
          INDEX_BY_DATE: false,
          IGNORE_VERIFY_CERTS: false
        }
      },
      fields: [
        [this.$t('Basic'), ['name', 'type', 'meta']],
        [this.$t('Other'), ['comment']]
      ],
      fieldsMeta: {
        type: typeField,
        meta: {
          fields: ['HOSTS', 'INDEX_BY_DATE', 'INDEX', 'IGNORE_VERIFY_CERTS', 'LOG_TYPES'],
          fieldsMeta: {
            HOSTS: hostsField,
            INDEX: indexField
          }
        },
        comment: commentField
      },
      url: '/api/v1/audits/log-storages/',
      getUrl() {
        return GetUrl(this.url, this.$route.params.id, storageType)
      },
      hasDetailInMsg: false,
      cleanFormValue(value) {
        return cleanForm(value)
      }
    }
  }
}
</script>
