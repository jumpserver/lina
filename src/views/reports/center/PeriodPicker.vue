<template>
  <div :class="['report-period jms-form-controls', { 'is-compact': compact }]">
    <div class="period-controls">
      <el-radio-group v-model="kind" :disabled="disabled" @change="changeKind">
        <el-radio-button value="month">{{ $t('AuditReportMonth') }}</el-radio-button>
        <el-radio-button value="quarter">{{ $t('AuditReportQuarter') }}</el-radio-button>
        <el-radio-button value="year">{{ $t('AuditReportYear') }}</el-radio-button>
        <el-radio-button value="custom">{{ $t('AuditReportCustomRange') }}</el-radio-button>
      </el-radio-group>
      <div :class="['period-values', { 'quarter-values': kind === 'quarter' }]">
        <el-date-picker
          v-if="kind === 'month'"
          v-model="month"
          type="month"
          value-format="YYYY-MM"
          :clearable="false"
          :disabled="disabled"
          :disabled-date="futureDate"
          :aria-label="$t('AuditReportMonth')"
          @change="applyPreset"
        />
        <template v-if="kind === 'quarter'">
          <el-date-picker
            v-model="year"
            type="year"
            value-format="YYYY"
            :clearable="false"
            :disabled="disabled"
            :disabled-date="futureDate"
            :aria-label="$t('AuditReportYear')"
            @change="applyPreset"
          />
          <el-select
            v-model="quarter"
            :disabled="disabled"
            :aria-label="$t('AuditReportQuarter')"
            @change="applyPreset"
          >
            <el-option
              v-for="q in 4"
              :key="q"
              :label="$t('AuditReportQuarterNumber', { number: q })"
              :value="q"
              :disabled="isFutureQuarter(q)"
            />
          </el-select>
        </template>
        <el-date-picker
          v-if="kind === 'year'"
          v-model="year"
          type="year"
          value-format="YYYY"
          :clearable="false"
          :disabled="disabled"
          :disabled-date="futureDate"
          :aria-label="$t('AuditReportYear')"
          @change="applyPreset"
        />
        <el-date-picker
          v-if="kind === 'custom'"
          v-model="customRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          :clearable="false"
          :disabled="disabled"
          :disabled-date="futureDate"
          :start-placeholder="$t('AuditReportStartDate')"
          :end-placeholder="$t('AuditReportEndDate')"
          @change="applyCustom"
        />
      </div>
    </div>
    <p class="range-help">
      {{ $t('AuditReportRangeHint', { start: modelValue.start, end: modelValue.end }) }}
      <span v-if="modelValue.end === today">{{ $t('AuditReportUntilToday') }}</span>
    </p>
    <p v-if="error" class="range-error" role="alert">{{ error }}</p>
  </div>
</template>
<script>
import { localDate } from './api'

