<template>
  <div>
    <div :class="device" class="table-header clearfix">
      <div class="search left">
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

    <div v-loading="loading" class="cards">
      <card-log
        v-for="(card, index) in cardLogs"
        :key="index"
        :components="card.components"
        :title="card.title"
        :logs="card.logs"
        :search="isearch"
        class="card-log"
      />
    </div>
  </div>
</template>

<script>
import DatetimeRangePicker from '@/components/Form/FormFields/DatetimeRangePicker.vue'
import { getDaysAgo, getDaysFuture } from '@/utils/common'
import { debounce } from 'lodash'
import { getLokiLog } from '@/api/component'
import ActionsGroup from '@/components/ActionsGroup'
import store from '@/store'
import CardLog from './CardLog.vue'
const all_components = []
const components_ce = [
  {
    'title': 'Core',
    'components': ['core', 'jms_core']
  },
  {
    'title': 'Web',
    'components': ['web', 'jms_web']
  },
  {
    'title': 'Koko',
    'components': ['koko', 'jms_koko']
  },
  {
    'title': 'Lion',
    'components': ['lion', 'jms_lion']
  },
  {
    'title': 'Chen',
    'components': ['chen', 'jms_chen']
  },
  {
    'title': 'Magnus',
    'components': ['magnus']
  }
]

const components_ee = [
  {
    'title': 'Razor',
    'components': ['razor', 'jms_razor']
  },
  {
    'title': 'Xrdp',
    'components': ['xrdp', 'jms_xrdp']
  }
]
all_components.push(...components_ce)
store.getters.hasValidLicense ? all_components.push(...components_ee) : null

export default {
  name: 'ComponentLog',
  components: {
    DatetimeRangePicker,
    ActionsGroup,
    CardLog
  },
  data() {
    return {
      loading: true,
      search: '',
      isearch: '',
      datePicker: {
        dateStart: getDaysAgo(7).toISOString(),
        dateEnd: getDaysFuture(1).toISOString()
      },
      lokiData: [],
      cards: all_components
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
        }
      ]
    },
    device() {
      if (this.$store.state.app.device === 'mobile') {
        return 'mobile'
      }
      return ''
    },
    cardLogs() {
      const cards = this.cards.map(card => {
        return { title: card.title, components: card.components, logs: [] }
      })
      this.lokiData.forEach(item => {
        const componentName = item.stream['component']
        const log = item.values.map(value => {
          return { component: componentName, time: value[0], message: value[1] }
        })

        cards.forEach(card => {
          if (card.components.includes(componentName)) {
            card.logs = card.logs.concat(log)
          }
        })
      })
      // sort cards by logs length，the card with more logs will be displayed first
      cards.sort((a, b) => {
        return b.logs.length - a.logs.length
      })
      return cards
    }
  },
  mounted() {
    this.refresh_component_logs()
  },
  methods: {
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
        search: this.isearch
      }
      this.loading = true
      getLokiLog(data)
        .then(response => {
          this.lokiData = response
        }).catch(error => {
          this.$message.error(error)
        }).finally(() => {
          this.loading = false
        })
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
.card-log {
  margin-bottom: 10px;
}
</style>
