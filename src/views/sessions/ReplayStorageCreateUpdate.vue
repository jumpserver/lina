<template>
  <div v-if="!loading">
    <GenericCreateUpdatePage
      :fields="fields"
      :url="url"
      :update-success-next-route="successUrl"
      :create-success-next-route="successUrl"
      :clean-form-value="cleanFormValue"
      :object="formData"
      :has-detail-in-msg="false"
      :initial="initial"
      :fields-meta="fieldsMetas"
    />
  </div>
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { getReplayStorage } from '@/api/sessions'
import { STORAGE_TYPE_META_MAP } from './const'
import { Required } from '@/components/DataForm/rules'

export default {
  name: 'ReplayStorageUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const storageType = this.$route.query.type || 's3'
    const storageTypeMeta = STORAGE_TYPE_META_MAP[storageType]
    return {
      loading: true,
      successUrl: { name: 'Storage', params: { activeMenu: 'RelayStorage' }},
      replayData: {},
      formData: {
        type: '',
        name: '',
        comment: ''
      },
      url: this.$route.params.id ? `/api/v1/terminal/replay-storages/` : `/api/v1/terminal/replay-storages/?type=${storageType}`,
      fields: [
        [this.$t('common.Basic'), ['name', 'type']],
        [storageTypeMeta.title, storageTypeMeta.meta],
        [this.$t('common.Other'), ['comment']]
      ],
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
          rules: [Required]
        },
        bucket: {
          label: this.$t('sessions.bucket')
        },
        access_key: {
          label: 'Access key',
          el: { 'show-password': true }
        },
        secret_key: {
          label: 'Secret key',
          el: { 'show-password': true }
        },
        endpoint: {
          label: this.$t('sessions.endPoint'),
          helpText: storageTypeMeta.endpointHelpText
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
          rules: [Required]
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
      }
    }
  },
  computed: {
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
      return
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
          BUCKET: value.bucket,
          ACCESS_KEY: value.access_key,
          SECRET_KEY: value.secret_key,
          ENDPOINT: value.endpoint
        }
      }
    },
    createCephMeta(value) {
      return {
        name: value.name,
        type: 'ceph',
        comment: value.comment,
        meta: {
          BUCKET: value.bucket,
          ACCESS_KEY: value.access_key,
          SECRET_KEY: value.secret_key,
          ENDPOINT: value.endpoint
        }
      }
    },
    createSwiftMeta(value) {
      return {
        name: value.name,
        type: 'swift',
        comment: value.comment,
        meta: {
          BUCKET: value.bucket,
          ACCESS_KEY: value.access_key,
          SECRET_KEY: value.secret_key,
          REGION: value.region,
          ENDPOINT: value.endpoint,
          PROTOCOL: value.protocol
        }
      }
    },
    createOSSMeta(value) {
      return {
        name: value.name,
        type: 'oss',
        comment: value.comment,
        meta: {
          BUCKET: value.bucket,
          ACCESS_KEY: value.access_key,
          SECRET_KEY: value.secret_key,
          ENDPOINT: value.endpoint
        }
      }
    },
    createAzureMeta(value) {
      return {
        name: value.name,
        type: 'azure',
        comment: value.comment,
        meta: {
          CONTAINER_NAME: value.container_name,
          ACCOUNT_NAME: value.account_name,
          ACCOUNT_KEY: value.account_key,
          ENDPOINT_SUFFIX: value.endpoint_suffix
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
