<template>
  <div style="height:100%">
    <div :class="device" class="table-header clearfix">
      <div class="search left">
        <div class="search-input">
          <el-input
            ref="SearchInput"
            v-model="search"
            placeholder="search"
            :validate-event="false"
            @focus="focus = true"
            @input="handleInput"
            @keyup.enter.native="handleConfirm"
            @keyup.delete.native="handleDelete"
          />
        </div>
        <DatetimeRangePicker
          class="datepicker"
          v-bind="datePicker"
          @dateChange="handleDateChange"
        />
      </div>
    </div>
    <div style="width: 100%;height: 100%">
      <iframe
        allowtransparency="true"
        height="100%"
        width="100%"
        :src="iframeURL"
      />
    </div>
  </div>
</template>

<script>
import DatetimeRangePicker from '@/components/Form/FormFields/DatetimeRangePicker.vue'
import { getDaysAgo, getDaysFuture } from '@/utils/common'
import { debounce } from 'lodash'

const port = document.location.port ? ':' + document.location.port : ''
const BASE_URL = document.location.protocol + '//' + document.location.hostname + port
export default {
  name: 'GrafanaLog',
  components: {
    DatetimeRangePicker
  },
  data() {
    return {
      grafanaUrl: '/grafana/d/adjvunbsx8v0gb/jumpserver?orgId=1&kiosk&',
      search: '',
      isearch: '',
      datePicker: {
        dateStart: getDaysAgo(7).toISOString(),
        dateEnd: getDaysFuture(1).toISOString()
      }
    }
  },
  computed: {
    iframeURL() {
      // url encode
      const search = encodeURIComponent(this.isearch)
      const from = new Date(this.datePicker.dateStart)
      const to = new Date(this.datePicker.dateEnd)
      const param = new URLSearchParams()
      param.set('from', from.getTime())
      param.set('to', to.getTime())
      param.set('var-search', search)
      return `${BASE_URL}${this.grafanaUrl}${param.toString()}`
    },
    device() {
      if (this.$store.state.app.device === 'mobile') {
        return 'mobile'
      }
      return ''
    }
  },
  methods: {
    handleDateChange: debounce(function(value) {
      this.datePicker = {
        dateStart: value[0].toISOString(),
        dateEnd: value[1].toISOString()
      }
    }, 500),
    handleInput: debounce(function() {
      this.isearch = this.search
    }, 500),

    handleConfirm() {
    },
    handleDelete() {
    }
  }
}

</script>

<style lang='scss' scoped>
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

</style>
