<template>
  <GenericCreateUpdatePage :initial="initial" v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { getDatabaseTypeFieldsMap } from '@/views/applications/DatabaseApp/const'
import { UploadKey } from '@/components'
export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const appType = this.$route.query.type || 'mysql'
    const fieldsMap = getDatabaseTypeFieldsMap(appType)
    return {
      fields: [
        [this.$t('common.Basic'), ['name', 'type', 'domain']],
        [this.$t('applications.DBInfo'), ['attrs']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        type: {
          disabled: true
        },
        domain: {
          el: {
            multiple: false,
            clearable: true,
            ajax: {
              url: '/api/v1/assets/domains/'
            }
          }
        },
        attrs: {
          fields: fieldsMap,
          fieldsMeta: {
            host: {
              type: 'input'
            },
            use_ssl: {
              component: 'el-switch'
            },
            ca_cert: {
              label: this.$t('common.Certificate'),
              hidden: (form) => { return !form.use_ssl },
              component: UploadKey
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
        value.category = 'db'
        return value
      }
    }
  },
  computed: {
    initial() {
      return this.$route.query
    }
  }
}
</script>

<style lang="less" scoped>

</style>
