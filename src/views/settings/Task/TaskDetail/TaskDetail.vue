<template>
  <el-row :gutter="20" class="task-detail">
    <el-col :md="20" :sm="24">
      <DetailCard :items="detailCardItems" :title="cardTitle" />
      <IBox
        v-if="showNotificationSettings"
        v-loading="noticeLoading"
        class="notification-settings"
        title="NotificationSettings"
      >
        <el-form
          v-if="noticeLoaded"
          ref="noticeForm"
          :model="noticeForm"
          :rules="noticeRules"
          label-width="18.2%"
        >
          <el-form-item :label="$t('FirstNotice')" :prop="notificationFields.first">
            <div class="notice-value">
              <span>{{ $t('NoticeAdvance') }}</span>
              <el-input-number
                v-model="noticeForm[notificationFields.first]"
                :disabled="noticeLoading || noticeSubmitting"
                :max="3650"
                :min="1"
                :precision="0"
                controls-position="right"
                @change="validateNoticeRelation"
              />
              <span>{{ $t('NoticeDay') }}</span>
            </div>
          </el-form-item>
          <el-form-item :label="$t('DailyNotice')" :prop="notificationFields.daily">
            <div class="notice-value">
              <span>{{ $t('NoticeAdvance') }}</span>
              <el-input-number
                v-model="noticeForm[notificationFields.daily]"
                :disabled="noticeLoading || noticeSubmitting"
                :max="365"
                :min="1"
                :precision="0"
                controls-position="right"
                @change="validateNoticeRelation"
              />
              <span>{{ $t('NoticeDay') }}</span>
              <span>{{ $t('NoticeStart') }}</span>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button
              :disabled="noticeLoading || noticeSubmitting"
              :loading="noticeSubmitting"
              type="primary"
              @click="submitNoticeSettings"
            >
              {{ $t('Submit') }}
            </el-button>
          </el-form-item>
        </el-form>
        <div v-else-if="noticeLoadFailed" class="notice-load-error">
          <span>{{ $t('LoadFailed') }}</span>
          <el-button :disabled="noticeLoading" link type="primary" @click="loadNoticeSettings">
            {{ $t('Retry') }}
          </el-button>
        </div>
      </IBox>
    </el-col>
  </el-row>
</template>

<script>
import { IBox } from '@/components'
import DetailCard from '@/components/Cards/DetailCard/index.vue'

const taskNoticeFields = {
  'users.tasks.check_user_expired': {
    first: 'USER_EXPIRED_FIRST_NOTICE_DAYS',
    daily: 'USER_EXPIRED_DAILY_NOTICE_DAYS'
  },
  'perms.tasks.check_asset_permission_will_expired': {
    first: 'PERM_EXPIRED_FIRST_NOTICE_DAYS',
    daily: 'PERM_EXPIRED_DAILY_NOTICE_DAYS'
  }
}

export default {
  name: 'TaskDetail',
  components: {
    DetailCard,
    IBox
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      noticeForm: {},
      noticeLoaded: false,
      noticeLoadFailed: false,
      noticeLoading: false,
      noticeSubmitting: false
    }
  },
  computed: {
    cardTitle() {
      return this.$t('BasicInfo')
    },
    detailCardItems() {
      return [
        {
          key: this.$t('TaskPath'),
          value: this.object.name
        },
        {
          key: this.$t('Name'),
          value: this.object.meta.comment
        },
        {
          key: this.$t('Queue'),
          value: this.object.meta.queue
        },
        {
          key: this.$t('LastPublishedTime'),
          value: this.object.date_last_publish
        },
        {
          key: this.$t('Description'),
          value: this.object.meta.description
        }
      ]
    },
    notificationFields() {
      return taskNoticeFields[this.object.name]
    },
    showNotificationSettings() {
      return !!this.notificationFields && this.$hasPerm('settings.change_security')
    },
    noticeRules() {
      if (!this.notificationFields) {
        return {}
      }
      const rules = [
        { validator: this.validatePositiveInteger, trigger: 'change' },
        { validator: this.validateNoticeOrder, trigger: 'change' }
      ]
      return {
        [this.notificationFields.first]: rules,
        [this.notificationFields.daily]: rules
      }
    }
  },
  watch: {
    'object.name': {
      immediate: true,
      handler() {
        this.noticeForm = {}
        this.noticeLoaded = false
        this.noticeLoadFailed = false
        this.$nextTick(() => {
          this.$refs.noticeForm?.clearValidate()
        })
        this.loadNoticeSettings()
      }
    }
  },
  methods: {
    async loadNoticeSettings() {
      const fields = this.notificationFields
      if (!fields || !this.$hasPerm('settings.change_security')) {
        this.noticeForm = {}
        this.noticeLoaded = false
        this.noticeLoadFailed = false
        return
      }
      const taskName = this.object.name
      this.noticeLoading = true
      this.noticeLoaded = false
      this.noticeLoadFailed = false
      try {
        const data = await this.$axios.get('/api/v1/settings/setting/?category=task_notice')
        if (taskName !== this.object.name) {
          return
        }
        this.noticeForm = {
          [fields.first]: data[fields.first],
          [fields.daily]: data[fields.daily]
        }
        this.noticeLoaded = true
      } catch {
        if (taskName === this.object.name) {
          this.noticeLoadFailed = true
        }
      } finally {
        if (taskName === this.object.name) {
          this.noticeLoading = false
        }
      }
    },
    validatePositiveInteger(rule, value, callback) {
      if (!Number.isInteger(value) || value < 1) {
        callback(new Error(this.$t('PositiveIntegerRequired')))
        return
      }
      callback()
    },
    validateNoticeOrder(rule, value, callback) {
      const fields = this.notificationFields
      if (this.noticeForm[fields.first] < this.noticeForm[fields.daily]) {
        callback(new Error(this.$t('FirstNoticeNotLessThanDailyNotice')))
        return
      }
      callback()
    },
    validateNoticeRelation() {
      const fields = this.notificationFields
      this.$nextTick(() => {
        const form = this.$refs.noticeForm
        if (!form || fields !== this.notificationFields) {
          return
        }
        form.validateField([fields.first, fields.daily], () => {})
      })
    },
    async submitNoticeSettings() {
      const valid = await this.$refs.noticeForm.validate().catch(() => false)
      if (!valid) {
        return
      }
      const fields = this.notificationFields
      const taskName = this.object.name
      const data = {
        [fields.first]: this.noticeForm[fields.first],
        [fields.daily]: this.noticeForm[fields.daily]
      }
      this.noticeSubmitting = true
      try {
        const response = await this.$axios.patch(
          '/api/v1/settings/setting/?category=task_notice',
          data
        )
        if (taskName !== this.object.name) {
          return
        }
        this.noticeForm = {
          [fields.first]: response[fields.first],
          [fields.daily]: response[fields.daily]
        }
        this.$message.success(this.$t('UpdateSuccessMsg'))
      } finally {
        this.noticeSubmitting = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.notification-settings {
  margin-top: 20px;
}

.notice-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice-value :deep(.el-input-number) {
  width: 160px;
}

.notice-load-error {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
}

.task-detail :deep(.item-value span) {
  white-space: normal !important;
}
</style>
