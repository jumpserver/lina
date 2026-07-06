<template>
  <div class="password-input">
    <el-input
      :model-value="modelValue"
      v-bind="inputAttrs"
      :show-password="showPassword"
      class="password-input__field"
      type="password"
      @update:model-value="handleInput"
    />
    <div v-if="showStrengthMeter" class="password-input__meter-wrap">
      <PasswordStrengthMeter
        v-bind="meterAttrs"
        v-model="modelValue"
        :strength-meter-only="true"
        class="password-input__meter"
        @feedback="handleFeedback"
        @score="handleScore"
      />
    </div>
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
  methods: {
    handleFeedback(value) {
      this.$emit('feedback', value)
    },
    handleInput(value) {
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
    },
    handleScore(value) {
      this.$emit('score', value)
    }
  }
}
</script>

<style lang="scss" scoped>
.password-input {
  display: inline-flex;
  flex-direction: column;
  gap: 10px;
  width: auto;
  max-width: 100%;
}

.password-input__field {
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

.password-input__meter-wrap :deep(.Password__strength-meter) {
  width: 100%;
  height: 6px;
  margin: 0;
  background: #ebeef5;
  border-radius: 999px;
  overflow: hidden;
}

.password-input__meter-wrap :deep(.Password__strength-meter:before),
.password-input__meter-wrap :deep(.Password__strength-meter:after) {
  height: 100%;
  border-color: #ebeef5;
  border-width: 0 4px;
}

.password-input__meter-wrap :deep(.Password__strength-meter--fill) {
  border-radius: 999px;
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
