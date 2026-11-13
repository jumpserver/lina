<template>
  <el-input
    :model-value="amount"
    :aria-label="label"
    :disabled="disabled"
    inputmode="decimal"
    @update:model-value="updateAmount"
  >
    <template #suffix>
      <el-select
        :model-value="unit"
        :aria-label="$t('Unit')"
        :disabled="disabled"
        :validate-event="false"
        class="duration-unit"
        @update:model-value="updateUnit"
      >
        <el-option :label="$t('Minute')" :value="1" />
        <el-option :label="$t('Hour')" :value="60" />
        <el-option :label="$t('Days')" :value="1440" />
      </el-select>
    </template>
  </el-input>
</template>

<script>
const displayAmount = (minutes, unit) =>
  Number.isFinite(minutes) ? Number((minutes / unit).toFixed(6)).toString() : ''

function toMinutes(amount, unit) {
  const text = amount.trim()
  if (!text) return ''
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return NaN
  const number = Number(text)
  const minutes = Math.round(number * unit)
  // Accept the same precision used to display repeating hour or day fractions.
  return Number(displayAmount(minutes, unit)) === number ? minutes : NaN
}

export default {
  inheritAttrs: false,
  props: {
    modelValue: { type: [Number, String], default: '' },
    label: { type: String, required: true },
    disabled: Boolean
  },
  emits: ['update:modelValue'],
  data() {
    const minutes = this.modelValue
    const unit = [1440, 60].find((size) => minutes >= size && minutes % size === 0) ?? 1
    return { unit, amount: displayAmount(minutes, unit) }
  },
  watch: {
    modelValue(minutes) {
      if (!Object.is(minutes, toMinutes(this.amount, this.unit))) {
        this.amount = displayAmount(minutes, this.unit)
      }
    }
  },
  methods: {
    updateAmount(amount) {
      this.amount = amount
      this.$emit('update:modelValue', toMinutes(amount, this.unit))
    },
    updateUnit(unit) {
      const minutes = toMinutes(this.amount, this.unit)
      this.unit = unit
      if (Number.isFinite(minutes)) {
        this.amount = displayAmount(minutes, unit)
      } else {
        this.$emit('update:modelValue', toMinutes(this.amount, unit))
      }
    }
  }
}
</script>

<style scoped>
.duration-unit {
  width: 7em;
  margin-inline-start: 4px;
  border-inline-start: 1px solid var(--el-border-color-light);
}

.duration-unit :deep(.el-select__wrapper) {
  padding-inline: 8px 0;
  border: 0 !important;
  box-shadow: none;
  background: transparent;
}
</style>
