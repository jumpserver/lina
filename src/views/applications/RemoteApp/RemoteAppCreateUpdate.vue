<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { REMOTE_APP_TYPE_FIELDS_MAP, REMOTE_APP_TYPE_META_MAP, REMOTE_APP_PATH_DEFAULT_MAP } from './const'

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
        path: pathInitial
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'asset', 'type', 'path']],
        [appTypeMeta.title, ['params']],
        [this.$t('common.Other'), ['comment']]
      ],
      url: '/api/v1/applications/remote-apps/',
      fieldsMeta: {
        asset: {
          rules: [{ required: false }],
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
