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
  methods: {
    onChange(val) {
      this.$emit('change', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.switch {
  padding: 4px;

  ::v-deep .el-radio-button {
    .el-radio-button__inner {
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      background: #ffffff;
      border-radius: 0;
    }

    &.is-active {
      .el-radio-button__inner {
        border: 1px solid #1ab394;
        color: #1ab394;
        background-color: #FFF;
      }
    }
  }

  & >>> .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    box-shadow: none;
  }
}
</style>
