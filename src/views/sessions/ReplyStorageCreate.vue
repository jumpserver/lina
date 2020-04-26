<template>
  <GenericCreateUpdatePage :create-success-next-route="createSuccessUrl" :clean-form-value="cleanFormValue" :fields="selectFields" :initial="selectInitial" :fields-meta="selectFieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
export default {
  name: 'ReplyStorageCreate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      createSuccessUrl: { name: 'Storage' },
      s3: {
        initial: {
          type: 's3'
        },
        fields: [
          ['', ['name', 'type', 'bucket', 'access_key', 'secret_key', 'endpoint', 'comment']]
        ],
        fieldsMeta: {
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
              { required: true }
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
          }
        }
      },
      ceph: {
        initial: {
          type: 'ceph'
        },
        fields: [
          ['', ['name', 'type', 'bucket', 'access_key', 'secret_key', 'endpoint', 'comment']]
        ],
        fieldsMeta: {
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
              { required: true }
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
          }
        }
      },
      swift: {
        initial: {
          type: 'swift',
          protocol: 'http'
        },
        fields: [
          ['', ['name', 'type', 'bucket', 'access_key', 'secret_key', 'region', 'endpoint', 'protocol', 'comment']]
        ],
        fieldsMeta: {
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
              { required: true }
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
          region: {
            label: this.$t('sessions.region')
          },
          endpoint: {
            label: this.$t('sessions.endPoint')
          },
          protocol: {
            label: this.$t('sessions.protocol'),
            type: 'select',
            options: [
              { label: 'http', value: 'http' },
              { label: 'https', value: 'https' }
            ],
            rules: [
              { required: true }
            ]
          }
        }
      },
      oss: {
        initial: {
          type: 'oss'
        },
        fields: [
          ['', ['name', 'type', 'bucket', 'access_key', 'secret_key', 'endpoint', 'comment']]
        ],
        fieldsMeta: {
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
              { required: true }
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
          }
        }
      },
      azure: {
        initial: {
          type: 'azure',
          endpoint_suffix: 'core.chinacloudapi.cn'
        },
        fields: [
          [this.$t('sessions.createReplyStorage'),
            ['name', 'type', 'container_name', 'account_name', 'account_key', 'endpoint_suffix', 'comment']]
        ],
        fieldsMeta: {
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
              { required: true }
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
        }
      },
      url: '/api/v1/terminal/replay-storages/'
    }
  },
  computed: {
    postUrl() {
      return this.url
    },
    selectInitial() {
      return this.renderFieldObject.initial
    },
    selectFields() {
      return this.renderFieldObject.fields
    },
    selectFieldsMeta() {
      return this.renderFieldObject.fieldsMeta
    },
    renderFieldObject() {
      const storageType = this.$route.query.type
      if (typeof storageType !== 'string') {
        return this.s3
      }
      switch (storageType.toLowerCase()) {
        case 's3':
          return this.s3
        case 'ceph':
          return this.ceph
        case 'swift':
          return this.swift
        case 'oss':
          return this.oss
        case 'azure':
          return this.azure
        default:
          return this.s3
      }
    }
  },
  methods: {
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
