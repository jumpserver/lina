<template>
  <DetailFormatter :col="col" :row="row">
    <template>
      <el-popover
        :open-delay="parseInt('500')"
        :title="title"
        placement="top-start"
        trigger="hover"
        width="400"
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
      return `${this.$t('HardwareInfo')}`
    },
    items() {
      const cellValue = { ...this.cellValue }
      const memory = this.cellValue?.memory
      cellValue['memory'] = memory ? (memory / 1 || 0).toFixed(2) : '-'
      return cellValue
    },
    viewText() {
      const cpuCount = Number(this.items['cpu_count'] || 0)
      const cpuCores = Number(this.items['cpu_cores'] || 0)
      const cpuVcpus = Number(this.items['cpu_vcpus'] || 0)
      const memory = Number(this.items['memory'] || 0)
      const diskTotal = Number(this.items['disk_total'] || 0)
      const rawCpuModel = this.items['cpu_model']
      const rawGpuModel = this.items['gpu_model']

      let summary = ''

      if (cpuCount) {
        const coreCount = cpuVcpus || (cpuCores * cpuCount)
        summary = `${coreCount} Core`

        if (memory) {
          summary += ` ${Math.round(memory)}G`
        }

        if (diskTotal) {
          summary += ` ${Math.round(diskTotal)}G`
        }

        const cpuModel = this.formatCpuModel(rawCpuModel)
        if (cpuModel) {
          summary += ` (${cpuModel})`
        }

        if (rawGpuModel) {
          const gpu = this.formatGpuModel(rawGpuModel)
          summary += ` ${gpu}`
        }

        return summary
      }

      return this.items?.distribution || '-'
    }
  },
  methods: {
    formatCpuModel(raw) {
      if (!raw) return ''

      const match = raw.match(/^([^\s]+)\s*(x\d+)?$/)
      let base = match?.[1] || raw
      const suffix = match?.[2] || ''

      base = base
        .replace(/GenuineIntel/i, '')
        .replace(/\b\d+(st|nd|rd|th)? Gen\b/i, '')
        .replace(/\(R\)/g, '')
        .replace(/\(TM\)/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      return `${base}${suffix}`
    },
    formatGpuModel(raw) {
      if (!raw) return ''

      const match = raw.match(/(.+?),\s*(\d+),\s*([\d.]+)(?:\s*x(\d+))?/)
      if (match) {
        const [, model, vramMb, driverVersion, countStr] = match
        const count = countStr ? parseInt(countStr) : 1
        const vramGb = Math.round(parseInt(vramMb) / 1024)
        const label = `${model} (${vramGb}GB, Driver ${driverVersion})`
        return count > 1 ? `${label} x${count}` : label
      }
      return raw // fallback
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
