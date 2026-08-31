<template>
  <IBox v-if="noticeFields" class="notification-settings" title="NotificationSettings">
    <GenericCreateUpdateForm
      ref="form"
      :after-get-form-value="normalizeFormValue"
      :clean-form-value="cleanFormValue"
      :fields="fields"
      :fields-meta="fieldsMeta"
      :get-url="getNoticeSettingsUrl"
      :has-detail-in-msg="false"
      :has-reset="false"
      :on-perform-success="handleSubmitSuccess"
      submit-method="patch"
      url="/api/v1/settings/setting/?category=task_notice"
    />
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'

const taskNoticeFields = {
  'users.tasks.check_user_expired': {
    first: 'USER_EXPIRED_FIRST_NOTICE_DAYS',
    daily: 'USER_EXPIRED_DAILY_NOTICE_DAYS'
  },
  'perms.tasks.check_asset_permission_will_expired': {
    first: 'PERM_EXPIRED_FIRST_NOTICE_DAYS',
    daily: 'PERM_EXPIRED_DAILY_NOTICE_DAYS',
    short: 'PERM_EXPIRED_SHORT_NOTICE_MINUTES'
  }
}

export default {
  name: 'ExpirationNoticeSettings',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  props: {
    taskName: {
      type: String,
      required: true
    }
  },
  computed: {
    noticeFields() {
      return taskNoticeFields[this.taskName]
    },
    fields() {
      return [this.noticeFields.first, this.noticeFields.daily, this.noticeFields.short].filter(
        Boolean
      )
    },
    fieldsMeta() {
      const fields = {
        [this.noticeFields.first]: {
          label: this.$t('FirstNotice'),
          helpTip: this.$t('FirstNoticeHelpText'),
          el: { inputmode: 'numeric' },
          rules: [{ validator: this.validateFirstNotice, trigger: ['blur', 'change'] }]
        },
        [this.noticeFields.daily]: {
          label: this.$t('DailyNotice'),
          helpTip: this.$t('DailyNoticeHelpText'),
          el: { inputmode: 'numeric' },
          on: { input: this.validateNoticeRelation },
          rules: [{ validator: this.validateDailyNotice, trigger: ['blur', 'change'] }]
        }
      }
      if (this.noticeFields.short) {
        fields[this.noticeFields.short] = {
          label: this.$t('DefaultShortNoticeMinutes'),
          helpTip: this.$t('DefaultShortNoticeMinutesHelpText'),
          el: { inputmode: 'numeric' },
          rules: [{ validator: this.validateShortNotice, trigger: ['blur', 'change'] }]
        }
      }
      return fields
    }
  },
  methods: {
    getNoticeSettingsUrl() {
      return '/api/v1/settings/setting/?category=task_notice'
    },
    handleSubmitSuccess() {
      this.$message.success(this.$t('UpdateSuccessMsg'))
    },
    normalizeFormValue(value) {
      return Object.fromEntries(this.fields.map((name) => [name, String(value[name] ?? '')]))
    },
    cleanFormValue(value) {
      return Object.fromEntries(this.fields.map((name) => [name, Number(value[name])]))
    },
    parseNoticeDays(value, max, maxMessage) {
      const text = String(value ?? '').trim()
      if (!text || /^-\d+$/.test(text) || text === '0') {
        return { error: this.$t('PositiveIntegerRequired') }
      }
      if (!/^\d+$/.test(text)) {
        return { error: this.$t('IntegerRequired') }
      }
      const days = Number(text)
      if (days < 1) {
        return { error: this.$t('PositiveIntegerRequired') }
      }
      if (max && days > max) {
        return { error: this.$t(maxMessage) }
      }
      return { days }
    },
    validateFirstNotice(rule, value, callback, source) {
      const first = this.parseNoticeDays(value, 3650, 'FirstNoticeMaxDays')
      if (first.error) {
        callback(new Error(first.error))
        return
      }
      const daily = this.parseNoticeDays(source[this.noticeFields.daily], 365, 'DailyNoticeMaxDays')
      if (!daily.error && first.days < daily.days) {
        callback(new Error(this.$t('FirstNoticeNotLessThanDailyNotice')))
        return
      }
      callback()
    },
    validateDailyNotice(rule, value, callback) {
      const daily = this.parseNoticeDays(value, 365, 'DailyNoticeMaxDays')
      if (daily.error) {
        callback(new Error(daily.error))
        return
      }
      callback()
    },
    validateShortNotice(rule, value, callback) {
      const notice = this.parseNoticeDays(value)
      if (notice.error) {
        callback(new Error(notice.error))
        return
      }
      callback()
    },
    validateNoticeRelation() {
      this.$nextTick(() => {
        this.$refs.form?.validateField(this.noticeFields.first)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-settings {
  margin-top: 20px;
}
</style>
