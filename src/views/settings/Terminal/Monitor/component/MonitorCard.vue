<template>
  <div>
    <div style="font-size: 24px;font-weight: 300">
      <span>{{ componentName }} ( {{ componentMetric.total }} )</span>
    </div>
    <el-card class="box-card" shadow="never">
      <el-row :gutter="10">
        <el-col :md="18" :sm="24">
          <div style="padding-top: 6px;padding-bottom: 8px;">
            <h2 style="text-align: center;font-weight: 350">{{ $t('xpack.LoadStatus') }}</h2>
            <div class="progress">
              <div
                class="progress-bar progress-bar-success"
                role="progressbar"
                :style="{'width':toPercent(componentMetric.normal) }"
              />
              <div
                class="progress-bar progress-bar-warning"
                role="progressbar"
                :style="{'width':toPercent(componentMetric.high) }"
              />
              <div
                class="progress-bar progress-bar-danger"
                role="progressbar"
                :style="{'width':toPercent(componentMetric.critical) }"
              />
              <div
                class="progress-bar progress-bar-offline"
                role="progressbar"
                :style="{'width':toPercent(componentMetric.offline) }"
              />
            </div>
            <div style="display: flex;justify-content: space-around;font-size: 14px;">
              <span>
                <i class="el-icon-circle-check" style="color: #13CE66;" />
                {{ $t('xpack.NormalLoad') }}: {{ componentMetric.normal }}
              </span>
              <span>
                <i class="el-icon-bell" style="color: #E6A23C;" />
                {{ $t('xpack.HighLoad') }}: {{ componentMetric.high }}
              </span>
              <span>
                <i class="el-icon-message-solid" style="color: #FF4949;" />
                {{ $t('xpack.CriticalLoad') }}: {{ componentMetric.critical }}
              </span>
              <span>
                <i class="el-icon-circle-close" style="color: #bfbaba;" />
                {{ $t('xpack.Offline') }}: {{ componentMetric.offline }}
              </span>
            </div>
          </div>
        </el-col>
        <el-col :md="6" :sm="24">
          <div style="height: 100%;width: 100%;padding-top: 8px;">
            <h2 style="text-align: center;font-weight: 350">{{ $t('dashboard.OnlineSessions') }}</h2>
            <div style="text-align: center;font-size: 30px;">
              {{ componentMetric.session_active }}
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>

export default {
  name: 'MonitorCard',
  components: {
  },
  props: {
    // koko/guacamole/omnidb/lion/core
    type: {
      type: String,
      default: 'koko',
      required: true
    },
    componentMetric: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    componentName() {
      const nameMapper = {
        koko: 'KoKo',
        omnidb: 'OmniDB',
        guacamole: 'Guacamole',
        lion: 'Lion',
        xrdp: 'XRDP',
        core: 'Core',
        celery: 'Celery',
        magnus: 'Magnus'
      }
      return nameMapper[this.componentMetric.type]
    }
  },
  methods: {
    toPercent(num) {
      return (Math.round(num / this.componentMetric.total * 10000) / 100.00 + '%')// 小数点后两位百分比
    }
  }
}
</script>

<style lang='less' scoped>

.echarts {
  width: 100%;
  height: 150px;
}
.el-card ::v-deep .el-card__body{
  padding-top: 0;
  padding-bottom: 0;
}
.progress {
  height: 20px;
  margin-bottom: 20px;
  overflow: hidden;
  background-color: #f5f5f5;
  border-radius: 4px;
}
.progress-bar-success{
  background-color: #13CE66 !important;
}
.progress-bar-warning{
  background-color: #E6A23C !important;
}
.progress-bar-danger{
  background-color: #FF4949 !important;
}
.progress-bar-offline{
  background-color: #bfbaba !important;
}
.progress-bar {
  float: left;
  width: 0;
  height: 100%;
  font-size: 12px;
  line-height: 20px;
  color: #fff;
  text-align: center;
  background-color: #337ab7;
  -webkit-transition: width .6s ease;
  -o-transition: width .6s ease;
  transition: width .6s ease;
}
</style>
