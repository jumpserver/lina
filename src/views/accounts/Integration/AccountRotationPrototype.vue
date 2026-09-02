<template>
  <GenericListTable
    ref="listTable"
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :get-drawer-title="getDrawerTitle"
    :header-actions="headerActions"
    :quick-filters="quickFilters"
    :resource="$t('AccountRotation')"
    :table-config="tableConfig"
    :update-drawer="updateDrawer"
  />
</template>

<script lang="jsx">
import {
  ActionsFormatter,
  DetailFormatter,
  TagChoicesFormatter
} from '@/components/Table/TableFormatters'
import { GenericListTable } from '@/layout/components'

const statusTypes = {
  idle: 'info',
  waiting_backup: 'warning',
  ready_for_change: 'success',
  waiting_primary: 'primary'
}

const valueOf = (value) => value?.value ?? value
const accountName = (value) => value?.username || value?.name || '-'

export default {
  name: 'AccountRotationPrototype',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      createDrawer: () => import('./AccountRotationCreateUpdate.vue'),
      updateDrawer: () => import('./AccountRotationCreateUpdate.vue'),
      detailDrawer: () => import('./AccountRotationDetail/index.vue'),
      getDrawerTitle: () => this.$t('AccountRotation'),
      quickFilters: [
        {
          label: this.$t('RotationStatus'),
          options: [
            { label: this.$t('RotationNormal'), filter: { status: 'idle' } },
            {
              label: this.$t('WaitingForApplications'),
              filter: { status: 'waiting_backup' }
            },
            {
              label: this.$t('ReadyForSecretChange'),
              filter: { status: 'ready_for_change' }
            },
            { label: this.$t('SwitchingBack'), filter: { status: 'waiting_primary' } }
          ]
        }
      ],
      tableConfig: {
        url: '/api/v1/accounts/credential-policies/',
        permissions: {
          app: 'accounts',
          resource: 'credentialpolicy'
        },
        columnsExclude: [
          'blockers',
          'comment',
          'created_by',
          'date_created',
          'date_rotation_started',
          'date_updated',
          'is_active',
          'primary_version_at_start',
          'published_account',
          'revision',
          'rotation_cancelled'
        ],
        columnsShow: {
          min: ['name', 'asset', 'status', 'actions'],
          default: [
            'name',
            'asset',
            'primary_account',
            'backup_account',
            'applications_amount',
            'status',
            'date_last_rotated',
            'actions'
          ]
        },
        columnsMeta: {
          name: {
            label: this.$t('RotationPurpose'),
            minWidth: '180px',
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              getRoute: ({ row }) => ({
                name: 'CredentialPolicyDetail',
                params: { id: row.id }
              })
            }
          },
          asset: {
            label: this.$t('Asset'),
            minWidth: '210px',
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: false,
              can: this.$hasPerm('assets.view_asset'),
              getTitle: ({ row }) => row.asset?.name || '-',
              getRoute: ({ row }) => ({
                name: 'AssetDetail',
                params: { id: row.asset.id }
              })
            }
          },
          primary_account: {
            label: this.$t('PrimaryAccount'),
            formatter: (row) => accountName(row.primary_account)
          },
          backup_account: {
            label: this.$t('BackupAccount'),
            formatter: (row) => accountName(row.backup_account)
          },
          applications_amount: {
            label: this.$t('AffectedApplications'),
            align: 'center',
            width: '120px',
            formatter: (row) => String(row.applications_amount ?? 0)
          },
          status: {
            label: this.$t('RotationStatus'),
            width: '150px',
            formatter: TagChoicesFormatter,
            formatterArgs: {
              getTagLabel: ({ row }) => vm.statusMeta(valueOf(row.status)).label,
              getTagType: ({ row }) => vm.statusMeta(valueOf(row.status)).type
            }
          },
          date_last_rotated: {
            label: this.$t('LastRotation'),
            width: '175px'
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: ({ row }) => valueOf(row.status) === 'idle',
              hasDelete: false,
              hasClone: false
            }
          }
        }
      },
      headerActions: {
        canCreate: () => vm.$hasPerm('accounts.add_credentialpolicy'),
        hasBulkDelete: false,
        hasExport: false,
        hasImport: false,
        hasMoreActions: false,
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  },
  methods: {
    statusMeta(status) {
      const labels = {
        idle: this.$t('RotationNormal'),
        waiting_backup: this.$t('WaitingForApplications'),
        ready_for_change: this.$t('ReadyForSecretChange'),
        waiting_primary: this.$t('SwitchingBack')
      }
      return { label: labels[status] || status, type: statusTypes[status] || 'info' }
    }
  }
}
</script>
