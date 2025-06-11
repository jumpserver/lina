<template>
  <span>
    <el-radio-group
      v-model="select"
      class="switch"
      size="mini"
      @change="onChange"
    >
      <el-radio-button v-for="i in iOptions" :key="i.value" :label="i.value">
        {{ i.label }}
      </el-radio-button>
    </el-radio-group>
  </span>
</template>

<script>
export default {
  props: {
    days: {
      type: String,
      default: () => {
        return localStorage.getItem('dashboardDays') || '7'
      }
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
    const days = this.$route.query.days
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
      this.$emit('change', val)
    }
  }
}
</script>

<style lang="scss" scoped>
$origin-color: #ffffff;

.switch {
  font-weight: 400;

  ::v-deep .el-radio-button {
    &.is-active {
      .el-radio-button__inner {
        border-color: var(--color-primary);
        color: var(--color-primary);
        background-color: $origin-color;
      }
    }
  }

  ::v-deep .el-radio-button {
    .el-radio-button__inner {
      color: var(--color-text-primary);
      background: $origin-color;
      border-radius: 0;
    }
  }
}
</style>
