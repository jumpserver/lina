<template>
  <el-card class="box-card primary box-margin">
    <div slot="header" class="clearfix">
      <i v-if="icon" :class="'fa ' + icon" />
      <span>{{ title }}</span>
    </div>
    <div>
      <el-table class="el-table" style="width: 100%" :data="content" :show-header="false">
        <el-table-column width="150px" prop="hostname" />
        <el-table-column prop="result">
          <template slot-scope="scope">
            <span>{{ scope.row.result }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'RunInfoCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    content: {
      type: Array,
      default: () => []
    },
    url: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
  .box-margin {
    margin-bottom: 20px;
  }
</style>
