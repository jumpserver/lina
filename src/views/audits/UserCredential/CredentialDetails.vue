<template>
  <ListTable
    v-if="!isPrivateToken"
    ref="table"
    :table-config="tableConfig"
    :header-actions="{ has: false }"
    :table-metadata-provider="getMetadata"
  />
  <el-alert
    v-else-if="privateError"
    :title="$t('UserCredentialLoadFailed')"
    type="error"
    :closable="false"
  >
    <el-button link type="primary" :disabled="loading" @click="reload">
      {{ $t('Retry') }}
    </el-button>
  </el-alert>
  <DetailCard
    v-else
    v-loading="loading"
    class="compact-loading"
    :aria-busy="loading"
    :items="privateItems"
    title=""
  />
</template>

<script>
import { markRaw } from 'vue'
import ListTable from '@/components/Table/ListTable'
import ChoicesFormatter from '@/components/Table/TableFormatters/ChoicesFormatter.vue'
import DateFormatter from '@/components/Table/TableFormatters/DateFormatter.vue'
import DetailCard from '@/components/Cards/DetailCard'
import { toSafeLocalDateStr } from '@/composables/useDateTime'

export default {
  name: 'CredentialDetails',
  components: { ListTable, DetailCard },
  props: {
    user: { type: Object, required: true },
    credentialType: { type: String, required: true },
    orgId: { type: String, required: true }
  },
  data() {
    return {
      loading: true,
      privateRecord: null,
      privateError: false,
      controller: null
    }
  },
  computed: {
    isPrivateToken() {
      return this.credentialType === 'private_token'
    },
    url() {
      return `/api/v1/audits/user-credentials/${this.user.id}/${this.credentialType}/`
    },
    privateItems() {
      const record = this.privateRecord
      const presence = record?.exists ? 'UserCredentialPresent' : 'UserCredentialAbsent'
      return [
        {
          key: this.$t('UserCredentialExists'),
          value: this.loading && !record ? '—' : this.$t(presence)
        },
        { key: this.$t('DateCreated'), value: this.formatDate(record?.date_created) },
        { key: this.$t('UserCredentialLastUsed'), value: record ? this.lastUsed(record) : '—' }
      ]
    },
    tableConfig() {
      const columns = ['identifier', 'is_active', 'date_created', 'date_last_used']
      if (this.credentialType === 'passkeys') columns.push('platform')
      return {
        url: this.url,
        permissions: { app: 'rbac', resource: 'usercredential' },
        hasSelection: false,
        hasColumnPinning: false,
        columnOrder: 'configured',
        columns,
        columnsShow: { min: columns },
        columnsMeta: {
          actions: { has: false },
          identifier: {
            label: this.$t('UserCredentialNameOrIdentifier'),
            minWidth: '180px',
            formatter: (row) => (row.name ? `${row.name} (${row.identifier})` : row.identifier)
          },
          is_active: {
            label: this.$t('UserCredentialEnabledStatus'),
            width: '100px',
            formatter: markRaw(ChoicesFormatter),
            formatterArgs: {
              getText: ({ cellValue }) => this.$t(cellValue ? 'UserCredentialEnabled' : 'Disabled')
            }
          },
          date_created: {
            label: this.$t('DateCreated'),
            minWidth: '162px',
            formatter: markRaw(DateFormatter)
          },
          date_last_used: {
            label: this.$t('UserCredentialLastUsed'),
            minWidth: '162px',
            formatter: this.lastUsed
          },
          platform: { label: this.$t('Platform'), minWidth: '96px' }
        },
        request: this.requestDetails,
        paginationSize: 15,
        savePageSize: false,
        loadErrorMessage: this.$t('UserCredentialLoadFailed'),
        tableAttrs: { emptyText: this.$t('UserCredentialNoDetails') },
        axiosConfig: { raw: 1, headers: { 'X-JMS-ORG': this.orgId }, disableFlashErrorMsg: true }
      }
    }
  },
  mounted() {
    if (this.isPrivateToken) this.loadPrivateToken()
  },
  beforeUnmount() {
    this.controller?.abort()
  },
  methods: {
    getMetadata() {
      return Promise.resolve({ actions: { GET: {} } })
    },
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '—'
    },
    lastUsed(row) {
      return row.date_last_used
        ? this.formatDate(row.date_last_used)
        : this.$t('UserCredentialNoUsageRecord')
    },
    async requestDetails(url, config) {
      this.loading = true
      try {
        return await this.$axios.get(url, config)
      } finally {
        if (!config.signal.aborted) this.loading = false
      }
    },
    async loadPrivateToken() {
      this.controller?.abort()
      const controller = new AbortController()
      this.controller = controller
      this.loading = true
      try {
        const result = await this.$axios.get(this.url, {
          params: { limit: 1 },
          headers: { 'X-JMS-ORG': this.orgId },
          signal: controller.signal,
          disableFlashErrorMsg: true
        })
        if (controller.signal.aborted) return
        this.privateRecord = result.results[0] ?? null
        this.privateError = false
      } catch {
        if (!controller.signal.aborted) this.privateError = true
      } finally {
        if (!controller.signal.aborted) this.loading = false
      }
    },
    reload() {
      if (this.isPrivateToken) return this.loadPrivateToken()
      this.$refs.table?.reloadTable()
    }
  }
}
</script>
