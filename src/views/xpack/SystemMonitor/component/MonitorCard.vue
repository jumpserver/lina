<template>
  <div>
    <div style="font-size: 24px;font-weight: 300">
      <span>{{ (type).replace(/^\S/, s => s.toUpperCase()) }}</span>
    </div>
    <el-card class="box-card" shadow="never">
      <el-row :gutter="10">
        <el-col :span="18">
          <div style="padding-top: 6px;padding-bottom: 8px;">
            <h2 style="text-align: center;font-weight: 350">{{ $t('xpack.LoadStatus') }}</h2>
            <div class="progress">
              <div
                class="progress-bar progress-bar-success"
                role="progressbar"
                :style="{'width':toPercent(serviceData.normal) }"
              />
              <div
                class="progress-bar progress-bar-warning"
                role="progressbar"
                :style="{'width':toPercent(serviceData.high) }"
              />
              <div
                class="progress-bar progress-bar-danger"
                role="progressbar"
                :style="{'width':toPercent(serviceData.critical) }"
              />
            </div>
            <div style="display: flex;justify-content: space-around;font-size: 14px;">
              <span>
                <i class="el-icon-circle-check" style="color: #13CE66;" />
                {{ $t('xpack.NormalLoad') }}: {{ serviceData.normal }}
              </span>
              <span>
                <i class="el-icon-warning" style="color: #E6A23C;" />
                {{ $t('xpack.HighLoad') }}: {{ serviceData.high }}
              </span>
              <span>
                <i class="el-icon-circle-close" style="color: #FF4949;" />
                {{ $t('xpack.CriticalLoad') }}: {{ serviceData.critical }}
              </span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div style="height: 100%;width: 100%;padding-top: 8px;">
            <h2 style="text-align: center;font-weight: 350">{{ $t('dashboard.OnlineSessions') }}</h2>
            <div style="text-align: center;font-size: 30px;">
              {{ serviceData.session_active }}
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
    // koko/guacamole/omnidb/core
    type: {
      type: String,
      default: 'koko',
      required: true
    }
  },
  data() {
    return {
      baseUrl: `/api/v1/terminal/components/metrics/?type=`,
      serviceData: {

      }
    }
  },
  computed: {

  },
  mounted() {
    this.getServiceData()
  },
  methods: {
    async getServiceData() {
      const url = `${this.baseUrl}${this.type}`
      this.serviceData = await this.$axios.get(url)
    },
    toPercent(num) {
      return (Math.round(num / this.serviceData.total * 10000) / 100.00 + '%')// 小数点后两位百分比
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
