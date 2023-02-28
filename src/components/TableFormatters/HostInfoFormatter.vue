<template>
  <DetailFormatter :row="row" :col="col">
    <template>
      <el-popover
        placement="top-start"
        :title="title"
        width="400"
        trigger="hover"
      >
        <el-row v-for="(item, key) of items" :key="key" class="detail-item">
          <el-col :span="12">{{ info[key] }}</el-col>
          <el-col :span="12">{{ item }}</el-col>
        </el-row>
        <span slot="reference">{{ viewText }}</span>
      </el-popover>
    </template>
  </DetailFormatter>
</template>

<script>
import DetailFormatter from './DetailFormatter'
import BaseFormatter from './base'
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
      cellValue['memory'] = (this.cellValue['memory'] / 1 || 0).toFixed(2)
      return cellValue
    },
    viewText() {
      const cpuCount = this.items['cpu_count']
      const cpuCores = this.items['cpu_cores']
      const cpuVcpus = this.items['cpu_vcpus']
      const memory = this.items['memory']
      const diskTotal = this.items['disk_total']
      if (cpuCount) {
        return `${cpuVcpus || cpuCores * cpuCount} Core ${memory}G ${diskTotal}G`
      }
      return '-'
    }
  },
  async mounted() {
    this.info = await this.optionAndGenFields()
  },
  methods: {
    async optionAndGenFields() {
      const data = await this.$store.dispatch('common/getUrlMeta', { url: this.url })
      const remoteMeta = data.actions['GET'] || {}
      const fieldName = this.formatterArgs.fieldName
      const remoteMetaFields = remoteMeta[fieldName].children
      const fields = Object.keys(remoteMetaFields)
      const info = {}
      for (const name of fields) {
        info[name] = remoteMetaFields[name].label
      }
      return info
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
