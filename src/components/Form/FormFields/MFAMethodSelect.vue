<template>
  <div v-loading="loading" class="mfa-method-select">
    <el-radio-group
      v-if="!system"
      :model-value="mode"
      :disabled="disabled || !ready"
      @change="changeMode"
    >
      <el-radio value="inherit">{{ $t('MFAFollowSystem') }}</el-radio>
      <el-radio value="custom" :disabled="!selected.length && !available.length">
        {{ $t('Custom') }}
      </el-radio>
    </el-radio-group>
    <p v-if="!system && mode === 'inherit'" class="help-block">
      {{ $t('MFAFollowSystemHelp') }}
      {{ $t('MFACurrentAvailable') }}:
      {{ available.map((item) => item.label).join(', ') || $t('None') }}
    </p>
    <el-checkbox-group
      class="mfa-method-select__options"
      v-if="system || mode === 'custom'"
      :model-value="selected"
      :disabled="disabled || !ready"
      :min="1"
      @change="changeSelection"
    >
      <el-checkbox
        v-for="item in selectionOptions"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
        :title="[item.label, item.hint].filter(Boolean).join(' — ')"
      >
        {{ item.label }}
      </el-checkbox>
    </el-checkbox-group>
    <p v-if="system" class="help-block">{{ $t('MFASystemPolicyHelp') }}</p>
    <p v-if="hasUnavailableSelection" class="help-block">{{ $t('MFAStoredInactiveHelp') }}</p>
    <p v-if="ready && !effective.length" class="mfa-warning">{{ $t('MFANoEffectiveMethod') }}</p>
    <p v-if="!loading && !ready" class="mfa-warning">{{ $t('MFACapabilitiesUnavailable') }}</p>
  </div>
</template>

<script>
import { inject } from 'vue'
import { getPublicSettings } from '@/api/settings'
import { FORM_RENDERER_KEY } from '@/components/Form/DataForm/components/el-form-renderer/el-form-renderer.vue'

export default {
  name: 'MFAMethodSelect',
  inheritAttrs: false,
  props: {
    value: { type: Array, default: () => [] },
    system: Boolean,
    disabled: Boolean
  },
  emits: ['change'],
  setup() {
    return { formRenderer: inject(FORM_RENDERER_KEY, null) }
  },
  data() {
    return { loading: true, ready: false, methods: [] }
  },
  computed: {
    selected() {
      return (this.value || []).map((item) => item?.value ?? item)
    },
    mode() {
      return this.selected.length ? 'custom' : 'inherit'
    },
    currentMethods() {
      const emailEnabled = this.formRenderer?.getElForm?.()?.model?.SECURITY_MFA_BY_EMAIL
      return this.methods.map((item) =>
        this.system && item.value === 'email' && typeof emailEnabled === 'boolean'
          ? { ...item, enabled: emailEnabled }
          : item
      )
    },
    visibleMethods() {
      return this.currentMethods.filter((item) => item.visible)
    },
    selectionOptions() {
      return this.visibleMethods.map((item) => ({
        ...item,
        disabled:
          !this.system && !this.selected.includes(item.value) && (!item.enabled || !item.allowed),
        hint: !item.enabled
          ? this.$t('MFAFeatureDisabled')
          : !this.system && !item.allowed
            ? this.$t('MFASystemDisallowed')
            : ''
      }))
    },
    available() {
      return this.visibleMethods.filter((item) => item.enabled && item.allowed)
    },
    effective() {
      return this.currentMethods.filter(
        (item) =>
          item.visible &&
          item.enabled &&
          (this.system
            ? this.selected.includes(item.value)
            : item.allowed && (this.mode === 'inherit' || this.selected.includes(item.value)))
      )
    },
    hasUnavailableSelection() {
      return (
        this.ready &&
        this.selected.some((value) => !this.effective.some((item) => item.value === value))
      )
    }
  },
  async mounted() {
    try {
      const settings = await getPublicSettings()
      if (Array.isArray(settings.MFA_METHODS_STATUS)) {
        this.methods = settings.MFA_METHODS_STATUS
        this.ready = true
      }
    } catch {
      // The request interceptor reports the error; retain the existing policy.
      this.ready = false
    } finally {
      this.loading = false
    }
  },
  methods: {
    changeMode(mode) {
      if (mode === 'inherit') {
        this.$emit('change', [])
      } else if (this.available.length) {
        this.$emit(
          'change',
          this.available.map((item) => item.value)
        )
      }
    },
    changeSelection(value) {
      // The group includes hidden, retained values. Never filter them on save.
      this.$emit('change', value)
    }
  }
}
</script>

<style scoped>
.mfa-method-select {
  width: 100%;
}
.mfa-method-select .mfa-method-select__options.el-checkbox-group {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: 0 24px;
  width: 100%;
}
.mfa-method-select .mfa-method-select__options.el-checkbox-group :deep(.el-checkbox) {
  margin-right: 0;
  max-width: 100%;
  min-width: 0;
}
.mfa-method-select__options :deep(.el-checkbox__label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mfa-warning {
  color: var(--el-color-warning);
}
.help-block,
.mfa-warning {
  margin: 6px 0 0;
  line-height: 1.6;
}
</style>
