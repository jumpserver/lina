<template>
  <div>
    <el-row :gutter="16">
      <el-col :lg="12" :sm="12">
        <DataCard />
      </el-col>
      <el-col :lg="12" :sm="12">
        <DataCard />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import DataCard from './components/DataCard.vue'
export default {
  components: {
    DataCard
  },
  props: {

  },
  data() {
    return {

    }
  },
  created() {

  },
  methods: {

  }
}
</script>

<style scoped>
.left, .right {
  display: inline-block;
}
</style>
