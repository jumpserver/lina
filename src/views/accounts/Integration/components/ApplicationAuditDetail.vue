<template>
  <Page :title="null" class="audit-detail">
    <IBox>
      <div class="event-heading">
        <h3>{{ object.event_display }}</h3>
        <el-tag :type="resultTagTypes[object.result]">{{ object.result_display }}</el-tag>
      </div>
      <p class="event-date">{{ formatDate(object.datetime) }}</p>
      <p class="event-summary">{{ object.summary }}</p>
      <el-descriptions :column="2" :label-width="120" size="small">
        <el-descriptions-item
          v-for="item in basicItems"
          :key="item.key"
          :label="item.key"
          width="50%"
        >
          <ItemValue :value="item.value" />
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions class="trace-fields" :column="2" :label-width="120" size="small">
        <el-descriptions-item
          v-for="item in traceItems"
          :key="item.key"
          :label="item.key"
          width="50%"
        >
          <ItemValue :value="item.value" />
        </el-descriptions-item>
      </el-descriptions>
    </IBox>
    <IBox v-if="object.changes.length" :title="$t('ChangeField')">
      <DataTable :config="changeTable" />
    </IBox>
    <IBox v-if="object.notification" :title="$t('AppAuditNotificationDetail')">
      <el-descriptions :column="2" :label-width="120" size="small">
        <el-descriptions-item
          v-for="item in notificationItems"
          :key="item.key"
          :label="item.key"
          :span="item.span || 1"
          width="50%"
        >
          <ItemValue :value="item.value" />
        </el-descriptions-item>
      </el-descriptions>
      <DataTable class="delivery-attempts" :config="attemptTable" />
      <p class="receipt-help">{{ $t('AppAuditReceivedOnly') }}</p>
    </IBox>
  </Page>
</template>

<script>
import { IBox } from '@/components'
import Page from '@/layout/components/Page'
import ItemValue from '@/components/Cards/DetailCard/ItemValue.vue'
import DataTable from '@/components/Table/DataTable'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { resultTagTypes } from './applicationAudit'

export default {
  name: 'ApplicationAuditDetail',
  components: { Page, ItemValue, IBox, DataTable },
  props: { object: { type: Object, required: true } },
  data() {
    return { resultTagTypes }
  },
  methods: {
    formatDate: toSafeLocalDateStr
  },
  computed: {
    basicItems() {
      const row = this.object
      const disabled = row.event === 'client_disabled'
      const recorded = (value) => ![null, undefined, '', '-'].includes(value)
      return [
        { key: this.$t('RelevantApp'), value: row.service },
        ...(!disabled ? [{ key: this.$t('ApplicationCredential'), value: row.credential }] : []),
        {
          key: this.$t('ClientAccessConfiguration'),
          value:
            disabled && !recorded(row.configuration)
              ? this.$t('AppAuditNotRecorded')
              : row.configuration
        },
        {
          key: this.$t(disabled ? 'AppAuditDisabledInstance' : 'InstanceID'),
          value:
            disabled && !recorded(row.instance_id)
              ? this.$t('AppAuditNotRecorded')
              : row.instance_id
        },
        {
          key: this.$t(row.source === 'Administrator' ? 'Operator' : 'AppAuditCaller'),
          value: row.operator
        },
        { key: this.$t('IP'), value: row.remote_addr },
        ...(!disabled
          ? [
              { key: this.$t('CredentialKey'), value: row.credential_key },
              { key: this.$t('AppAuditRevision'), value: row.revision }
            ]
          : [])
      ].filter((item) => recorded(item.value))
    },
    traceItems() {
      return [
        { key: this.$t('AppAuditRecordID'), value: this.object.id },
        { key: this.$t('AppAuditRotationID'), value: this.object.rotation_id }
      ].filter((item) => ![null, undefined, '', '-'].includes(item.value))
    },
    notificationItems() {
      const notification = this.object.notification
      return [
        {
          key: this.$t('AppNotificationURL'),
          value: notification.url || this.$t('AppNotificationSDKCallback'),
          span: 2
        },
        { key: this.$t('AppNotificationEventCode'), value: notification.event },
        { key: this.$t('AppNotificationEventID'), value: notification.event_id }
      ]
    },
    changeTable() {
      return {
        totalData: this.object.changes,
        hasSelection: false,
        hasPagination: false,
        columns: [
          { prop: 'field', label: this.$t('ChangeField') },
          { prop: 'before', label: this.$t('AppAuditBefore') },
          { prop: 'after', label: this.$t('AppAuditAfter') }
        ]
      }
    },
    attemptTable() {
      return {
        totalData: this.object.notification.attempts,
        hasSelection: false,
        hasPagination: false,
        columns: [
          { prop: 'id', label: this.$t('AppAuditAttempt'), width: 100 },
          {
            prop: 'datetime',
            label: this.$t('Date'),
            width: 180,
            formatter: (row) => toSafeLocalDateStr(row.datetime)
          },
          { prop: 'status_code', label: this.$t('AppAuditHTTPStatus'), width: 130 },
          { prop: 'result', label: this.$t('Result'), width: 100 },
          { prop: 'reason', label: this.$t('Detail'), minWidth: 250 }
        ]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.event-heading {
  display: flex;
  align-items: center;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 16px;
    color: var(--color-text-primary);
  }
}

.event-date {
  margin: 8px 0 0;
  color: var(--color-icon-primary);
  font-size: 12px;
}

.event-summary {
  margin: 12px 0 20px;
  color: var(--color-text-primary);
}

.trace-fields {
  margin-top: 12px;
}

.delivery-attempts {
  margin-top: 12px;
}

.receipt-help {
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--color-icon-primary);
}

.audit-detail :deep(.el-descriptions__table) {
  table-layout: fixed;
}

.audit-detail :deep(.el-descriptions__cell) {
  padding-bottom: 12px;
  vertical-align: top;
  overflow-wrap: anywhere;
}

.audit-detail :deep(.el-descriptions__label) {
  color: var(--color-icon-primary);
  font-size: 12px;
}
</style>
