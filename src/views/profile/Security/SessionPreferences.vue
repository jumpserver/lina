<template>
  <IBox class="idle-lock-preferences">
    <GenericCreateUpdateForm
      :key="formVersion"
      v-bind="config"
      submit-method="patch"
      :more-buttons="resetButtons"
    />
  </IBox>
</template>
<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import IBox from '@/components/Common/IBox/index.vue'
import { refreshWebSessionLock } from '@/composables/useWebSessionLock'
export default {
  components: { GenericCreateUpdateForm, IBox },
  props: { scope: { type: String, required: true } },
  data() {
    const fields =
      this.scope === 'Client'
        ? ['client_reauth_on_exit', 'client_max_session_time', 'client_idle_lock_time']
        : ['web_idle_lock_time']
    return {
      fields,
      initialValues: {},
      formVersion: 0,
      resetting: false,
      config: {
        url: '/api/v1/users/profile/idle-lock/',
        hasDetailInMsg: false,
        fields,
        fieldsMeta: Object.fromEntries(
          fields.map((name) => [
            name,
            name === 'client_reauth_on_exit'
              ? { type: 'checkbox', helpTextAsTip: true }
              : {
                  type: 'input',
                  helpTextAsTip: true,
                  el: { type: 'number', min: 0, max: 99999, clearable: true }
                }
          ])
        ),
        afterGetFormValue: (values) => {
          for (const name of fields) {
            const meta = this.config.fieldsMeta[name]
            values[name] = values['effective_' + name]
            if (name === 'client_reauth_on_exit') {
              meta.el = { disabled: values.client_reauth_on_exit_required }
              meta.helpTip = this.$t(
                values.client_reauth_on_exit_required
                  ? 'PersonalSecurity.ReauthRequired'
                  : 'PersonalSecurity.ReauthHelp'
              )
            } else {
              const maximum = values[name.replace('_time', '_limit')]
              meta.el.min = maximum ? 1 : 0
              meta.el.max = maximum || 99999
              meta.el.placeholder = this.$t('IdleLock.InputPlaceholder')
              meta.helpTip = this.$t(
                maximum
                  ? 'IdleLock.LimitHelp'
                  : name === 'client_max_session_time'
                    ? 'PersonalSecurity.UnlimitedHelp'
                    : 'IdleLock.DisabledHelp',
                { minutes: maximum }
              )
              const behavior =
                name === 'client_max_session_time'
                  ? 'PersonalSecurity.LifetimeHelp'
                  : this.scope === 'Client'
                    ? 'PersonalSecurity.IdleHelp'
                    : 'PersonalSecurity.WebIdleHelp'
              meta.helpTip = this.$t(behavior) + ' ' + meta.helpTip
            }
          }
          this.initialValues = Object.fromEntries(fields.map((name) => [name, values[name]]))
          return values
        },
        cleanFormValue: (values) =>
          Object.fromEntries(
            fields
              .filter((name) => values[name] !== this.initialValues[name])
              .map((name) => [
                name,
                name === 'client_reauth_on_exit'
                  ? values[name]
                  : values[name] === '' || values[name] == null
                    ? null
                    : Number(values[name])
              ])
          ),
        onPerformSuccess: () => {
          this.$message.success(this.$t('UpdateSuccessMsg'))
          this.formVersion += 1
          refreshWebSessionLock().catch(() => {})
        }
      }
    }
  },
  computed: {
    resetButtons() {
      return [
        {
          title: this.$t('RestoreDefault'),
          loading: this.resetting,
          disabled: this.resetting,
          callback: () => this.resetToDefault()
        }
      ]
    }
  },
  methods: {
    async resetToDefault() {
      if (this.resetting) return
      this.resetting = true
      try {
        await this.$axios.patch(
          this.config.url,
          Object.fromEntries(this.fields.map((name) => [name, null]))
        )
        this.$message.success(this.$t('UpdateSuccessMsg'))
        this.formVersion += 1
        refreshWebSessionLock().catch(() => {})
      } catch (error) {
        this.$log.error('Failed to reset security settings', error)
      } finally {
        this.resetting = false
      }
    }
  }
}
</script>
<style scoped>
.idle-lock-preferences
  :deep(.el-form .el-form-item.is-error > .el-form-item__content > .el-input > .el-input__wrapper) {
  border-color: var(--el-border-color) !important;
  box-shadow: none !important;
}
.idle-lock-preferences
  :deep(
    .el-form .el-form-item.is-error > .el-form-item__content > .el-input > .el-input__wrapper:hover
  ) {
  border-color: var(--el-border-color-hover) !important;
}
.idle-lock-preferences
  :deep(
    .el-form
      .el-form-item.is-error
      > .el-form-item__content
      > .el-input
      > .el-input__wrapper.is-focus
  ) {
  border-color: var(--el-color-primary) !important;
}
</style>
