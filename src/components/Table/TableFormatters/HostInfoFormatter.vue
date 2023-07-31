<template>
  <DetailFormatter :row="row" :col="col">
    <template>
      <el-popover
        placement="top-start"
        :open-delay="parseInt('500')"
        :title="title"
        width="400"
        trigger="hover"
      >
        <el-row v-for="(item, key) of items" :key="key" class="detail-item">
          <el-col :span="12">{{ formatterArgs.info[key] }}</el-col>
          <el-col :span="12">{{ item }}</el-col>
        </el-row>
        <span slot="reference">{{ viewText }}</span>
      </el-popover>
    </template>
  </DetailFormatter>
</template>

<script>
import DetailFormatter from './DetailFormatter.vue'
import BaseFormatter from './base.vue'
export default {
  name: 'HostInfoFormatter',
  components: {
    DetailFormatter
  },
  extends: BaseFormatter,
  data() {
    return {
      info: {},
      formatterArgsNew: {
        showItems: true,
        getItem(item) {
          return item.name
        }
      }
    }
  },
  computed: {
    title() {
      return `${this.$t('assets.HardwareInfo')}`
    },
    items() {
      const cellValue = { ...this.cellValue }
      const memory = this.cellValue?.memory
      cellValue['memory'] = memory ? (memory / 1 || 0).toFixed(2) : '-'
      return cellValue
    },
    viewText() {
      const cpuCount = this.items['cpu_count']
      const cpuCores = this.items['cpu_cores']
      const cpuVcpus = this.items['cpu_vcpus']
      const memory = this.items['memory']
      const diskTotal = this.items['disk_total']
      if (cpuCount) {
        let text = `${cpuVcpus || cpuCores * cpuCount} Core`
        if (memory) {
          text += ` ${memory}G`
        }
        if (diskTotal) {
          text += ` ${diskTotal}G`
        }
        return text
      }
      return '-'
    }
  }
}
</script>
<style lang="scss" scoped>
.detail-content {
  padding: 10px;
  max-height: 60vh;
  overflow-y: auto;
}
.detail-item {
  border-bottom: 1px solid #EBEEF5;
  padding: 5px 0;
  margin-bottom: 0;

  &:hover {
     background-color: #F5F7FA;
  }
}

</style>
