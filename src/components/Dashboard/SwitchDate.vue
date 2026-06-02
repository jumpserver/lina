<template>
  <el-button-group class="switch">
    <el-button
      v-for="i in iOptions"
      :key="i.value"
      :class="{ 'is-active': select === i.value }"
      size="small"
      @click="onChange(i.value)"
    >
      {{ i.label }}
    </el-button>
  </el-button-group>
</template>

<script>
export default {
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
      select: this.days,
      iOptions: this.options.length > 0 ? this.options : defaultOptions
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
    if (days && days !== this.select) {
      this.select = days
      this.$emit('change', days)
    }
  },
  mounted() {
    this.$emit('change', this.select)
  },
  methods: {
    onChange(val) {
      this.select = val
      localStorage.setItem(this.name, val)
      this.$emit('change', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.switch {
  display: inline-flex;
  height: var(--button-height-sm, 32px);
  padding: 0;
  border: 1px solid var(--N200);
  border-radius: var(--radius-md, 6px);
  background: var(--surface-panel, #fff);
  font-weight: var(--font-weight-medium, 500);
  overflow: hidden;

  :deep(.el-button) {
    height: 30px;
    min-width: 56px;
    padding: 0 var(--space-3, 12px);
    border: 0;
    border-left: 1px solid var(--N200);
    border-radius: 0;
    background: var(--surface-panel, #fff);
    color: var(--N600);
    font-size: var(--font-size-sm, 13px);
    font-weight: var(--font-weight-medium, 500);
    line-height: 30px;
    box-shadow: none;

    &:first-child {
      border-left: 0;
    }

    &:hover {
      background: var(--N50);
      color: var(--N900);
    }
  }

  :deep(.el-button.is-active) {
    background: rgba(26, 179, 148, 0.08);
    color: var(--color-primary);
  }
}
</style>
