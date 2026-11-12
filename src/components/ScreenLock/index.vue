<template>
  <dialog
    ref="dialog"
    class="web-session-lock-shield"
    :aria-label="$t('ScreenLock.Title')"
    @cancel.prevent
  >
    <div class="screen-lock-surface">
      <div class="screen-lock-brand">
        <img
          v-if="customLogo && !logoFailed"
          :src="customLogo"
          alt="JumpServer"
          class="screen-lock-brand-mark"
          @error="logoFailed = true"
        />
        <LogoSymbol v-else class="screen-lock-brand-mark" />
        <span>JumpServer</span>
      </div>
      <div v-if="!unconfirmed && !state.error" class="screen-lock-security-indicator">
        {{ $t('ScreenLock.SecureLabel') }}
      </div>
      <div class="screen-lock-content">
        <el-card class="screen-lock-form-card" shadow="never">
          <header class="screen-lock-header">
            <div class="screen-lock-heading" tabindex="-1">
              <el-icon :size="20" class="screen-lock-status-icon"><Lock /></el-icon>
              <h1>
                {{
                  $t(
                    state.logoutAt
                      ? 'ScreenLock.SignedOut'
                      : state.error
                        ? 'ScreenLock.CheckFailed'
                        : unconfirmed
                          ? 'ScreenLock.Checking'
                          : 'ScreenLock.Title'
                  )
                }}
              </h1>
            </div>
            <p
              v-if="
                !state.logoutAt &&
                !state.error &&
                !unconfirmed &&
                state.session?.has_password !== false
              "
              class="screen-lock-description"
            >
              {{ $t('ScreenLock.Description') }}
            </p>
          </header>
          <dl v-if="state.session" class="screen-lock-user">
            <dt class="screen-lock-label">{{ $t('User') }}</dt>
            <dd class="screen-lock-user-value">
              {{ state.session.user.name || state.session.user.username }}
            </dd>
          </dl>
          <p
            v-if="state.logoutAt"
            class="screen-lock-description screen-lock-logout-reason"
            role="status"
          >
            {{ $t('ScreenLock.TooManyFailures') }}
          </p>
          <p
            v-if="
              !state.logoutAt && (state.error || (displayedError && !state.session?.has_password))
            "
            class="screen-lock-error"
            role="alert"
          >
            {{ displayedError || $t('ScreenLock.LoadFailed') }}
          </p>
          <div v-if="state.logoutAt" class="screen-lock-countdown" role="status" aria-live="polite">
            <el-button
              class="screen-lock-unlock-button screen-lock-return-button"
              @click="returnToLogin"
            >
              {{ $t('ScreenLock.ReturnToLoginCountdown', { seconds: logoutRemaining }) }}
            </el-button>
          </div>
          <el-form
            v-else-if="!state.error && !unconfirmed && state.session?.has_password"
            label-position="top"
            class="screen-lock-form"
            @submit.prevent="unlock"
          >
            <el-form-item
              class="screen-lock-password-field"
              :label="$t('ScreenLock.Password')"
              :error="state.error ? '' : displayedError"
            >
              <el-input
                v-model="password"
                type="password"
                class="screen-lock-password-input"
                autocomplete="current-password"
                :maxlength="128"
                :disabled="busy"
                autofocus
              />
            </el-form-item>
            <el-button
              native-type="submit"
              :loading="pendingAction === 'unlock'"
              :disabled="!password || busy"
              class="screen-lock-unlock-button"
              >{{ $t('ScreenLock.Unlock') }}</el-button
            >
          </el-form>
          <p
            v-else-if="!state.error && !unconfirmed && state.session"
            class="screen-lock-unset-message"
            role="status"
          >
            {{ $t('ScreenLock.Unset') }}
          </p>
          <p v-else-if="!state.error" class="screen-lock-description">
            {{ $t('ScreenLock.Checking') }}
          </p>
          <div v-if="!state.logoutAt" class="screen-lock-actions">
            <el-button
              v-if="state.error"
              class="screen-lock-unlock-button"
              :loading="pendingAction === 'retry'"
              :disabled="busy"
              @click="retry"
            >
              {{ $t('ScreenLock.Retry') }}
            </el-button>
            <el-button
              :link="logoutAsText"
              :type="logoutAsText ? undefined : 'primary'"
              :class="logoutAsText ? 'screen-lock-logout-button' : 'screen-lock-unlock-button'"
              :loading="pendingAction === 'logout'"
              :disabled="busy"
              @click="exit"
              >{{ $t('ScreenLock.Logout') }}</el-button
            >
          </div>
        </el-card>
      </div>
    </div>
  </dialog>
  <SessionWarnings
    :append-to="blocked ? warningTarget : null"
    :idle-remaining="state.idleRemaining"
    :expiry-remaining="state.expiryRemaining"
  />
