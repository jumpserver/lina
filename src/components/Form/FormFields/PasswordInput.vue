<template>
  <div class="password-input">
    <el-input
      ref="passwordInput"
      :model-value="modelValue"
      v-bind="inputAttrs"
      :show-password="showPassword"
      class="password-input__field"
      type="password"
      @blur="handleNativeBlur"
      @change="syncNativeValue"
      @focus="startNativeValueObserver"
      @update:model-value="handleInput"
    />
    <template v-if="showStrengthMeter">
      <div v-show="modelValue" class="password-input__meter-wrap">
        <PasswordStrengthMeter
          v-bind="meterAttrs"
          v-model="modelValue"
          :strength-meter-only="true"
          class="password-input__meter"
          @feedback="handleFeedback"
          @score="handleScore"
        />
      </div>
    </template>
  </div>
</template>

<script>
import PasswordStrengthMeter from 'vue-password-strength-meter'
import 'vue-password-strength-meter/style.css'

export default {
  name: 'PasswordInput',
  components: {
    PasswordStrengthMeter
  },
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ''
    },
    attrs: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['feedback', 'input', 'score', 'update:modelValue'],
  data() {
    return {
      lastEmittedValue: this.value,
      nativeValueCheckTimer: null
    }
  },
  computed: {
    modelValue: {
      get() {
        return this.value
      },
      set(value) {
        this.handleInput(value)
      }
    },
    showPassword() {
      return this.attrs.toggle !== false
    },
    showStrengthMeter() {
      return !!this.attrs.showStrengthMeter
    },
    inputAttrs() {
      const {
        badge,
        defaultClass,
        disabledClass,
        errorClass,
        labelHide,
        labelShow,
        referenceValue,
        secureLength,
        showPassword,
        showStrengthMeter,
        strengthMeterClass,
        strengthMeterFillClass,
        strengthMeterOnly,
        successClass,
        toggle,
        userInputs,
        ...rest
      } = this.attrs || {}
      return rest
    },
    meterAttrs() {
      const {
        badge,
        defaultClass,
        disabledClass,
        errorClass,
        labelHide,
        labelShow,
        referenceValue,
        secureLength,
        showPassword,
        showStrengthMeter,
        strengthMeterClass,
        strengthMeterFillClass,
        successClass,
        toggle,
        userInputs
      } = this.attrs || {}

      return {
        badge,
        defaultClass,
        disabledClass,
        errorClass,
        labelHide,
        labelShow,
        referenceValue,
        secureLength,
        showPassword,
        showStrengthMeter,
        strengthMeterClass,
        strengthMeterFillClass,
        successClass,
        toggle,
        userInputs
      }
    }
  },
  watch: {
    value(value) {
      this.lastEmittedValue = value
    }
  },
  beforeUnmount() {
    this.clearNativeValueObserver()
  },
  methods: {
    clearNativeValueObserver() {
      if (this.nativeValueCheckTimer === null) {
        return
      }
      window.clearInterval(this.nativeValueCheckTimer)
      this.nativeValueCheckTimer = null
    },
    getNativeInput() {
      return this.$refs.passwordInput?.input
    },
    handleFeedback(value) {
      this.$emit('feedback', value)
    },
    handleInput(value) {
      this.lastEmittedValue = value
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
    },
    handleNativeBlur() {
      this.syncNativeValue()
      this.clearNativeValueObserver()
    },
    handleScore(value) {
      this.$emit('score', value)
    },
    startNativeValueObserver() {
      this.clearNativeValueObserver()
      this.syncNativeValue()
      this.nativeValueCheckTimer = window.setInterval(() => {
        this.syncNativeValue()
      }, 120)
    },
    syncNativeValue() {
      const value = this.getNativeInput()?.value
      if (typeof value !== 'string') {
        return
      }
      if (value === this.value || value === this.lastEmittedValue) {
        return
      }
      this.handleInput(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.password-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 100%;
}

.password-input__field {
  width: 100%;
  max-width: 100%;
}

.password-input__meter-wrap {
  width: 100%;
  max-width: 100%;
}

.password-input__meter-wrap :deep(.Password) {
  width: 100%;
  max-width: none;
  margin: 0;
}

// 分段式强度条：轨道 + 20/40/60/80% 处的白色间隙分成 5 段（间隙由 :before/:after 提供），
// 不做整体药丸圆角/overflow:hidden，否则会糊成一整条连续进度条。
.password-input__meter-wrap :deep(.Password__strength-meter) {
  width: 100%;
  height: 6px;
  margin: 0;
  background: #ebeef5;
  border-radius: 2px;
}

.password-input__meter-wrap :deep(.Password__strength-meter:before),
.password-input__meter-wrap :deep(.Password__strength-meter:after) {
  height: 100%;
  border-color: #fff;
  border-width: 0 4px;
}

.password-input__meter-wrap :deep(.Password__strength-meter--fill) {
  border-radius: 2px;
}

.password-input__meter-wrap :deep(.Password__strength-meter--fill[data-score='0']) {
  background: var(--color-danger);
}

.password-input__meter-wrap :deep(.Password__strength-meter--fill[data-score='1']) {
  background: #ff7d5c;
}

.password-input__meter-wrap :deep(.Password__strength-meter--fill[data-score='2']) {
  background: var(--color-warning);
}

.password-input__meter-wrap :deep(.Password__strength-meter--fill[data-score='3']) {
  background: #7bc96f;
}

.password-input__meter-wrap :deep(.Password__strength-meter--fill[data-score='4']) {
  background: var(--color-success);
}
</style>
