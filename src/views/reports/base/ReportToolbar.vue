<template>
  <div class="report-toolbar">
    <SwitchDate :name="storageKey" :days="localDays" @change="emitChange" />
  </div>
</template>

<script>
import SwitchDate from '@/components/Dashboard/SwitchDate.vue'

export default {
  name: 'ReportToolbar',
  components: {
    SwitchDate
  },
  props: {
    filters: {
      type: Object,
      default: () => ({})
    },
    reportName: {
      type: String,
      default: 'reportDays'
    }
  },
  data() {
    return {
      localDays: '7'
    }
  },
  computed: {
    storageKey() {
      return this.reportName || this.$route?.name || 'reportDays'
    }
  },
  watch: {
    filters: {
      immediate: true,
      deep: true,
      handler(val) {
        this.localDays = String(val.days || '7')
      }
    }
  },
  methods: {
    emitChange(days) {
      this.localDays = String(days || '7')
      this.$emit('filter-change', { days: this.localDays })
    }
  }
}
</script>

<style lang="scss" scoped>
.report-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  width: 100%;
}
</style>
