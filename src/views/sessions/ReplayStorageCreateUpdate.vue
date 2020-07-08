<template>
  <div v-if="!loading">
    <GenericCreateUpdatePage
      :fields="fields"
      :url="url"
      :update-success-next-route="successUrl"
      :create-success-next-route="successUrl"
      :clean-form-value="cleanFormValue"
      :object="formData"
      :initial="initial"
      :fields-meta="fieldsMetas"
    />
  </div>
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { getReplayStorage } from '@/api/sessions'
export default {
  name: 'ReplayStorageUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      loading: true,
      successUrl: { name: 'Storage', params: { activeMenu: 'RelayStorage' }},
      replayData: {},
      formData: {
        type: '',
        name: '',
        comment: ''
      },
      url: '/api/v1/terminal/replay-storages/',
      fieldsMetas: {
        name: {
          label: this.$t('sessions.name')
        },
        comment: {
          label: this.$t('sessions.comment')
        },
        type: {
          label: this.$t('sessions.type'),
          disabled: true,
          rules: [
            { required: true, message: this.$t('common.fieldRequiredError') }
          ]
        },
        bucket: {
          label: this.$t('sessions.bucket')
        },
        access_key: {
          label: 'Access key'
        },
        secret_key: {
          label: 'Secret key'
        },
        endpoint: {
          label: this.$t('sessions.endPoint')
        },
        region: {
          label: this.$t('sessions.region')
        },
        protocol: {
          label: this.$t('sessions.protocol'),
          type: 'select',
          options: [
            { label: 'http', value: 'http' },
            { label: 'https', value: 'https' }
          ],
          rules: [
            { required: true, message: this.$t('common.fieldRequiredError') }
          ]
        },
        container_name: {
          label: this.$t('sessions.containerName')
        },
        account_name: {
          label: this.$t('sessions.accountName')
        },
        account_key: {
          label: this.$t('sessions.accountKey')
        },
        endpoint_suffix: {
          label: this.$t('sessions.endpointSuffix'),
          type: 'select',
          options: [
            { label: 'core.chinacloudapi.cn', value: 'core.chinacloudapi.cn' },
            { label: 'core.windows.net', value: 'core.windows.net' }
          ]
        }
      },
      fieldsMap: {
        s3: [[this.$t('common.Basic'), ['name', 'type', 'bucket', 'access_key', 'secret_key', 'endpoint', 'comment']]],
        ceph: [[this.$t('common.Basic'), ['name', 'type', 'bucket', 'access_key', 'secret_key', 'endpoint', 'comment']]],
        swift: [[this.$t('common.Basic'), ['name', 'type', 'bucket', 'access_key', 'secret_key', 'region', 'endpoint', 'protocol', 'comment']]],
        oss: [[this.$t('common.Basic'), ['name', 'type', 'bucket', 'access_key', 'secret_key', 'endpoint', 'comment']]],
        azure: [[this.$t('common.Basic'), ['name', 'type', 'container_name', 'account_name', 'account_key', 'endpoint_suffix', 'comment']]]
      }
    }
  },
  computed: {
    fields() {
      return this.fieldsMap[this.currentType]
    },
    initial() {
      return {
        type: this.currentType,
        endpoint_suffix: 'core.chinacloudapi.cn',
        protocol: 'http'
      }
    },
    currentType() {
      const params = this.$route.params
      const query = this.$route.query
      if (params.id) {
        return this.formData.type
      } else if (query.type) {
        return query.type
      }
      return 's3'
    }
  },
  mounted() {
    const params = this.$route.params
    const query = this.$route.query
    if (params.id) {
      getReplayStorage(this.$route.params.id).then(data => {
        this.replayData = data
        this.formData = this.convertMataToForm(this.replayData)
        this.loading = false
      })
    }
    if (query.type) {
      this.loading = false
    }
  },
  methods: {
    convertMataToForm(replayData) {
      switch (replayData.type.toLowerCase()) {
        case 's3':
          return this.s3MetaToForm(replayData)
        case 'ceph':
          return this.cephMetaToForm(replayData)
        case 'swift':
          return this.swiftMetaToForm(replayData)
        case 'oss':
          return this.ossMetaForm(replayData)
        case 'azure':
          return this.azureMetaForm(replayData)
        default:
          return {}
      }
    },
    s3MetaToForm(replayData) {
      return {
        name: replayData.name,
        type: 's3',
        comment: replayData.comment,
        bucket: replayData.meta.BUCKET,
        endpoint: replayData.meta.ENDPOINT
      }
    },
    cephMetaToForm(replayData) {
      return {
        name: replayData.name,
        type: 'ceph',
        comment: replayData.comment,
        bucket: replayData.meta.BUCKET,
        endpoint: replayData.meta.ENDPOINT
      }
    },
    swiftMetaToForm(replayData) {
      return {
        name: replayData.name,
        type: 'swift',
        comment: replayData.comment,
        bucket: replayData.meta.BUCKET,
        region: replayData.meta.REGION,
        endpoint: replayData.meta.ENDPOINT,
        protocol: replayData.meta.PROTOCOL
      }
    },
    ossMetaForm(replayData) {
      return {
        name: replayData.name,
        type: 'oss',
        comment: replayData.comment,
        bucket: replayData.meta.BUCKET,
        endpoint: replayData.meta.ENDPOINT
      }
    },
    azureMetaForm(replayData) {
      return {
        name: replayData.name,
        type: 'azure',
        comment: replayData.comment,
        container_name: replayData.meta.CONTAINER_NAME,
        account_name: replayData.meta.ACCOUNT_NAME,
        endpoint_suffix: replayData.meta.ENDPOINT_SUFFIX
      }
    },
    cleanFormValue(value) {
      switch (value.type.toLowerCase()) {
        case 's3':
          return this.createS3Meta(value)
        case 'ceph':
          return this.createCephMeta(value)
        case 'swift':
          return this.createSwiftMeta(value)
        case 'oss':
          return this.createOSSMeta(value)
        case 'azure':
          return this.createAzureMeta(value)
      }
      return value
    },
    createS3Meta(value) {
      return {
        name: value.name,
        type: 's3',
        comment: value.comment,
        meta: {
          s3_bucket: value.bucket,
          s3_access_key: value.access_key,
          s3_secret_key: value.secret_key,
          s3_endpoint: value.endpoint
        }
      }
    },
    createCephMeta(value) {
      return {
        name: value.name,
        type: 'ceph',
        comment: value.comment,
        meta: {
          ceph_bucket: value.bucket,
          ceph_access_key: value.access_key,
          ceph_secret_key: value.secret_key,
          ceph_endpoint: value.endpoint
        }
      }
    },
    createSwiftMeta(value) {
      return {
        name: value.name,
        type: 'swift',
        comment: value.comment,
        meta: {
          swift_bucket: value.bucket,
          swift_access_key: value.access_key,
          swift_secret_key: value.secret_key,
          swift_region: value.region,
          swift_endpoint: value.endpoint,
          swift_protocol: value.protocol
        }
      }
    },
    createOSSMeta(value) {
      return {
        name: value.name,
        type: 'oss',
        comment: value.comment,
        meta: {
          oss_bucket: value.bucket,
          oss_access_key: value.access_key,
          oss_secret_key: value.secret_key,
          oss_endpoint: value.endpoint
        }
      }
    },
    createAzureMeta(value) {
      return {
        name: value.name,
        type: 'azure',
        comment: value.comment,
        meta: {
          azure_container_name: value.container_name,
          azure_account_name: value.account_name,
          azure_account_key: value.account_key,
          azure_endpoint_suffix: value.endpoint_suffix
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
