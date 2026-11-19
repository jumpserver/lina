<template>
  <SegmentedControl
    :model-value="select"
    :options="segmentedOptions"
    :aria-label="$t('Date')"
    @change="onChange"
  />
</template>

<script>
import { scopedLocalStorage as localStorage } from '@/utils/storage'
import SegmentedControl from '@/components/Common/SegmentedControl/index.vue'

export default {
  components: { SegmentedControl },
  emits: ['change'],
  props: {
    name: {
      type: String,
      default: 'dashboardDays'
    },
    days: {
      type: [String, Number],
      default: null
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const defaultOptions = [
      {
        label: this.$t('Today'),
        value: '1'
      },
      {
        label: this.$t('Last7Days'),
        value: '7'
      },
      {
        label: this.$t('Last30Days'),
        value: '30'
      }
    ]
    return {
      select: this.days == null ? null : String(this.days),
      iOptions: this.options.length > 0 ? this.options : defaultOptions
    }
  },
  computed: {
    segmentedOptions() {
      return this.iOptions.map((option) => ({ ...option, value: String(option.value) }))
    }
  },
  watch: {
    days(val) {
      if (val != null && String(val) !== this.select) {
        this.select = String(val)
      }
    }
  },
  created() {
    let days = this.days
    if (!days) {
      days = this.$route.query.days
    }
    if (!days) {
      days = localStorage.getItem(this.name)
    }
    if (!days) {
      days = '7'
    }
    if (days && String(days) !== this.select) {
      this.select = String(days)
      this.$emit('change', this.select)
    }
  },
  mounted() {
    this.$emit('change', this.select)
  },
  methods: {
    onChange(val) {
      const days = String(val)
      this.select = days
      localStorage.setItem(this.name, days)
      this.$emit('change', days)
    }
  }
}
</script>
