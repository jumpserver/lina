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
    const app_type = this.$route.query.type

    const fields_map = REMOTE_APP_TYPE_FIELDS_MAP[app_type]
    const specific_fields = Object.keys(fields_map)

    const app_type_meta = REMOTE_APP_TYPE_META_MAP[app_type]

    return {
      fields: [
        [this.$t('route.RemoteApp'), ['name', 'asset', 'type', 'path', 'comment']],
        [this.$t('applications.' + app_type), [...specific_fields]]
      ],
      url: '/api/v1/applications/remote-apps/',
      fieldsMeta: {
        type: {
          type: 'select',
          options: [
            {
              label: app_type_meta.title,
              value: app_type_meta.value
            }
          ],
          disabled: true
        },
        ...fields_map
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
