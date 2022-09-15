<template>
  <GenericCreateUpdatePage :initial="initial" v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { getDatabaseTypeFieldsMap } from '@/views/applications/DatabaseApp/const'
import { UploadKey } from '@/components'
import { Required } from '@/components/DataForm/rules'

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
            port: {
              rules: [Required]
            },
            use_ssl: {
              label: this.$t('common.UseSSL'),
              component: 'el-switch'
            },
            allow_invalid_cert: {
              label: this.$t('common.AllowInvalidCert'),
              hidden: (form) => { return !form.use_ssl }
            },
            ca_cert: {
              label: this.$t('common.CACertificate'),
              hidden: (form) => { return !form.use_ssl },
              component: UploadKey
            },
            client_cert: {
              label: this.$t('common.ClientCertificate'),
              hidden: (form) => { return !form.use_ssl },
              component: UploadKey
            },
            cert_key: {
              label: this.$t('common.CertificateKey'),
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
