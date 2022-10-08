<template>
  <div style="padding-left: 5%;">
    <div v-if="isShowEmpty" style="text-align: center">
      {{ this.$t('common.NoContent') }}
    </div>
    <div v-else>
      <el-card class="box-card" style="width: 46%; display: inline-block">
        <div slot="header">
          <span>{{ this.$t('audits.BeforeChange') }}</span>
        </div>
        <div v-for="(value, key, index) in row.before" :key="index" class="text item">
          {{ key }}: {{ value }}
        </div>
      </el-card>
      <el-card class="box-card" style="width: 46%; display: inline-block">
        <div slot="header">
          <span>{{ this.$t('audits.AfterChange') }}</span>
        </div>
        <div v-for="(value, key, index) in row.after" :key="index" class="text item">
          {{ key }}: {{ value }}
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>

export default {
  name: 'TwoTabFormatter',
  props: {
    row: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    isShowEmpty() {
      const condition1 = !this.row.before && !this.row.after
      const condition2 = JSON.stringify(this.row.after) === '{}' && JSON.stringify(this.row.before) === '{}'
      return condition1 || condition2
    }
  }
}

</script>

<style scoped>

</style>
