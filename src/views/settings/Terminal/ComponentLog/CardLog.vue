<template>
  <el-card class="log-card">
    <template #header>
      <div>
        <span> {{ title }}</span>
        <el-button style="float: right" link @click="tailLog"> {{ $tc('TailLog') }} </el-button>
      </div>
    </template>
    <table v-if="logs.length > 0" class="log-table">
      <tbody>
        <tr v-for="(o, i) in logs" :key="i">
          <td>{{ o['message'] }}</td>
        </tr>
      </tbody>
    </table>
    <table v-else class="log-table">
      <tbody>
        <tr>
          <td>{{ $tc('NoLog') }}</td>
        </tr>
      </tbody>
    </table></el-card
  >
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

.log-table :deep(td) {
  padding: 5px 5px;
}

.log-table :deep(tr) {
  overflow-x: auto;
  white-space: nowrap;
}

.log-card :deep(.el-card__body) {
  padding: 10px 10px 5px;
}
</style>
