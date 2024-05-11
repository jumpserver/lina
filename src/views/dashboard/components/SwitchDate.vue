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
  background: #EFF0F1;
  border-radius: 4px;
  padding: 1px 4px;

  & >>> .el-radio-button {
    .el-radio-button__inner {
      border: none;
      color: #8F959E;
      background: #EFF0F1;
    }

    &.is-active {
      border-radius: 4px;
      padding: 4px 0;

      .el-radio-button__inner {
        color: var(--color-text-primary);
        background-color: #FFF;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(31 35 41 / 12%) !important;
      }
    }
  }

  & >>> .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    box-shadow: none;
  }
}
</style>
