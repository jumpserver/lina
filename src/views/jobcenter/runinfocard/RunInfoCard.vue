<template>
  <IBox :fa="icon" :type="type" :title="title" v-bind="$attrs">
    <el-table class="el-table" style="width: 100%" :data="content" :show-header="false">
      <el-table-column width="150px" prop="hostname" />
      <el-table-column prop="result">
        <template slot-scope="scope">
          <span>{{ scope.row.result }}</span>
        </template>
      </el-table-column>
    </el-table>
  </IBox>
</template>

<script>
import IBox from '@/components/IBox'

export default {
  name: 'RunInfoCard',
  components: {
    IBox
  },
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
    },
    type: {
      type: String,
      default: 'primary'
    }
  }
}
</script>

<style scoped>

</style>
