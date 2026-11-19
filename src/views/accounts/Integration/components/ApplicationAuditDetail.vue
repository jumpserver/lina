<template>
  <Page :title="null" class="audit-detail">
    <IBox>
      <div class="event-heading">
        <h3>{{ object.event_display }}</h3>
        <el-tag :type="resultTagTypes[object.result]">{{ object.result_display }}</el-tag>
      </div>
      <p class="event-date">{{ formatDate(object.datetime) }}</p>
      <p v-if="object.event_meaning" class="event-meaning">
        {{ object.event_meaning }}
      </p>
      <p v-if="object.summary && object.summary !== object.event_display" class="event-summary">
        {{ object.summary }}
      </p>
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
      <details class="event-reference">
        <summary>{{ $t('AppAuditViewRawRecord') }}</summary>
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
        <p v-if="object.raw_summary && object.raw_summary !== object.summary">
          {{ $t('AppAuditOriginalDetail') }}：{{ object.raw_summary }}
        </p>
      </details>
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
        { key: this.$t('Account'), value: row.account },
        ...(!disabled ? [{ key: this.$t('ApplicationCredential'), value: row.credential }] : []),

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
        { key: this.$t('AppAuditSourceIP'), value: row.remote_addr }
      ].filter((item) => recorded(item.value))
    },
    traceItems() {
      const row = this.object
      return [
        { key: this.$t('AppAuditEventCode'), value: row.event },
        { key: this.$t('AppAuditRecordID'), value: row.id },
        { key: this.$t('AppAuditRotationID'), value: row.rotation_id },
        ...(row.event !== 'client_disabled'
          ? [
              { key: this.$t('CredentialKey'), value: row.credential_key },
              { key: this.$t('AppAuditRevision'), value: row.revision }
            ]
          : []),
        { key: this.$t('AppNotificationEventCode'), value: row.notification?.event },
        { key: this.$t('AppNotificationEventID'), value: row.notification?.event_id }
      ].filter((item) => ![null, undefined, '', '-'].includes(item.value))
    },
    notificationItems() {
      const notification = this.object.notification
      return [
        {
          key: this.$t('WebhookURL'),
          value: notification.url_display || '••••••',
          span: 2
        }
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

.event-meaning {
  margin: 12px 0;
  color: var(--el-text-color-regular);
  line-height: 1.7;
}

.event-reference {
  margin: 16px 0 0;
  overflow-wrap: anywhere;
  font-size: 12px;

  summary {
    cursor: pointer;
    color: var(--el-text-color-regular);
  }
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
