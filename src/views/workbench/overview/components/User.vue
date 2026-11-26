<template>
  <HomeCard :title="$t('YourProfile')">
    <div class="identity">
      <el-avatar :size="40" :src="avatarUrl" fit="fill" />
      <dl class="profile-details" :aria-busy="loading">
        <dt>{{ $t('Username') }}</dt>
        <dd>{{ user.username || user.name }}</dd>
        <dt>{{ $t('Email') }}</dt>
        <dd>{{ user.email }}</dd>
        <dt>{{ $t('LoginDate') }}</dt>
        <dd>{{ toSafeLocalDateStr(user.last_login) }}</dd>
        <dt>{{ $t('OverviewMFA') }}</dt>
        <dd>
          <el-link v-if="mfaStatus" :href="mfaUrl" target="_blank" rel="noopener noreferrer">
            {{ $t(mfaStatus) }}
          </el-link>
          <span v-else>{{ denied ? $t('NoPermission') : '—' }}</span>
        </dd>
      </dl>
    </div>
    <div v-if="error" class="load-error">
      {{ $t('OverviewLoadFailed') }}
      <el-button link :disabled="loading" @click="$emit('refresh')">{{ $t('Retry') }}</el-button>
    </div>
  </HomeCard>
</template>

<script>
import { useDateTime } from '@/composables/useDateTime'
import { getAssetUrl } from '@/utils/assets'
import { addBasePath } from '@/utils/common/index'
import HomeCard from './HomeCard.vue'

export default {
  name: 'Huser',
  components: { HomeCard },
  props: {
    summary: { type: Object, default: null },
    loading: Boolean,
    error: Boolean,
    denied: Boolean
  },
  emits: ['refresh'],
  setup() {
    return useDateTime()
  },
  computed: {
    avatarUrl() {
      return getAssetUrl('img/avatar.png')
    },
    user() {
      return this.$store.getters.currentUser || {}
    },
    mfaUrl() {
      return addBasePath('/core/auth/profile/mfa/')
    },
    mfaStatus() {
      const mfa = this.summary?.mfa
      if (typeof mfa?.enabled !== 'boolean' || typeof mfa.configured !== 'boolean') return null
      if (mfa.configured) return 'OverviewMFAEnabled'
      return mfa.enabled ? 'OverviewMFASetup' : 'OverviewMFADisabled'
    }
  }
}
</script>

<style lang="scss" scoped>
.identity {
  container-type: inline-size;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.el-avatar {
  flex: 0 0 auto;
}
.profile-details {
  display: grid;
  flex: 1;
  grid-template-columns: fit-content(45%) minmax(0, 1fr);
  gap: 8px 12px;
  align-items: baseline;
  margin: 0;
  min-width: 0;
  font-size: var(--el-font-size-base);
}
.profile-details dt {
  color: var(--color-text-secondary);
  overflow-wrap: anywhere;
}
.profile-details dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}
.load-error {
  color: var(--color-text-secondary);
  margin-top: 8px;
}
@container (max-width: 260px) {
  .profile-details {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 1px;
  }
  .profile-details dd + dt {
    margin-top: 4px;
  }
}
</style>
