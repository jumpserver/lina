<template>
  <Page>
    <el-row :gutter="40">
      <el-col :lg="12" :md="24">
        <MonitorCard type="koko" class="monitorCard" />
      </el-col>
      <el-col :lg="12" :md="24">
        <MonitorCard type="guacamole" class="monitorCard" />
      </el-col>
      <el-col :lg="12" :md="24">
        <MonitorCard type="omnidb" class="monitorCard" />
      </el-col>
    </el-row>
  </Page>
</template>lg

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
  //margin-bottom: 20px;
  padding: 20px 30px;
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
