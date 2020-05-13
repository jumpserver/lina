<template>
  <GenericCreateUpdatePage v-bind="$data" :clean-form-value="cleanFormValue" />
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
      specific_fields: specific_fields,
      fields: [
        [this.$t('route.RemoteApp'), ['name', 'asset', 'type', 'path', 'comment']],
        [this.$t('applications.' + app_type), [...specific_fields]]
      ],
      url: '/api/v1/applications/remote-apps/',
      fieldsMeta: {
        asset: {
          el: {
            multiple: false,
            value: [],
            ajax: {
              url: '/api/v1/assets/assets/?platform__base=Windows',
              processResults(data) {
                const results = data.results.map((item) => {
                  return { label: item.hostname, value: item.id }
                })
                const more = !!data.next
                return { results: results, pagination: more, total: data.count }
              }
            }
          }
        },
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
  },
  methods: {
    cleanFormValue(data) {
      const params = {}
      for (const field of this.specific_fields) {
        params[field] = data[field]
        delete data[field]
      }
      data.params = params

      return data
    }
  }
}

</script>

<style lang="less" scoped>
</style>
