<template>
  <el-popover
    v-if="row.session_policy"
    :title="$t('OnlineSessionPolicy.Title')"
    placement="left"
    trigger="click"
    :width="380"
  >
    <template #reference>
      <el-button
        link
        type="primary"
        class="session-expiry-link"
        :aria-label="$t('OnlineSessionPolicy.Title')"
      >
        {{ expiryText }}
        <el-icon><InfoFilled /></el-icon>
      </el-button>
    </template>
    <dl class="session-policy-info">
      <template v-for="item in items" :key="item.label">
        <dt>{{ item.label }}</dt>
        <dd>{{ item.value }}</dd>
      </template>
    </dl>
  </el-popover>
  <span v-else>{{ expiryText }}</span>
</template>

<script>
import BaseFormatter from './base.vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { getLangCode } from '@/i18n/utils'

export default {
  name: 'SessionExpiryFormatter',
  extends: BaseFormatter,
  computed: {
    isClient() {
      return (this.row.type?.value || this.row.type) === 'C'
    },
    expiryText() {
      if (this.cellValue) return toSafeLocalDateStr(this.cellValue)
      return this.isClient ? this.$t('OnlineSessionPolicy.Unlimited') : '-'
    },
    items() {
      const policy = this.row.session_policy
      if (!policy) return []
      const enabled = (value) => this.$t(value ? 'Enabled' : 'Disabled')
      const items = [
        {
          label: this.$t(
            this.isClient ? 'OnlineSessionPolicy.ClientDuration' : 'OnlineSessionPolicy.Duration'
          ),
          value:
            policy.duration === 0
              ? this.$t('OnlineSessionPolicy.Unlimited')
              : this.duration(policy.duration)
        },
        {
          label: this.$t(
            this.isClient ? 'PersonalSecurity.Reauth' : 'OnlineSessionPolicy.BrowserExit'
          ),
          value: enabled(policy.reauth_on_exit)
        },
        {
          label: this.$t('OnlineSessionPolicy.IdleLock'),
          value: policy.idle_lock_time
            ? this.duration(policy.idle_lock_time * 60)
            : this.$t('Disabled')
        }
      ]
      if (!this.isClient) {
        items.splice(1, 0, {
          label: this.$t('OnlineSessionPolicy.Renew'),
          value: enabled(policy.renew)
        })
      }
      if (policy.grace_expires_at) {
        items.push({
          label: this.$t('OnlineSessionPolicy.Grace'),
          value: toSafeLocalDateStr(policy.grace_expires_at)
        })
      }
      return items
    }
  },
  methods: {
    duration(seconds) {
      for (const [divisor, unit] of [
        [86400, 'day'],
        [3600, 'hour'],
        [60, 'minute'],
        [1, 'second']
      ]) {
        if (seconds >= divisor && seconds % divisor === 0) {
          return new Intl.NumberFormat(getLangCode(true).replaceAll('_', '-'), {
            style: 'unit',
            unit,
            unitDisplay: 'long'
          }).format(seconds / divisor)
        }
      }
      return '-'
    }
  }
}
</script>

<style scoped>
.session-expiry-link :deep(> span) {
  gap: 5px;
}
.session-policy-info {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px 18px;
  margin: 0;
}
.session-policy-info dt {
  color: var(--el-text-color-secondary);
}
.session-policy-info dd {
  margin: 0;
  text-align: right;
}
</style>