export default {
  name: 'AuditReportPeriodPicker',
  props: {
    modelValue: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
    compact: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    const date = new Date(`${this.modelValue.start}T12:00:00`)
    const today = localDate(new Date())
    const monthEnd = localDate(new Date(date.getFullYear(), date.getMonth() + 1, 0))
    const currentMonthToDate =
      this.modelValue.start.slice(0, 7) === today.slice(0, 7) && this.modelValue.end === today
    return {
      kind:
        this.modelValue.start.endsWith('-01') &&
        (this.modelValue.end === monthEnd || currentMonthToDate)
          ? 'month'
          : 'custom',
      month: this.modelValue.start.slice(0, 7),
      year: String(date.getFullYear()),
      quarter: Math.floor(date.getMonth() / 3) + 1,
      customRange: [this.modelValue.start, this.modelValue.end],
      error: ''
    }
  },
  computed: {
    today() {
      return localDate(new Date())
    }
  },
  watch: {
    modelValue: {
      deep: true,
      handler(value) {
        this.customRange = [value.start, value.end]
        this.month = value.start.slice(0, 7)
        this.year = value.start.slice(0, 4)
        this.quarter = Math.floor(Number(value.start.slice(5, 7) - 1) / 3) + 1
      }
    }
  },
  methods: {
    futureDate(date) {
      return localDate(date) > this.today
    },
    isFutureQuarter(q) {
      return `${this.year}-${String((q - 1) * 3 + 1).padStart(2, '0')}-01` > this.today
    },
    changeKind() {
      this.error = ''
      if (this.kind !== 'custom') this.applyPreset()
    },
    applyPreset() {
      let start, end
      if (this.kind === 'month') {
        const [year, month] = this.month.split('-').map(Number)
        start = localDate(new Date(year, month - 1, 1))
        end = localDate(new Date(year, month, 0))
      } else {
        const year = Number(this.year)
        const month = this.kind === 'quarter' ? (this.quarter - 1) * 3 : 0
        start = localDate(new Date(year, month, 1))
        end = localDate(new Date(year, month + (this.kind === 'quarter' ? 3 : 12), 0))
      }
      if (start > this.today) {
        this.error = this.$t('AuditReportFutureRange')
        return
      }
      this.update(start, end > this.today ? this.today : end)
    },
    applyCustom(value) {
      if (value?.length === 2) this.update(value[0], value[1])
    },
    update(start, end) {
      const days =
        (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000 + 1
      if (!Number.isFinite(days) || days <= 0 || days > 366 || end > this.today) {
        this.error = this.$t('AuditReportInvalidRange')
        this.customRange = [this.modelValue.start, this.modelValue.end]
        return
      }
      this.error = ''
      this.$emit('update:modelValue', { start, end })
      this.$emit('change', { start, end })
    }
  }
}
</script>
<style scoped lang="scss">
.report-period {
  width: 100%;
  min-width: 0;
}
.period-controls,
.period-values {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  min-width: 0;
}
.period-controls :deep(.el-radio-group) {
  flex: 0 0 auto;
  flex-wrap: nowrap;
}
.period-controls :deep(.el-radio-button) {
  display: inline-flex;
  min-width: 0;
  line-height: 1;
}
.period-controls :deep(.el-radio-button__inner) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  border: 1px solid var(--el-border-color);
  outline: none;
  padding: 7px 12px;
  font-size: 12px;
  line-height: 14px;
  font-weight: 400;
}
.period-controls :deep(.el-radio-button + .el-radio-button .el-radio-button__inner) {
  border-left-width: 0;
}
.period-controls :deep(.el-radio-button__original-radio:focus-visible + .el-radio-button__inner) {
  outline: 2px solid var(--el-color-primary);
  outline-offset: -2px;
  z-index: 1;
}
.period-values :deep(.el-date-editor--month),
.period-values :deep(.el-date-editor--year) {
  width: 140px;
}
.period-values :deep(.el-date-editor--daterange) {
  width: 320px;
  max-width: 100%;
  min-width: 0;
}
.period-values .el-select {
  width: 130px;
}
.range-help,
.range-error {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 18px;
  overflow-wrap: anywhere;
}
.range-help {
  color: var(--color-help-text);
}
.range-help span {
  display: inline-block;
  margin-left: 8px;
  color: var(--color-warning);
}
.range-error {
  color: var(--color-danger);
}
.is-compact {
  .period-controls,
  .period-values {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    width: 100%;
  }
  .quarter-values {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .period-controls :deep(.el-radio-group) {
    width: 100%;
  }
  .period-controls :deep(.el-radio-button) {
    flex: 1 1 0;
  }
  .period-controls :deep(.el-radio-button__inner) {
    width: 100%;
    padding-inline: 8px;
  }
  .period-values :deep(.el-date-editor),
  .period-values .el-select {
    width: 100%;
    min-width: 0;
  }
  .period-values :deep(.el-range-input) {
    min-width: 0;
    font-size: 12px;
  }
  .range-help span {
    display: block;
    margin-left: 0;
  }
}
@media (max-width: 600px) {
  .period-values {
    width: 100%;
  }
  .period-values :deep(.el-date-editor--daterange) {
    width: 100%;
  }
}
</style>
