<template>
  <el-card class="log-card">
    <div slot="header">
      <span> {{ title }}</span>
      <el-button style="float: right" type="text" @click="tailLog"> {{ $tc('TailLog') }} </el-button>
    </div>
    <table v-if="logs.length>0" class="log-table">
      <tr v-for="(o,i) in logs" :key="i">
        <td>{{ o['message'] }}</td>
      </tr>
    </table>
    <table v-else class="log-table">
      <tr>
        <td>{{ $tc('NoLog') }}</td>
      </tr>
    </table></el-card>

</template>
<script>
import { openWindow } from '@/utils/common/index'

export default {
  name: 'CardLog',
  props: {
    logs: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    components: {
      type: Array,
      default: () => []
    },
    search: {
      type: String,
      default: ''
    }
  },
  methods: {
    tailLog() {
      const data = {
        components: this.components.join('|'),
        search: this.search
      }
      const params = new URLSearchParams(data)
      const url = '/ui/#/terminal/components/loki/tail/?' + params.toString()
      openWindow(url)
    }
  }
}
</script>

<style scoped>
.log-table {
  max-height: 300px;
  overflow: scroll;
  display: block;
}

.log-table ::v-deep td {
  padding: 5px 5px;
}

.log-table ::v-deep tr {
  overflow-x: auto;
  white-space: nowrap;
}

.log-card ::v-deep .el-card__body {
  padding: 10px 10px 5px;
}

</style>
