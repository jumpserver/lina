<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :create-success-next-route="successUrl"
    :update-success-next-route="successUrl"
    :has-detail-in-msg="false"
    :perform-submit="performSubmit"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { STORAGE_TYPE_META_MAP } from './const'

export default {
  name: 'ReplayStorageUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const storageType = this.$route.query.type || 's3'
    const storageTypeMeta = STORAGE_TYPE_META_MAP[storageType]
    return {
      successUrl: { name: 'Storage', params: { activeMenu: 'RelayStorage' }},
      url: `/api/v1/terminal/replay-storages/`,
      initial: {
        type: storageType,
        endpoint_suffix: 'core.chinacloudapi.cn',
        protocol: 'http'
      },
      getUrl() {
        const params = this.$route.params
        let url = `/api/v1/terminal/replay-storages/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return `${url}?type=${storageType}`
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'type']],
        [storageTypeMeta.title, storageTypeMeta.meta],
        [this.$t('common.Other'), ['comment']]
      ],
      afterGetFormValue(object) {
        const _object = {}
        Object.keys(object).forEach((key) => {
          // https://stackoverflow.com/questions/26222604/why-is-array-instanceof-object
          if (object[key] instanceof Object && !(object[key] instanceof Array)) {
            Object.keys(object[key]).forEach(innerKey => {
              _object[innerKey] = object[key][innerKey]
            })
          } else {
            _object[key] = object[key]
          }
        })
        return _object
      },
      fieldsMeta: {
        type: {
          disabled: true
        }
      }
    }
  },
  computed: {

  },
  mounted() {

  },
  methods: {
    performSubmit(validValues) {
      const method = this.getMethod()
      const storageType = this.$route.query.type || 's3'
      switch (storageType) {
        case 'swift':
          validValues.meta = {
            BUCKET: validValues.BUCKET,
            ACCESS_KEY: validValues.ACCESS_KEY,
            SECRET_KEY: validValues.SECRET_KEY,
            REGION: validValues.REGION,
            ENDPOINT: validValues.ENDPOINT,
            PROTOCOL: validValues.PROTOCOL
          }
          break
        case 'azure':
          validValues.meta = {
            CONTAINER_NAME: validValues.CONTAINER_NAME,
            ACCOUNT_NAME: validValues.ACCOUNT_NAME,
            ACCOUNT_KEY: validValues.ACCOUNT_KEY,
            ENDPOINT_SUFFIX: validValues.ENDPOINT_SUFFIX
          }
          break
        default:
          validValues.meta = {
            BUCKET: validValues.BUCKET,
            ACCESS_KEY: validValues.ACCESS_KEY,
            ENDPOINT: validValues.ENDPOINT,
            SECRET_KEY: validValues.SECRET_KEY
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
