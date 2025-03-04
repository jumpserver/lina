<template>
  <Dialog :destroy-on-close="true" :show-buttons="false" :title="$tc('ResolveSelected')" :visible.sync="iVisible">
    <div>
      <el-form class="el-form">
        <el-form-item class="risk-select" prop="selected">
          <el-select v-model="riskSelected" :placeholder="$t('Select risk')">
            <el-option
              v-for="item in riskTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <HandleDropdown
          :cell-value="fakeCell"
          :changed="changed"
          :row="fakeRow"
          :rows="tableConfig.totalData"
          :value="1"
          class="risk-handler"
          @processDone="handleProcessDone"
        />
      </el-form>
      <DataTable ref="table" :config="tableConfig" />
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import DataTable from '@/components/Table/DataTable/index.vue'
import HandleDropdown from './index.vue'

export default {
  name: 'BatchResolveDialog',
  components: { DataTable, Dialog, HandleDropdown },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    risks: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      changed: false,
      riskSelected: '',
      fakeRow: {
        id: '',
        risk: {}
      },
      fakeCell: {
        value: '0',
        label: this.$t('Pending')
      },
      tableConfig: {
        url: '',
        totalData: [],
        columns: [
          {
            prop: 'asset',
            label: this.$t('Asset'),
            formatter: (row) => row.asset.name
          },
          {
            prop: 'username',
            label: this.$t('Username')
          },
          {
            prop: 'risk',
            label: this.$t('Risk'),
            formatter: (row) => row.risk.label
          },
          {
            prop: 'status',
            label: this.$t('Status'),
            formatter: (row) => row.status.label
          }
        ]
      }
    }
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    riskTypes() {
      const types = {}
      for (const item of this.unconfirmedRisks) {
        if (!types[item.risk.value]) {
          types[item.risk.value] = item.risk.label
        }
      }
      return Object.keys(types).map(key => ({ value: key, label: types[key] }))
    },
    unconfirmedRisks() {
      return this.risks.filter(item => item.status.value === '0')
    },
    dataTable() {
      return this.$refs.table.$refs.table
    },
    pageSize() {
      return this.dataTable.size
    },
    dataTableCurrentPage() {
      return this.dataTable.page
    }
  },
  watch: {
    riskSelected(val) {
      if (val) {
        this.tableConfig.totalData = this.unconfirmedRisks.filter(item => item.risk.value === this.riskSelected)
      } else {
        this.tableConfig.totalData = this.unconfirmedRisks.filter(item => item.status.value === '0')
      }
      this.fakeRow.risk = {
        value: this.riskSelected
      }
      this.changed = true
      setTimeout(() => {
        this.changed = false
      }, 200)
    }
  },
  mounted() {
    this.tableConfig.totalData = this.unconfirmedRisks
  },
  methods: {
    handleProcessDone({ index, row }) {
      const page = this.dataTable.page
      const size = this.dataTable.size
      const offset = Math.floor(index / size)
      if (page < offset + 1) {
        this.dataTable.gotoNextPage()
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.el-form {
  ::v-deep .el-form-item {
    margin-bottom: 5px;
  }

  .risk-select {
    display: inline-block;

    ::v-deep .el-form-item__content {
      width: 100%;
    }
  }

  .risk-handler {
    margin-left: 10px;

    ::v-deep button {
      padding: 8px;
    }
  }

}

</style>
