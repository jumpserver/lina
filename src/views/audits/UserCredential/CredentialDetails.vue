<template>
  <Page :hide-heading="true" :help-message="$t('UserCredentialReadOnlyHint')">
    <el-alert
      v-if="error"
      :title="$t('UserCredentialLoadFailed')"
      type="error"
      :closable="false"
      show-icon
    >
      <el-button @click="reload">{{ $t('Retry') }}</el-button>
    </el-alert>
    <GenericListTable
      v-show="!error"
      ref="listTable"
      :table-config="tableConfig"
      :header-actions="headerActions"
      :table-metadata-provider="getMetadata"
      @loaded="error = false"
    />
  </Page>
</template>

<script>
import { markRaw } from 'vue'
import Page from '@/layout/components/Page'
import GenericListTable from '@/layout/components/GenericListTable'
import DateFormatter from '@/components/Table/TableFormatters/DateFormatter.vue'
import ChoicesFormatter from '@/components/Table/TableFormatters/ChoicesFormatter.vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'

export default {
  name: 'CredentialDetails',
  components: { Page, GenericListTable },
  props: {
    user: { type: Object, required: true },
    credentialType: { type: String, required: true },
    orgId: { type: String, required: true }
  },
  data() {
    return {
      error: false,
      headerActions: {
        hasLeftActions: false,
        hasSearch: false,
        hasExport: false,
        hasImport: false,
        hasMoreActions: false
      }
    }
  },
  computed: {
    tableConfig() {
      const columns =
        this.credentialType === 'private_token'
          ? ['exists', 'date_created', 'date_last_used']
          : ['identifier', 'is_active', 'date_created', 'date_last_used']
      if (this.credentialType === 'passkeys') columns.push('platform')
      return {
        url: `/api/v1/audits/user-credentials/${this.user.id}/${this.credentialType}/`,
        permissions: { app: 'rbac', resource: 'usercredential' },
        hasSelection: false,
        hasColumnPinning: false,
        paginationSize: 15,
        savePageSize: false,
        columns,
        columnsMeta: {
          actions: { has: false },
          identifier: {
            label: this.$t('UserCredentialNameOrIdentifier'),
            minWidth: '220px',
            formatter: (row) => {
              const name = row.name
              return name ? `${name} (${row.identifier})` : row.identifier
            }
          },
          is_active: {
            label: this.$t('UserCredentialEnabled'),
            width: '100px',
            formatter: markRaw(ChoicesFormatter),
            formatterArgs: {
              getText: ({ cellValue }) => this.$t(cellValue ? 'UserCredentialEnabled' : 'Disabled')
            }
          },
          date_created: {
            label: this.$t('DateCreated'),
            minWidth: '165px',
            formatter: markRaw(DateFormatter)
          },
          date_last_used: {
            label: this.$t('UserCredentialLastUsed'),
            minWidth: '165px',
            formatter: (row) =>
              row.date_last_used
                ? toSafeLocalDateStr(row.date_last_used)
                : this.$t('UserCredentialNoUsageRecord')
          },
          exists: {
            label: this.$t('UserCredentialExists'),
            width: '100px',
            formatter: (row) =>
              this.$t(row.exists ? 'UserCredentialPresent' : 'UserCredentialAbsent')
          },
          platform: { label: this.$t('Platform'), minWidth: '100px' }
        },
        axiosConfig: {
          raw: 1,
          headers: { 'X-JMS-ORG': this.orgId },
          disableFlashErrorMsg: true
        },
        listeners: {
          error: () => {
            this.error = true
          }
        }
      }
    }
  },
  methods: {
    getMetadata() {
      return Promise.resolve({ actions: { GET: {} } })
    },
    reload() {
      this.error = false
      this.$refs.listTable.reloadTable()
    }
  }
}
</script>
