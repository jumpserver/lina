<template>
  <div>
    <el-card class="box-card" shadow="never">
      <el-row :gutter="10">
        <el-col :md="19" :sm="24" style="padding-right: 15px;">
          <div>
            <div style="text-align: left;font-weight: 350; color: #000000;">
              <span class="name">{{ componentName }}</span>
            </div>
            <div class="type">
              <span v-for="(item) in componentTypes" :key="item.key">
                <i v-if="item.icon" :class="item.icon" :style="{color: item.color}" />
                <span style="color: #a3a3a4;">{{ item.name }}</span>
                <el-popover
                  v-if="componentMetric[item.key].length > 0"
                  width="280"
                  trigger="hover"
                  placement="bottom"
                  popper-class="monitor-popover"
                >
                  <ul>
                    <li v-for="(i, index) in componentMetric[item.key]" :key="index" @click="routeToList(i)">
                      {{ i }}
                    </li>
                  </ul>
                  <span slot="reference" class="num">
                    {{ componentMetric[item.key].length || 0 }}
                  </span>
                </el-popover>
                <span v-else>
                  {{ componentMetric[item.key] instanceof Array ? componentMetric[item.key].length : componentMetric[item.key] }}
                </span>
              </span>
            </div>
            <div class="progress" :class="componentMetric.type + '-progress'">
              <div style="position: absolute; height: 100%; padding: 2px 0;">
                <span v-for="(bar, index) in barArray" :key="index" class="box-bar" />
              </div>
            </div>
          </div>
        </el-col>
        <el-col :md="5" :sm="24" style="padding-left: 10px;">
          <div class="session">
            <div class="session-title" style="">
              {{ $t('dashboard.OnlineSessions') }}
            </div>
            <div style="text-align: center;font-size: 22px;">
              <i class="fa fa-comments-o" style="color: #00c360;" />
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
  components: {},
  props: {
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
  data() {
    return {
      resizeObserver: null,
      barArray: new Array(77).fill(0).map((item, index) => index + 1),
      typeWidths: {
        normal: this.toPercent(this.componentMetric.normal),
        high: this.toPercent(this.componentMetric.high),
        critical: this.toPercent(this.componentMetric.critical),
        offline: this.toPercent(this.componentMetric.offline)
      }
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
        razor: 'Razor',
        core: 'Core',
        celery: 'Celery',
        magnus: 'Magnus',
        tinker: 'Tinker',
        chen: 'Chen',
        kael: 'Kael',
        video_worker: 'Video-Worker',
        panda: 'Panda'
      }
      return nameMapper[this.componentMetric.type]
    },
    componentTypes() {
      const types = [
        {
          name: this.$t('dashboard.Total'),
          key: 'total',
          color: '#13CE66'
        },
        {
          name: this.$t('xpack.NormalLoad'),
          key: 'normal',
          color: '#13CE66',
          icon: 'el-icon-circle-check'
        },
        {
          name: this.$t('xpack.HighLoad'),
          key: 'high',
          color: '#E6A23C',
          icon: 'el-icon-bell'
        },
        {
          name: this.$t('xpack.CriticalLoad'),
          key: 'critical',
          color: '#FF4949',
          icon: 'el-icon-message-solid'
        },
        {
          name: this.$t('xpack.Offline'),
          key: 'offline',
          color: '#bfbaba',
          icon: 'el-icon-circle-close'
        }
      ]
      return types
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.resizeObserver = new ResizeObserver(this.setBarColor)
      this.resizeObserver.observe(document.querySelector('.box-card'))
    })
  },
  beforeDestroy() {
    const el = document.querySelector('.box-card')
    if (el) {
      this.resizeObserver.unobserve(el)
    }
    this.resizeObserver = null
  },
  methods: {
    setElementsColor(numArray) {
      const className = `.${this.componentMetric.type}-progress .box-bar`
      const elements = document.querySelectorAll(className)
      numArray.reduce((prev, cur) => {
        for (let i = prev; i < (cur.num + prev) && i < elements.length; i++) {
          elements[i].style.backgroundColor = cur.color
        }
        return cur.num + prev
      }, 0)
    },
    setBarColor() {
      const el = document.querySelector(`.${this.componentMetric.type}-progress`)
      if (!el) return

      const numArray = []
      const { normal, high, critical, offline } = this.typeWidths
      const width = _.round(parseFloat(window.getComputedStyle(el).width), 2)

      const normalWidth = normal ? width * normal / 100 : normal
      const highWidth = high ? width * high / 100 : high
      const criticalWidth = critical ? width * critical / 100 : critical
      const offlineWidth = offline ? width * offline / 100 : offline

      const normalBarNum = _.round(normalWidth / 10)
      const highBarNum = _.round(highWidth / 10)
      const criticalBarNum = _.round(criticalWidth / 10)
      const offlineBarNum = _.round(offlineWidth / 10)

      numArray.push(
        {
          color: '#13CE66',
          num: normalBarNum
        },
        {
          color: '#E6A23C',
          num: highBarNum
        },
        {
          color: '#FF4949',
          num: criticalBarNum
        },
        {
          color: '#bfbaba',
          num: offlineBarNum
        }
      )
      this.setElementsColor(numArray)
    },
    toPercent(num) {
      num = num instanceof Array ? num.length : num
      return (Math.round(num / this.componentMetric.total * 10000) / 100.00) // 小数点后两位百分比
    },
    routeToList(name) {
      this.$router.replace({
        name: 'TerminalSetting',
        query: {
          activeTab: 'TerminalList',
          name: name
        }
      })
    }
  }
}
</script>

<style lang="scss">
.el-popover.el-popper.monitor-popover {
  ul {
    padding-left: 15px;
    margin: 0;
    li {
      line-height: 24px;
      color: var(--color-primary);
      cursor: pointer;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      &:hover {
        filter: opacity(65%)!important;
      }
    }
  }
}
</style>

<style lang="less" scoped>
.echarts {
  width: 100%;
  height: 150px;
}
.name {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 18px;
  color: #000000;
}

.type {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
  .num {
    margin-left: 2px;
    cursor: pointer;
    color: #00c360;
  }
}

.progress {
  position: relative;
  width: 100%;
  height: 24px;
  overflow: hidden;
  border-radius: 4px;
}

.progress-bar {
  float: left;
  width: 0;
  height: 100%;
  font-size: 12px;
  line-height: 20px;
  padding: 2px 0;
  color: #fff;
  -webkit-transition: width .6s ease;
  -o-transition: width .6s ease;
  transition: width .6s ease;
  overflow: hidden;
}

.box-bar {
  display: inline-block;
  width: 5px !important;
  height: 100%;
  margin-right: 5px;
  border-radius: 4px;
  background-color: currentColor;
  &:hover {
    transform: scale(1.2);
  }
  &:last-child {
    margin-right: 0;
  }
}

.session {
  margin-top: 13px;
  border-left: 1px solid #f3f3f3;
  .session-title {
    margin-bottom: 8px;
    color: #a3a3a4;
    text-align: center;
    font-weight: 350;
    font-size: 14px;
  }
}
</style>
