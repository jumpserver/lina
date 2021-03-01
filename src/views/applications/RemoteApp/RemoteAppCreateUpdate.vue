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
    console.log(fieldsMap)

    return {
      initial: {
        type: appTypeMeta.name,
        path: pathInitial
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'type']],
        [appTypeMeta.title, ['attrs']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        type: {
          readonly: true
        },
        attrs: {
          fields: fieldsMap,
          fieldsMeta: {
            asset: {
              rules: [{ required: true }],
              el: {
                multiple: false,
                ajax: {
                  url: '/api/v1/assets/assets/?platform__base=Windows',
                  transformOption: (item) => {
                    return { label: item.hostname, value: item.id }
                  }
                }
              }
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
      performSubmit(validValues) {
        this.$log.debug('Validated data: ', validValues)
        const params = this.$route.params
        const baseUrl = `/api/v1/applications/applications/`
        const url = (params.id) ? `${baseUrl}${params.id}/` : baseUrl
        const method = this.getMethod()
        validValues.category = 'remote_app'
        return this.$axios[method](`${url}?type=${validValues.type}`, validValues)
      }
    }
  },
  computed: {
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

<style lang="less" scoped>
</style>
