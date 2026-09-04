<template>
  <div class="application-credential-detail">
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('Basic')" name="basic">
        <AccountRotationInfo :object="object" @edit="$emit('edit', object)" @updated="updated" />
      </el-tab-pane>
      <el-tab-pane
        v-if="$hasPerm('accounts.view_clientaccessconfiguration')"
        :label="$t('AuthorizedAccess')"
        name="access"
      >
        <ListTable
          :key="object.id"
          ref="accessTable"
          :header-actions="readOnlyHeaderActions"
          :table-config="accessTableConfig"
        />
      </el-tab-pane>
      <el-tab-pane v-if="object.type === 'rotation'" :label="$t('RotationRecords')" name="history">
        <ListTable
          :key="object.id"
          ref="historyTable"
          :header-actions="readOnlyHeaderActions"
          :table-config="historyTableConfig"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="jsx">
import { ListTable } from '@/components'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import {
  accessConfigurationUrl,
  rotationRecordUrl,
  choiceValue,
  requestAccessConfigurationTable
} from '@/api/applicationCredential'
import AccountRotationInfo from './AccountRotationInfo.vue'

export default {
  name: 'ApplicationCredentialDetail',
  components: { AccountRotationInfo, ListTable },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'updated'],
  data() {
    return {
      activeTab: 'basic',
      readOnlyHeaderActions: {
        hasLeftActions: false,
        hasImport: false,
        hasExport: false,
        searchConfig: { getUrlQuery: false }
      },
      accessTableConfig: {
        name: 'ApplicationCredentialAccess',
        url: accessConfigurationUrl,
        extraQuery: { credentials: this.object.id },
        request: requestAccessConfigurationTable,
        hasSelection: false,
        hasPagination: true,
        columnsMeta: { actions: { has: false } },
        columns: [
          { prop: 'application_name', label: this.$t('Applications'), minWidth: '160px' },
          { prop: 'name', label: this.$t('ClientAccessConfiguration'), minWidth: '180px' },
          {
            prop: 'type',
            label: this.$t('ClientType'),
            width: '110px',
            formatter: (row) => (
              <el-tag effect="plain" type={row.type === 'sdk' ? 'primary' : 'success'}>
                {row.type === 'sdk' ? this.$t('SDKAccess') : this.$t('AgentAccess')}
              </el-tag>
            )
          },
          {
            prop: 'status',
            label: this.$t('ClientStatus'),
            width: '110px',
            formatter: (row) => (
              <el-tag type={row.status === 'online' ? 'success' : 'info'}>
                {row.status === 'disabled'
                  ? this.$t('Disabled')
                  : row.status === 'online'
                    ? this.$t('Online')
                    : this.$t('Offline')}
              </el-tag>
            )
          },
          {
            prop: 'last_reported',
            label: this.$t('LastReportedAt'),
            width: '175px',
            formatter: (row) => this.formatDate(row.last_reported)
          }
        ]
      },
      historyTableConfig: {
        url: rotationRecordUrl,
        extraQuery: { credential: this.object.id },
        hasSelection: false,
        hasPagination: true,
        columnsMeta: { actions: { has: false } },
        columns: [
          { prop: 'created_by', label: this.$t('Operator'), minWidth: '140px' },
          {
            prop: 'date_created',
            label: this.$t('Date'),
            width: '175px',
            formatter: (row) => this.formatDate(row.date_created)
          },
          {
            prop: 'status',
            label: this.$t('Result'),
            width: '110px',
            formatter: (row) => (
              <el-tag type={choiceValue(row.status) === 'success' ? 'success' : 'info'}>
                {this.$t(
                  { running: 'Running', success: 'Success', failed: 'Failed', cancelled: 'Cancel' }[
                    choiceValue(row.status)
                  ]
                )}
              </el-tag>
            )
          },
          { prop: 'comment', label: this.$t('Detail'), minWidth: '260px' }
        ]
      }
    }
  },
  watch: {
    'object.id': {
      immediate: true,
      handler() {
        this.loadRelatedData()
      }
    }
  },
  methods: {
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '-'
    },
    async loadRelatedData() {
      if (!this.object.id) return
      this.accessTableConfig.extraQuery = { credentials: this.object.id }
      this.historyTableConfig.extraQuery = { credential: this.object.id }
      await this.$nextTick()
      this.$refs.accessTable?.reloadTable()
      this.$refs.historyTable?.reloadTable()
    },
    updated(value) {
      this.$emit('updated', value)
      this.$refs.historyTable?.reloadTable()
    }
  }
}
</script>

<style lang="scss" scoped>
.application-credential-detail {
  min-height: 100%;
  padding: 0 20px 20px;
}
</style>
