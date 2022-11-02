<template>
  <div>
    <div v-if="isShowEmpty" style="text-align: center">
      {{ this.$t('common.NoContent') }}
    </div>
    <div v-else>
      <el-row :gutter="10">
        <el-col :span="12">
          <el-alert type="info" effect="dark" :closable="false" style="width: 100%;">{{ row.leftTitle }}</el-alert>
          <div v-for="(value, key, index) in row.left" :key="index" class="text item">
            <el-tag type="info" :hit="true" style="width: 100%">{{ key }}: {{ value }}</el-tag>
          </div>
        </el-col>
        <el-col :span="12">
          <el-alert type="success" effect="dark" :closable="false" style="width: 100%;">{{ row.rightTitle }}</el-alert>
          <div v-for="(value, key, index) in row.right" :key="index">
            <el-tag type="info" :hit="true" style="width: 100%">{{ key }}: {{ value }}</el-tag>
          </div>
        </el-col>
      </el-row>
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
      const condition1 = !this.row.left && !this.row.right
      const condition2 = JSON.stringify(this.row.right) === '{}' && JSON.stringify(this.row.left) === '{}'
      return condition1 || condition2
    }
  }
}

</script>

<style scoped>

</style>
