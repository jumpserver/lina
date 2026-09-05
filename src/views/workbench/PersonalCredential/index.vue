<template>
  <GenericListPage
    :create-drawer="createDrawer"
    :header-actions="headerActions"
    :resource="$t('PersonalCredential')"
    :table-config="tableConfig"
  />
</template>

<script>
import { connectivityMeta } from '@/components/Apps/AccountListTable/const'
import { ChoicesFormatter, DateFormatter } from '@/components/Table/TableFormatters'
import { GenericListPage } from '@/layout/components'
import { addBasePath } from '@/utils/common/index'
import { openTaskPage } from '@/utils/jms/index'

const personalCredentialUrl = '/api/v1/accounts/personal-asset-credentials/'

export default {
  name: 'PersonalCredentialList',
  components: {
    GenericListPage
  },
  data() {
    return {
      createDrawer: () => import('./CreateUpdate.vue'),
      testingCredentialIds: {},
      tableConfig: {
        url: personalCredentialUrl,
        hasSelection: true,
        columns: [
          'asset',
          'username',
          'secret_type',
          'protocol',
          'connectivity',
          'comment',
          'has_secret',
          'is_active',
          'version',
          'date_created',
          'date_updated',
          'actions'
        ],
        columnsShow: {
          min: ['asset', 'username', 'actions'],
          default: [
            'asset',
            'username',
            'secret_type',
            'protocol',
            'connectivity',
            'has_secret',
            'is_active',
            'date_updated',
            'actions'
          ]
        },
        columnsMeta: {
          asset: {
            label: this.$t('Asset'),
            formatter: (row) => {
              if (!row.asset) {
                return '-'
              }
              return row.asset.address ? `${row.asset.name} (${row.asset.address})` : row.asset.name
            }
          },
          username: {
            label: this.$t('Username')
          },
          secret_type: {
            label: this.$t('SecretType'),
            formatter: ChoicesFormatter
          },
          protocol: {
            label: this.$t('Protocol'),
            formatter: ChoicesFormatter
          },
          connectivity: {
            ...connectivityMeta,
            label: this.$t('Status')
          },
          comment: {
            label: this.$t('Comment')
          },
          has_secret: {
            label: this.$t('HasSecret'),
            formatter: ChoicesFormatter
          },
          is_active: {
            label: this.$t('IsActive'),
            formatter: ChoicesFormatter
          },
          version: {
            label: this.$t('Version')
          },
          date_created: {
            label: this.$t('DateCreated'),
            formatter: DateFormatter
          },
          date_updated: {
            label: this.$t('DateUpdated'),
            formatter: DateFormatter
          },
          actions: {
            width: '120px',
            formatterArgs: {
              hasClone: false,
              canUpdate: true,
              canDelete: true,
              performDelete: ({ row }) => {
                return this.$axios.delete(`${personalCredentialUrl}${row.id}/`)
              },
              extraActions: [
                {
                  name: 'test',
                  title: this.$t('TestConnection'),
                  icon: 'fa-solid fa-plug',
                  type: 'primary',
                  order: 5,
                  can: ({ row }) => this.canTestCredential(row),
                  callback: ({ row }) => this.testCredential(row)
                },
                {
                  name: 'connect',
                  title: this.$t('Connect'),
                  icon: 'fa-desktop',
                  type: 'primary',
                  order: 6,
                  can: ({ row }) => Boolean(row.asset?.id),
                  callback: ({ row }) => this.connectAsset(row.asset)
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasCreate: true,
        canCreate: true,
        hasBulkDelete: true,
        hasExport: false,
        hasImport: false,
        hasMoreActions: true
      }
    }
  },
  computed: {
    currentOrgId() {
      return this.$store.getters.currentOrg?.id || ''
    }
  },
  methods: {
    canTestCredential(credential) {
      return (
        credential.is_active && credential.has_secret && !this.testingCredentialIds[credential.id]
      )
    },
    async testCredential(credential) {
      if (!this.canTestCredential(credential)) {
        return
      }
      const id = credential.id
      this.testingCredentialIds = { ...this.testingCredentialIds, [id]: true }
      try {
        const res = await this.$axios.post(`${personalCredentialUrl}${id}/test/`)
        openTaskPage(res.task)
      } finally {
        const testingCredentialIds = { ...this.testingCredentialIds }
        delete testingCredentialIds[id]
        this.testingCredentialIds = testingCredentialIds
      }
    },
    connectAsset(asset) {
      if (!asset?.id) {
        return
      }
      const oid = this.currentOrgId
      const url = `/luna/?login_to=${asset.id}${oid ? `&oid=${oid}` : ''}`
      window.open(addBasePath(url), '_blank')
    }
  }
}
</script>
