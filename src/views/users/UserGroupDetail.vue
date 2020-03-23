<template>
  <el-row class="content-main">
    <el-col :span="16">
      <tab :group="data" />
    </el-col>
    <el-col :span="8" style="background-color: #f3f3f4;">
      <card />
    </el-col>
  </el-row>
</template>

<script>
import { Card, Tab } from './components'
import { getUserGroup } from '@/api/user'
export default {
  components: {
    Tab,
    Card
  },
  data() {
    return {
      data: {}
    }
  },
  mounted() {
    this.getGroupDetail()
  },
  methods: {
    getGroupDetail: function() {
      getUserGroup(this.$route.params.id).then(response => {
        this.data = response
      })
    }
  }
}
</script>

<style lang='less' scoped>
 .content-main{
    text-align: start;
    width: 98%;
    margin-left:1% !important;
    margin-top: 1%;
    margin-bottom: 1%;
  }
</style>
