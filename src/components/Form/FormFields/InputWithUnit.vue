<template>
  <el-input v-bind="$attrs" v-on="$listeners">
    <template #append>{{ iUnit }}</template>
  </el-input>
</template>

<script>
export default {
  name: 'InputWithUnit',
  props: {
    unit: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      defaultValue: 24,
      displayMapper: {
        'second': this.$t('Second'), // 'sec' is the default value of 'unit
        'min': this.$t('Minute'), // 'min' is the default value of 'unit
        'hour': this.$t('Hour'), // 'hour' is the default value of 'unit
        'day': this.$t('Day'), // 'day' is the default value of 'unit
        'week': this.$t('Week'), // 'week' is the default value of 'unit
        'month': this.$t('Month'), // 'month' is the default value of 'unit
        'year': this.$t('Year') // 'year' is the default value of 'unit
      }
    }
  },
  computed: {
    iUnit() {
      return this.displayMapper[this.unit] || this.unit
    }
  }
}
</script>

<style scoped>

:deep(.el-input-group__append) {
  color: inherit;
  padding: 0 15px;
}

</style>