</template>

<script>
import LogoSymbol from '@/layout/components/NavLeft/LogoSymbol.vue'
import SessionWarnings from './SessionWarnings.vue'
import { isDefaultInterfaceLogo } from '@/utils/interfaceLogo'
import { describeWebSessionError } from '@/utils/webSessionLock'
import {
  webSessionLockState,
  startWebSessionLock,
  unlockWebSession,
  refreshWebSessionLock,
  logoutLockedSession,
  returnToWebLogin
} from '@/composables/useWebSessionLock'

export default {
  name: 'WebScreenLock',
  components: { LogoSymbol, SessionWarnings },
  data: () => ({
    warningTarget: null,
    countdownNow: Date.now(),
    countdownTimer: null,
    logoFailed: false,
    password: '',
    error: '',
    pendingAction: ''
  }),
  computed: {
    state: () => webSessionLockState,
    busy() {
      return this.pendingAction !== ''
    },
    customLogo() {
      const logo = this.$store.getters.publicSettings.INTERFACE?.logo_logout
      return isDefaultInterfaceLogo(logo) ? '' : logo.trim()
    },
    unconfirmed() {
      return !this.state.session?.locked
    },
    logoutAsText() {
      return Boolean(this.state.error || this.state.session?.has_password)
    },
    displayedError() {
      if (this.state.error) {
        return this.state.errorInfo
          ? this.$t(this.state.errorInfo.key, this.state.errorInfo.params)
          : this.describeError(null)
      }
      const remaining = this.state.attemptsRemaining
      return (
        this.error ||
        (this.state.session?.has_password && remaining !== null && remaining > 0 && remaining < 5
          ? this.$t('ScreenLock.AttemptsRemaining', { count: remaining })
          : '')
      )
    },
    logoutRemaining() {
      return Math.max(1, Math.ceil((this.state.logoutAt - this.countdownNow) / 1000))
    },
    blocked() {
      return !this.state.ready || this.state.locked
    }
  },
  watch: {
    'state.logoutAt'(at) {
      clearInterval(this.countdownTimer)
      this.countdownNow = Date.now()
      if (at) {
        this.countdownTimer = setInterval(() => {
          this.countdownNow = Date.now()
        }, 250)
      }
    },
    blocked() {
      this.syncDialog()
    },
    'state.ready'() {
      this.syncDialog()
    }
  },
  mounted() {
    this.warningTarget = this.$refs.dialog
    this.syncDialog()
    startWebSessionLock().catch(() => {})
  },
  beforeUnmount() {
    clearInterval(this.countdownTimer)
  },
  methods: {
    returnToLogin: returnToWebLogin,
    async syncDialog() {
      await this.$nextTick()
      const dialog = this.$refs.dialog
      if (this.state.ready && this.state.locked && dialog && !dialog.open) {
        this.error = ''
        dialog.showModal()
        const target = dialog.querySelector('input') || dialog.querySelector('.screen-lock-heading')
        target?.focus({ preventScroll: true })
      } else if (this.state.ready && !this.state.locked && dialog?.open) {
        this.password = ''
        dialog.close()
      }
    },
    async unlock() {
      if (!this.password || this.busy) return
      this.pendingAction = 'unlock'
      this.error = ''
      try {
        await unlockWebSession(this.password)
      } catch (error) {
        const remaining = error.response?.data?.attempts_remaining
        if (error.response?.status === 400 && Number.isInteger(remaining)) {
          this.error = ''
          return
        }
        this.error =
          error.response?.status === 400
            ? this.$t('ScreenLock.UnlockFailed')
            : this.describeError(error)
      } finally {
        this.password = ''
        this.pendingAction = ''
        await this.$nextTick()
        const dialog = this.$refs.dialog
        if (dialog?.open) dialog.querySelector('input')?.focus()
      }
    },
    async retry() {
      if (this.busy) return
      this.pendingAction = 'retry'
      this.error = ''
      try {
        await refreshWebSessionLock()
      } catch (error) {
        this.error = this.describeError(error)
      } finally {
        this.pendingAction = ''
      }
    },
    async exit() {
      this.pendingAction = 'logout'
      try {
        await logoutLockedSession()
      } catch (error) {
        this.error = this.describeError(error)
      } finally {
        this.pendingAction = ''
      }
    },
    describeError(error) {
      const { key, params } = describeWebSessionError(error)
      return this.$t(key, params)
    }
  }
}
</script>

