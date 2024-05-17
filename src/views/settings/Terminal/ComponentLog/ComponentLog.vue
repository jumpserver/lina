<template>
  <div>
    <div :class="device" class="table-header clearfix">
      <div class="search left">
        <div class="search-input">
          <el-select
            v-model="selectComponents"
            multiple
            collapse-tags
            :placeholder="$tc('Component')"
            @change="selectChange"
          >
            <el-option
              v-for="item in componentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="search-input">
          <el-input
            v-model="search"
            :placeholder="$tc('Search')"
            :validate-event="false"
            class="search-text"
            @focus="focus = true"
            @input="handleInput"
          />
        </div>
        <div class="search-input">
          <DatetimeRangePicker
            class="datepicker"
            v-bind="datePicker"
            @dateChange="handleDateChange"
          />
        </div>
        <div class="search-input">
          <ActionsGroup :actions="iconActions" :is-fa="true" class="right-side-actions right-side-item" />
        </div>
      </div>
    </div>
    <div>
      <el-table
        v-loading="loading"
        :data="componentLogs"
      >
        <el-table-column
          prop="component"
          header-align="center"
          align="center"
          :label="$tc('Component')"
          width="120px"
        />
        <el-table-column
          prop="message"
          align="left"
          :label="$tc('Message')"
        />
      </el-table>
    </div>
  </div>
</template>

<script>
import DatetimeRangePicker from '@/components/Form/FormFields/DatetimeRangePicker.vue'
import { getDaysAgo, getDaysFuture, openWindow } from '@/utils/common'
import { debounce } from 'lodash'
import { getLokiLog } from '@/api/component'
import ActionsGroup from '@/components/ActionsGroup'
import store from '@/store'
const all_components = []
const components_ce = [
  'web', 'core', 'koko', 'lion', 'magnus', 'chen',
  'jms_web', 'jms_core', 'jms_celery', 'jms_receptor', 'jms_koko', 'jms_lion', 'jms_chen'
]
const components_ee = [
  'xrdp', 'razor',
  'jms_razor', 'jms_xrdp'
]
all_components.push(...components_ce)
store.getters.hasValidLicense ? all_components.push(...components_ee) : null
all_components.sort((a, b) => {
  if (a.startsWith('jms_') && !b.startsWith('jms_')) {
    return 1
  }
  if (!a.startsWith('jms_') && b.startsWith('jms_')) {
    return -1
  }
  if (a.startsWith('jms_') && b.startsWith('jms_')) {
    return a.replace('jms_', '').localeCompare(b.replace('jms_', ''))
  }
  return a.localeCompare(b)
})

export default {
  name: 'ComponentLog',
  components: {
    DatetimeRangePicker,
    ActionsGroup
  },
  data() {
    return {
      loading: true,
      selectComponents: [],
      componentNames: all_components,
      search: '',
      isearch: '',
      datePicker: {
        dateStart: getDaysAgo(7).toISOString(),
        dateEnd: getDaysFuture(1).toISOString()
      },
      lokiData: []
    }
  },
  computed: {
    iconActions() {
      return [
        {
          name: 'actionRefresh',
          icon: 'refresh',
          tip: this.$t('Refresh'),
          has: true,
          callback: this.refresh_component_logs.bind(this)
        },
        {
          name: 'tailLog',
          icon: 'file',
          tip: this.$t('TailLog'),
          has: this.selectComponents.length > 0,
          callback: this.openTailLogWindow.bind(this)
        }
      ]
    },
    device() {
      if (this.$store.state.app.device === 'mobile') {
        return 'mobile'
      }
      return ''
    },
    componentLogs() {
      const data = this.lokiData.map(item => {
        const component = item.stream['component']
        return item.values.map(value => {
          return { component: this.component_label(component), time: value[0], message: value[1] }
        })
      })
      return [].concat(...data)
    },
    componentOptions() {
      return this.componentNames.map(item => {
        return {
          value: item,
          label: this.component_label(item)
        }
      })
    }
  },
  mounted() {
    this.refresh_component_logs()
  },
  methods: {
    component_label(item) {
      let label = item
      if (label.startsWith('jms_')) {
        label = label.replace('jms_', '')
        label = `${label}_stdout`
      }
      return label
    },
    handleDateChange: debounce(function(value) {
      this.datePicker = {
        dateStart: value[0].toISOString(),
        dateEnd: value[1].toISOString()
      }
      this.refresh_component_logs()
    }, 500),
    handleInput: debounce(function() {
      this.isearch = this.search
      this.refresh_component_logs()
    }, 1000),
    selectChange: debounce(function(val) {
      this.refresh_component_logs()
    }, 1000),
    refresh_component_logs() {
      const startTime = new Date(this.datePicker.dateStart)
      const endTime = new Date(this.datePicker.dateEnd)
      const data = {
        start: Math.floor(startTime / 1000),
        end: Math.floor(endTime / 1000),
        search: this.isearch,
        components: this.selectComponents.join('|')
      }
      this.loading = true
      getLokiLog(data)
        .then(response => {
          this.lokiData = response
        })
        .catch(error => {
          console.log(error)
        }).finally(() => {
          this.loading = false
        })
    },
    openTailLogWindow() {
      const data = {
        components: this.selectComponents.join('|'),
        search: this.isearch
      }
      const params = new URLSearchParams(data)
      const url = '/ui/#/terminal/components/loki/tail/?' + params.toString()
      openWindow(url)
    }
  }
}

</script>

<style lang="scss" scoped>
$innerHeight: 28px;
$headerHeight: 30px;

.table-header {
  .left-side {
    display: block;
    float: left;

    ::v-deep .action-item.el-dropdown > .el-button {
      height: 100%;
    }
  }

  .right-side {
    float: right;
  }

  .search {
    display: flex;
    flex-direction: row;

    .right-side-item.action-search {
      height: $headerHeight;
    }
  }

  .search.left {
    float: left;
    padding: 0 !important;
  }

  .search.right {
    float: right;
  }
  padding-bottom: 10px;
}

.search-text >>>.el-input__inner{
  height: 30px;
}

.mobile .search {
  display: inherit;
}

.mobile .search .datepicker {
  margin-left: 0;
}

.mobile .search.right {
  float: none;
}

.mobile .search.right .action-search {
  width: 100%;
}

.mobile .right-side {
  padding-top: 5px;
}

.right-side-actions.right-side-item {
  display: flex;
  align-items: center;
  justify-content:center;
  padding-left: 10px;
  height: 30px;
  line-height: 30px;

  ::v-deep .el-button {
    border: none;
    padding: 5px;
    font-size: 14px;
    color: var(--color-icon-primary);
    background-color: transparent;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  ::v-deep .fa {
    height: 16px;
    width: 16px;
  }
}
</style>
