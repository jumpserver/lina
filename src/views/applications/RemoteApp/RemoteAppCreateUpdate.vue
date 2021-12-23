<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { REMOTE_APP_TYPE_FIELDS_MAP, REMOTE_APP_TYPE_META_MAP, REMOTE_APP_PATH_DEFAULT_MAP } from './const'
import rules from '@/components/DataForm/rules'
import { UpdateToken } from '@/components/FormFields'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const appType = this.$route.query.type || 'chrome'
    const fieldsMap = REMOTE_APP_TYPE_FIELDS_MAP[appType]
    const appTypeMeta = REMOTE_APP_TYPE_META_MAP[appType]
    const pathInitial = REMOTE_APP_PATH_DEFAULT_MAP[appType]

    return {
      initial: {
        type: appTypeMeta.name,
        attrs: {
          path: pathInitial
        }
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'type']],
        [appTypeMeta.title, ['attrs']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        type: {
          type: 'select',
          options: [{
            label: appTypeMeta.title,
            value: appType
          }],
          disabled: true
        },
        attrs: {
          fields: fieldsMap,
          fieldsMeta: {
            asset: {
              rules: [rules.Required],
              el: {
                multiple: false,
                ajax: {
                  url: '/api/v1/assets/assets/?platform__base=Windows',
                  transformOption: (item) => {
                    return { label: item.hostname, value: item.id }
                  }
                }
              }
            },
            [`${appType === 'vmware_client' ? 'vmware' : appType}_password`]: {
              component: UpdateToken
            }
          }
        }
      },
      url: '/api/v1/applications/applications/',
      getUrl() {
        const params = this.$route.params
        let url = `/api/v1/applications/applications/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return `${url}?type=${this.$route.query.type}`
      },
      cleanFormValue(value) {
        value.category = 'remote_app'
        return value
      }
    }
  },
  computed: {
  }
}

</script>

<style lang="less" scoped>
</style>
