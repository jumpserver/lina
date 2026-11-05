<template>
  <TwoCol>
    <AutoDetailCard
      v-for="group in detailGroups"
      :key="`${group.title}:${group.fields.join(',')}`"
      :title="group.title"
      :fields="group.fields"
      :fields-meta="fieldsMeta"
      :formatters="formatters"
      :object="object"
      :url="url"
    />
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { ChoicesFormatter } from '@/components/Table/TableFormatters'
import { AccountLabelMapper } from '@/views/perms/const'
import { h } from 'vue'

export default {
  name: 'Detail',
  components: {
    TwoCol,
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      url: `/api/v1/acls/login-asset-acls/${this.object.id}/`,
      fieldsMeta: {
        recipients: { dependsOn: 'notice_enabled' },
        reviewers: { dependsOn: 'review_enabled' },
        review_duration: { dependsOn: 'review_enabled' }
      },
      formatters: {
        ...Object.fromEntries(
          [
            'is_active',
            'reason_enabled',
            'mfa_enabled',
            'review_enabled',
            'notice_enabled',
            'face_verify_enabled',
            'face_online_enabled',
            'push_account_enabled',
            'change_secret_enabled'
          ].map((field) => [
            field,
            (item, value) =>
              h(ChoicesFormatter, {
                cellValue: value,
                col: { formatterArgs: { showText: false, showFalse: false } },
                title: this.$t(value ? 'Yes' : 'No'),
                'aria-label': this.$t(value ? 'Yes' : 'No')
              })
          ])
        ),
        users: (item, value) => this.formatMatch(value),
        assets: (item, value) => this.formatMatch(value),
        accounts: (item, values) => {
          const accounts = [...new Set(values || [])]
          const count = accounts.filter((value) => !AccountLabelMapper[value]).length
          const labels = accounts
            .filter((value) => AccountLabelMapper[value] && value !== '@SPEC')
            .map((value) => AccountLabelMapper[value])
          if (!accounts.includes('@ALL') && (count || accounts.includes('@SPEC'))) {
            labels.unshift(`${AccountLabelMapper['@SPEC']} (${count})`)
          }
          return labels.join(', ') || '-'
        },
        'rules.ip_group': (item, values) => values?.join(', ') || this.$t('All'),
        'rules.time_period': (item, values) =>
          values?.length
            ? values
                .filter((period) => period.value)
                .map((period) => {
                  const day = [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday'
                  ][period.id]
                  return `${this.$t(day)} ${period.value}`
                })
                .join('\n') || '-'
            : this.$t('All'),
        reviewers: (item, users) => (users || []).map((user) => user.name).join(', ') || '-',
        recipients: (item, users) => (users || []).map((user) => user.name).join(', ') || '-',
        review_duration: (item, hours) =>
          this.$t('ReviewExemptionDurationHours', { hours: hours ?? 0 })
      }
    }
  },
  computed: {
    detailGroups() {
      return [
        { title: 'Basic', fields: ['name', 'priority'] },
        {
          title: 'AclMatchConditions',
          fields: ['users', 'assets', 'accounts', 'rules.ip_group', 'rules.time_period']
        },
        { title: 'AclExecutionAction', fields: ['action'] },
        {
          title: 'AclBeforeConnection',
          fields: [
            'notice_enabled',
            ...(this.object.notice_enabled ? ['recipients'] : []),
            'reason_enabled',
            'mfa_enabled',
            'face_verify_enabled',
            'review_enabled',
            ...(this.object.review_enabled ? ['reviewers', 'review_duration'] : []),
            'push_account_enabled'
          ]
        },
        {
          title: 'AclDuringSession',
          fields: ['face_online_enabled']
        },
        {
          title: 'AclAfterSession',
          fields: ['change_secret_enabled']
        },
        {
          title: 'AclOtherSettings',
          fields: ['is_active', 'comment', 'date_created', 'created_by']
        }
      ]
    }
  },
  methods: {
    formatMatch(value) {
      if (value?.type === 'all') return this.$t('All')
      if (value?.type === 'ids') return `${this.$t('Spec')} (${value.ids?.length || 0})`
      if (value?.type === 'attrs') return `${this.$t('SelectByAttr')} (${value.attrs?.length || 0})`
      return '-'
    }
  }
}
</script>
