<template>
  <Page>
    <el-row :gutter="40">
      <el-col :lg="8" :offset="4" class="monitorCard">
        <MonitorCard type="koko" />
      </el-col>
      <el-col :lg="8" class="monitorCard">
        <MonitorCard type="guacamole" />
      </el-col>
      <el-col :offset="4" :lg="8" class="monitorCard">
        <MonitorCard type="omniDB" />
      </el-col>
    </el-row>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page/index'
import MonitorCard from '@/views/xpack/SystemMonitor/component/MonitorCard'

export default {
  name: 'SystemMonitor',
  components: {
    Page,
    MonitorCard
  },
  data() {
    return {

    }
  },
  computed: {

  }
}
</script>

<style lang='less' scoped>
.monitorCard{
  margin-bottom: 20px
}
@media (min-width: 768px){
  .illo-desktop-header {
    position: relative;
    display: block !important;
    margin-bottom: -6%;
  }
}
img{
  vertical-align: middle;
  max-width: 100%;
  height: auto;
  border: 0;
}

</style>
