<template>
  <div class="content">
    <echarts
      ref="echarts"
      :options="options"
      :autoresize="true"
    />
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {
    options() {
      return {
        grid: {
          left: '2.5%',
          top: '0%',
          right: '2.8%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          name: '',
          nameLocation: 'center',
          nameGap: 35,
          nameTextStyle: {
            color: '#8796AD',
            fontSize: '16'
          },
          axisLabel: {
            interval: 10,
            rotate: 30,
            textStyle: {
              color: '#8796AD',
              fontSize: '14'
            }
          },
          data: [1,
            2,
            3,
            4,
            5
          ],
          axisLine: {
            lineStyle: {
              width: 2,
              color: '#BBBFC4'
            }
          },
          axisTick: {
            show: false
          }
        }],
        yAxis: [{
          type: 'value',
          name: '',
          nameLocation: 'middle',
          nameGap: 45,
          nameTextStyle: {
            color: '#8796AD',
            fontSize: '16'
          },
          axisLabel: {
            textStyle: {
              color: '#8796AD',
              fontSize: '14'
            }
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(160,160,160,0.3)'
            }
          }
        }],
        series: [{
          type: 'bar',
          name: '',
          stack: 1,
          barWidth: '20%',
          borderWidth: 0,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(50, 220, 182, 0.5)'
              },
              {
                offset: 1,
                color: 'rgba(50, 220, 182, 0)'
              }
              ], false)

            }
          },
          label: {
            normal: {
              show: false
            }
          },
          data: [10, 10, 20, 99, 30]
        },
        {
          type: 'bar',
          name: '',
          stack: 1,
          barWidth: '20%',
          itemStyle: {
            normal: {
              color: '#1ab394'
            }
          },
          label: {
            normal: {
              show: false
            }
          },
          data: [1, 1, 1, 1, 1]
        }
        ]
      }
    }
  },
  created() {

  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.echarts {
  width: 100%;
  height: 272px;
}

.content {
  .head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    .title {
      font-style: normal;
      font-weight: 500;
      font-size: 16px;
      line-height: 26px;
      color: #1F2329;
    }

    .icon {
      color: #BBBFC4;
      cursor: pointer;
    }

    .time {
      font-weight: 400;
      font-size: 10px;
      line-height: 26px;
      text-align: right;
      color: #8F959E;
    }
  }
}

</style>
