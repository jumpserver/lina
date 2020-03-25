<template>
  <WrapperContent>
    <el-row class="content-main">
      <el-col :span="24">
        <tab :group="data" />
      </el-col>
      <!--    <el-col :span="8" style="background-color: #f3f3f4;">-->
      <!--      <card />-->
      <!--    </el-col>-->
    </el-row>
  </WrapperContent>
</template>

<script>
import { WrapperContent } from '@/layout/components'
import { Tab } from './components'
import { getUserGroup } from '@/api/user'
export default {
  components: {
    Tab,
    WrapperContent
    // Card
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

</style>
