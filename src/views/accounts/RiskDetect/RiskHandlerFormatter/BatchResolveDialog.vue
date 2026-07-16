<template>
  <Dialog
    :destroy-on-close="true"
    :show-buttons="false"
    :visible="visible"
    :title="$tc('ResolveSelected')"
    width="960px"
    @update:visible="$emit('update:visible', $event)"
  >
    <div>
      <div class="batch-toolbar jms-form-controls">
        <div class="risk-filter">
          <span class="toolbar-label">{{ $t('Risk') }}</span>
          <el-select
            v-model="riskSelected"
            class="risk-select"
            clearable
            :placeholder="$t('SelectRisk')"
          >
            <el-option
              v-for="item in riskTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <HandleDropdown
          :cell-value="fakeCell"
          :changed="changed"
          :row="fakeRow"
          :rows="tableConfig.totalData"
          :selected-rows="selectedRows"
          :show-labels="true"
          :value="1"
          class="risk-handler"
          @process-done="handleProcessDone"
        />
      </div>
      <DataTable ref="table" :config="tableConfig" @selection-change="handleSelectionChange" />
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
      selectedRows: [],
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
    riskTypes() {
      const types = {}
      for (const item of this.unconfirmedRisks) {
        if (!types[item.risk.value]) {
          types[item.risk.value] = item.risk.label
        }
      }
      return Object.keys(types).map((key) => ({ value: key, label: types[key] }))
    },
    unconfirmedRisks() {
      return this.risks.filter((item) => item.status.value === '0')
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
        this.tableConfig.totalData = this.unconfirmedRisks.filter(
          (item) => item.risk.value === this.riskSelected
        )
      } else {
        this.tableConfig.totalData = this.unconfirmedRisks.filter(
          (item) => item.status.value === '0'
        )
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
    },
    handleSelectionChange(val) {
      this.selectedRows = val
    }
  }
}
</script>

<style lang="scss" scoped>
.batch-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.risk-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.toolbar-label {
  flex: none;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.risk-select {
  width: 240px;
}

@media (max-width: 640px) {
  .batch-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .risk-select {
    width: 100%;
  }
}
</style>
