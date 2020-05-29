<template>
  <el-date-picker
    v-model="value"
    type="daterange"
    :range-separator="this.$t('common.To')"
    :start-placeholder="this.$t('common.StartDate')"
    :end-placeholder="this.$t('common.StartDate')"
    align="center"
    size="large"
    value-format="timestamp"
    :clearable="false"
    class="datepicker"
    @change="handleDateChange"
  />
</template>

<script>
export default {
  name: '',
  components: {},
  data() {
    return {
      value: ''
    }
  },
  computed: {

  },
  methods: {
    handleDateChange(val) {
      this.$emit('dateChange', val)
    }
  }
}
</script>

<style lang='less' scoped>
  .datepicker{
    width: 280px;
  }
  .el-input__inner{
    border: 1px solid #dcdee2;
    border-radius: 3px;
    height: 36px;
  }
  .el-date-editor /deep/ .el-input__icon{
    line-height: 28px;
  }
  .el-date-editor /deep/ .el-range-separator{
    line-height: 28px;
  }
</style>
