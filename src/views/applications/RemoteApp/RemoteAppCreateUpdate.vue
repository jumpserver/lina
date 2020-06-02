<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { REMOTE_APP_TYPE_FIELDS_MAP, REMOTE_APP_TYPE_META_MAP } from './const'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const appType = this.$route.query.type
    const fieldsMap = REMOTE_APP_TYPE_FIELDS_MAP[appType]
    const appTypeMeta = REMOTE_APP_TYPE_META_MAP[appType]

    return {
      initial: {
        type: appTypeMeta.name
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'asset', 'type', 'path']],
        [this.$t('applications.' + appType), ['params']],
        [this.$t('common.Others'), ['comment']]
      ],
      url: '/api/v1/applications/remote-apps/',
      fieldsMeta: {
        asset: {
          el: {
            multiple: false,
            value: [],
            ajax: {
              url: '/api/v1/assets/assets/?platform__base=Windows',
              transformOption: (item) => {
                return { label: item.hostname, value: item.id }
              }
            }
          }
        },
        type: {
          type: 'select',
          options: [
            {
              label: appTypeMeta.title,
              value: appTypeMeta.name
            }
          ],
          disabled: true
        },
        params: {
          type: 'group',
          items: fieldsMap
        }
      }
    }
  }
}

</script>

<style lang="less" scoped>
</style>
