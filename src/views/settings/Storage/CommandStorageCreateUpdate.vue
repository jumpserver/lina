<template>
  <GenericCreateUpdatePage
    :create-success-next-route="successUrl"
    :update-success-next-route="successUrl"
    v-bind="$data"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage/index.vue'
import { Required, RequiredChange } from '@/components/Form/DataForm/rules'
import TagInput from '@/components/Form/FormFields/TagInput.vue'

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
        type: {
          type: 'select',
          disabled: true
        },
        meta: {
          fields: ['HOSTS', 'INDEX_BY_DATE', 'INDEX', 'IGNORE_VERIFY_CERTS'],
          fieldsMeta: {
            HOSTS: {
              component: TagInput,
              el: {
                replaceShowPassword: true,
                replaceRule: '(https?:\/\/[^:@]+:)([^@]+)(@.+)'
              },
              rules: [RequiredChange],
              helpText: this.$t('EsUrl'),
              helpTextAsPlaceholder: false
            },
            INDEX: {
              rules: [Required],
              helpText: this.$t('EsIndex')
            }
          }
        },
        comment: {
          component: 'el-input',
          el: {
            type: 'textarea'
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
        return validValues
      },
      cleanFormValue(value) {
        value.meta.INDEX = value.meta?.INDEX?.toLowerCase()
        // 解决第一次提交失败后，再次提交时，HOSTS字段为Array的问题
        if (typeof value.meta.HOSTS === 'string') {
          value.meta.HOSTS = value.meta.HOSTS.split(',').map(item => (item.trim()))
        }
        return value
      }
    }
  }
}
</script>
