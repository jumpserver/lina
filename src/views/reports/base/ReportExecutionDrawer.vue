<template>
  <div>
    <Drawer
      :title="`${reportName || $t('Report')} - ${$t('ExecutionRecords')}`"
      :visible.sync="iVisible"
      size="980px"
      @close-drawer="handleClose"
    >
      <div v-loading="loading" class="report-execution-drawer">
        <el-table :data="executions" border height="calc(100vh - 160px)">
          <el-table-column :label="$t('ID')" min-width="180" prop="id" />
          <el-table-column :label="$t('Status')" min-width="120" prop="status" />
          <el-table-column :label="$t('Trigger')" min-width="120" prop="trigger" />
          <el-table-column :label="$t('DateStart')" min-width="180" prop="date_start" />
          <el-table-column :label="$t('DateFinished')" min-width="180" prop="date_finished" />
          <el-table-column :label="$t('DurationSeconds')" min-width="100" prop="duration" />
          <el-table-column :label="$t('SendRecords')" min-width="100">
            <template slot-scope="{ row }">
              {{ row.send_record_count || 0 }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('Actions')" min-width="120" fixed="right">
            <template slot-scope="{ row }">
              <el-button size="mini" type="text" @click="openDetail(row)">
                {{ $t('Detail') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </Drawer>

    <Dialog
      v-if="detailVisible"
      :destroy-on-close="true"
      :show-confirm="false"
      :title="detailTitle"
      :visible.sync="detailVisible"
      top="8vh"
      width="900px"
      @cancel="detailVisible = false"
    >
      <div v-loading="detailLoading">
        <el-descriptions v-if="selectedExecution" :column="2" border class="detail-summary">
          <el-descriptions-item :label="$t('ID')">{{ selectedExecution.id }}</el-descriptions-item>
          <el-descriptions-item :label="$t('Status')">{{ selectedExecution.status }}</el-descriptions-item>
          <el-descriptions-item :label="$t('Trigger')">{{ selectedExecution.trigger }}</el-descriptions-item>
          <el-descriptions-item :label="$t('DurationSeconds')">{{ selectedExecution.duration || 0 }}</el-descriptions-item>
          <el-descriptions-item :label="$t('DateStart')">{{ selectedExecution.date_start || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="$t('DateFinished')">{{ selectedExecution.date_finished || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-table :data="sendRecords" border max-height="360">
          <el-table-column :label="$t('Receiver')" min-width="120" prop="receiver" />
          <el-table-column :label="$t('Backend')" min-width="120" prop="backend" />
          <el-table-column :label="$t('Result')" min-width="100">
            <template slot-scope="{ row }">
              <span :class="row.is_success ? 'text-primary' : 'text-danger'">
                {{ row.is_success ? $t('Success') : $t('Failed') }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('CreatedTime')" min-width="180" prop="date_created" />
          <el-table-column :label="$t('Actions')" min-width="100" fixed="right">
            <template slot-scope="{ row }">
              <el-button size="mini" type="text" @click="showRecordLog(row)">
                {{ $t('Log') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="selectedExecution && selectedExecution.summary" class="execution-summary">
          <h4>{{ $t('ExecutionSummary') }}</h4>
          <pre>{{ formatJson(selectedExecution.summary) }}</pre>
        </div>
      </div>
    </Dialog>

    <Dialog
      v-if="logVisible"
      :destroy-on-close="true"
      :show-confirm="false"
      :title="$t('ExecutionLog')"
      :visible.sync="logVisible"
      top="15vh"
      width="760px"
      @cancel="logVisible = false"
    >
      <pre class="log-detail">{{ selectedLog }}</pre>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import Drawer from '@/components/Drawer'

export default {
  name: 'ReportExecutionDrawer',
  components: {
    Dialog,
    Drawer
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    reportId: {
      type: String,
      default: ''
    },
    reportName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      detailLoading: false,
      detailVisible: false,
      logVisible: false,
      executions: [],
      sendRecords: [],
      selectedExecution: null,
      selectedLog: ''
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
    detailTitle() {
      return this.selectedExecution ? `${this.$t('ExecutionDetail')} - ${this.selectedExecution.id}` : this.$t('ExecutionDetail')
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.loadExecutions()
      }
    }
  },
  methods: {
    async loadExecutions() {
      if (!this.reportId) {
        return
      }
      this.loading = true
      try {
        const data = await this.$axios.get('/api/v1/reports/report-executions/', {
          params: {
            report: this.reportId
          }
        })
        this.executions = data.results || data
      } finally {
        this.loading = false
      }
    },
    async openDetail(row) {
      this.detailVisible = true
      this.detailLoading = true
      this.selectedExecution = row
      try {
        const data = await this.$axios.get(`/api/v1/reports/report-executions/${row.id}/`)
        this.selectedExecution = data
        this.sendRecords = data.send_records || []
      } finally {
        this.detailLoading = false
      }
    },
    showRecordLog(row) {
      this.selectedLog = row.detail || row.error || '-'
      this.logVisible = true
    },
    formatJson(value) {
      return JSON.stringify(value || {}, null, 2)
    },
    handleClose() {
      this.iVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.report-execution-drawer {
  padding: 16px;
}

.detail-summary {
  margin-bottom: 16px;
}

.execution-summary {
  margin-top: 16px;

  pre {
    background: #f5f7fa;
    padding: 12px;
    overflow: auto;
  }
}

.log-detail {
  background: #111827;
  color: #f9fafb;
  min-height: 220px;
  overflow: auto;
  padding: 16px;
}
</style>
