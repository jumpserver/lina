<template>
  <div class="report-toolbar">
    <div class="toolbar-left">
      <template v-if="showDateControls">
        <div class="toolbar-item">
          <span class="toolbar-label">{{ $t('TimeRange') }}</span>
          <el-select v-model="localRangePreset" size="mini" style="width: 130px" @change="emitChange">
            <el-option v-for="option in presetOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>

          <DatetimeRangePicker
            v-if="localRangePreset === 'custom'"
            :date-start="localDateRange?.[0]"
            :date-end="localDateRange?.[1]"
            @dateChange="onDateChange"
          />
        </div>
      </template>

      <div v-if="filterField" class="toolbar-item">
        <span class="toolbar-label">{{ filterLabel }}</span>
        <Select2
          v-model="localFilterValue"
          v-bind="filterSelect"
          style="width: 220px"
          @change="emitChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2.vue'
import DatetimeRangePicker from '@/components/Form/FormFields/DatetimeRangePicker.vue'
import { REPORT_RANGE_PRESET_OPTIONS } from './reportUtils'

export default {
  name: 'ReportToolbar',
  components: {
    Select2,
    DatetimeRangePicker
  },
  props: {
    showDateControls: {
      type: Boolean,
      default: true
    },
    isCustomReport: {
      type: Boolean,
      default: false
    },
    filterField: {
      type: String,
      default: ''
    },
    filterLabel: {
      type: String,
      default: ''
    },
    filterSelect: {
      type: Object,
      default: () => ({})
    },
    filters: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      presetOptions: REPORT_RANGE_PRESET_OPTIONS,
      localRangePreset: 'last_week',
      localDateRange: [],
      localFilterValue: ''
    }
  },
  watch: {
    filters: {
      immediate: true,
      deep: true,
      handler(val) {
        this.localRangePreset = val.range_preset || (val.start && val.end ? 'custom' : 'last_week')
        this.localDateRange = val.start && val.end ? [new Date(val.start), new Date(val.end)] : []
        this.localFilterValue = val.filter_value || ''
      }
    }
  },
  methods: {
    onDateChange(val) {
      this.localDateRange = val
      this.emitChange()
    },
    emitChange() {
      const payload = {
        filter_value: this.localFilterValue
      }
      if (this.showDateControls) {
        payload.range_preset = this.localRangePreset
        if (this.localRangePreset === 'custom') {
          payload.start = this.localDateRange?.[0] ? this.localDateRange[0].toISOString() : ''
          payload.end = this.localDateRange?.[1] ? this.localDateRange[1].toISOString() : ''
        }
      }
      this.$emit('filter-change', payload)
    }
  }
}
</script>

<style lang="scss" scoped>
.report-toolbar {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  width: 100%;

  &.chart-container {
    background: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
    max-width: none;
    min-width: 0;
  }
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-start;
  flex-wrap: wrap;

  .toolbar-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 30px;
  }

  .toolbar-label {
    color: #606266;
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
  }

  ::v-deep {
    .el-select,
    .select2,
    .el-date-editor {
      min-height: 30px;
    }
  }
}
</style>