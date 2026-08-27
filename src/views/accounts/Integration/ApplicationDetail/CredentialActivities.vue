<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { DateFormatter, TagChoicesFormatter } from '@/components/Table/TableFormatters'
import { GenericListTable } from '@/layout/components'

const STATUS_TYPES = {
  active: 'success',
  succeeded: 'success',
  revoking: 'warning',
  pending: 'warning',
  running: 'warning',
  cleaning: 'warning',
  revoked: 'info',
  expired: 'info',
  failed: 'danger',
  timed_out: 'danger'
}

export default {
  name: 'CredentialActivities',
  components: { GenericListTable },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    const vm = this
    return {
      headerActions: {
        hasCreate: false,
        hasLeftActions: false,
        hasMoreActions: false,
        hasImport: false,
        hasExport: false,
        hasRefresh: true,
        hasSearch: false,
        searchConfig: { getUrlQuery: false }
      },
      tableConfig: {
        url: `/api/v1/accounts/credential-activities/?application=${encodeURIComponent(
          this.object.id
        )}`,
        permissions: { app: 'accounts', resource: 'credentialpolicy' },
        columns: ['date', 'event_type', 'policy_name', 'username', 'activity_status', 'detail'],
        columnsMeta: {
          date: {
            label: this.$t('Date'),
            width: '170px',
            formatter: DateFormatter
          },
          event_type: {
            label: this.$t('CredentialActivityType'),
            width: '130px',
            formatter: (row) => vm.activityTypeLabel(row.event_type)
          },
          policy_name: {
            label: this.$t('CredentialPolicy'),
            minWidth: '180px'
          },
          username: { minWidth: '170px' },
          activity_status: {
            label: this.$t('Status'),
            width: '110px',
            formatter: TagChoicesFormatter,
            formatterArgs: {
              getTag({ cellValue }) {
                const value = cellValue?.value || cellValue
                return {
                  label: cellValue?.label || value || '-',
                  size: 'small',
                  type: STATUS_TYPES[value] || 'info'
                }
              }
            }
          },
          detail: {
            label: this.$t('Details'),
            minWidth: '220px',
            formatter: (row) => vm.activityDetail(row),
            showOverflowTooltip: true
          },
          actions: {
            has: false
          }
        }
      }
    }
  },
  methods: {
    activityTypeLabel(type) {
      const labels = {
        rotation: 'CredentialActivityRotation',
        issue: 'CredentialActivityIssue',
        renew: 'CredentialActivityRenew',
        revoke: 'CredentialActivityRevoke'
      }
      return labels[type] ? this.$t(labels[type]) : type || '-'
    },
    activityDetail(row) {
      if (row.detail) return row.detail
      if (row.event_type === 'rotation') {
        return this.$t('CredentialActivityVersion', { version: row.value })
      }
      if (row.event_type === 'renew') {
        return this.$t('CredentialActivityRenewCount', { count: row.value })
      }
      if (row.event_type === 'revoke' && row.reason) {
        const reasons = {
          admin: 'CredentialRevokeReasonAdmin',
          manual: 'CredentialRevokeReasonManual',
          expired: 'CredentialRevokeReasonExpired',
          policy_disabled: 'CredentialRevokeReasonPolicyDisabled'
        }
        return reasons[row.reason] ? this.$t(reasons[row.reason]) : row.reason
      }
      return '-'
    }
  }
}
</script>
