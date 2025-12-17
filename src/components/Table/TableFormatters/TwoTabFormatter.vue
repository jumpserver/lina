<template>
  <el-row :gutter="10">
    <div v-if="isAllEmpty()" style="text-align: center">
      {{ this.$t('NoContent') }}
    </div>
    <div v-else>
      <el-col :span="rightEmpty() ? 24 : 12">
        <div v-if="!leftEmpty()">
          <el-tag :closable="false" effect="dark" style="width: 100%;" type="primary">{{ row.leftTitle }}</el-tag>
          <div v-for="(value, key, index) in row.left" :key="index">
            <el-tag type="primary"><strong>{{ key }}: </strong>{{ value }}</el-tag>
          </div>
        </div>
      </el-col>
      <el-col :span="leftEmpty() ? 24 : 12">
        <div v-if="!rightEmpty()">
          <el-tag :closable="false" effect="dark" style="width: 100%;" type="primary">{{ row.rightTitle }}</el-tag>
          <div v-for="(value, key, index) in row.right" :key="index">
            <el-tag type="primary"><strong>{{ key }}: </strong>{{ value }}</el-tag>
          </div>
        </div>
      </el-col>
    </div>
  </el-row>
</template>

<script lang="jsx">

export default {
  name: 'TwoTabFormatter',
  props: {
    row: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    isEmpty(content) {
      return !content || JSON.stringify(content) === '{}'
    },
    leftEmpty() {
      return this.isEmpty(this.row.left)
    },
    rightEmpty() {
      return this.isEmpty(this.row.right)
    },
    isAllEmpty() {
      return this.leftEmpty() && this.rightEmpty()
    }
  }
}

</script>

<style scoped>
  .el-tag{
    width: 100%;
    white-space: normal;
    height:auto;
}
</style>