<style src="./screen-lock.css" />
<style scoped>
.web-session-lock-shield {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100svh;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
}
.web-session-lock-shield::backdrop {
  background: var(--el-bg-color-page);
}

.screen-lock-actions {
  flex-direction: column;
}
.screen-lock-actions > .el-button + .el-button {
  margin-left: 0;
}

.screen-lock-form-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px;
}
.screen-lock-form .screen-lock-password-field.el-form-item {
  margin: 0;
}
.screen-lock-form .screen-lock-password-field :deep(.el-form-item__label) {
  min-height: 0;
  height: auto;
  margin: 0 0 6px;
  padding: 0;
  color: var(--screen-lock-muted);
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
}
.screen-lock-password-field :deep(.el-form-item__error) {
  position: static;
  width: 100%;
  margin-top: 8px;
  padding: 0;
  font-size: 13px;
  line-height: 20px;
}
.screen-lock-password-input :deep(.el-input__wrapper) {
  height: 32px;
  min-height: 32px;
  padding-inline: 12px;
  border-radius: 4px;
  background: var(--screen-lock-input-bg);
  border: 1px solid var(--screen-lock-border);
  box-shadow: none;
  transition:
    box-shadow 150ms,
    background-color 150ms;
}
.screen-lock-password-input :deep(.el-input__wrapper:hover) {
  border-color: color-mix(in srgb, var(--screen-lock-accent) 45%, var(--screen-lock-border));
  background: var(--screen-lock-input-bg);
}
.screen-lock-password-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--screen-lock-accent);
  box-shadow: none;
}
/* Keep the password field neutral while its validation message stays red. */
.screen-lock-password-field.el-form-item.is-error
  :deep(.screen-lock-password-input.el-input > .el-input__wrapper) {
  border-color: var(--screen-lock-border) !important;
  box-shadow: none !important;
}
.screen-lock-password-field.el-form-item.is-error
  :deep(.screen-lock-password-input.el-input > .el-input__wrapper:hover) {
  border-color: color-mix(
    in srgb,
    var(--screen-lock-accent) 45%,
    var(--screen-lock-border)
  ) !important;
}
.screen-lock-password-field.el-form-item.is-error
  :deep(.screen-lock-password-input.el-input > .el-input__wrapper.is-focus) {
  border-color: var(--screen-lock-accent) !important;
}
.screen-lock-password-input :deep(.el-input__inner) {
  height: 30px;
  border: 0;
  background: var(--screen-lock-input-bg);
  box-shadow: 0 0 0 1000px var(--screen-lock-input-bg) inset !important;
  -webkit-text-fill-color: var(--screen-lock-text);
  caret-color: var(--screen-lock-text);
  font-size: 13px;
}
@media (max-width: 600px) {
  .screen-lock-form-card :deep(.el-card__body) {
    padding: 28px;
  }
}
</style>
