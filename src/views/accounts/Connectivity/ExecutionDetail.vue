<template>
  <GenericDetailPage
    ref="detailPage"
    :key="connectivity.type"
    v-model:object="execution"
    v-model:active-menu="activeMenu"
    :url="connectivity.executionUrl"
    :submenu="submenu"
    :actions="{ hasUpdate: false, hasDelete: false }"
    :has-activity="false"
    :get-title="(object) => object.snapshot?.name || object.id || $t('ExecutionDetail')"
  >
    <template #headingRightSide>
      <el-button @click="$refs.detailPage.loadObject()">{{ $t('Refresh') }}</el-button>
      <el-button @click="openLog">{{ $t('Log') }}</el-button>
      <el-button type="primary" @click="reportVisible = true">{{ $t('Report') }}</el-button>
    </template>
    <RecordList v-if="execution.id && activeMenu === 'records'" :execution-id="execution.id" />
    <template v-else-if="execution.id">
      <AutoDetailCard
        :key="`${execution.id}:${execution.status?.value}`"
        :object="execution"
        :url="`${connectivity.executionUrl}${execution.id}/`"
        :fields="['id', 'status', 'trigger', 'date_start', 'date_finished', 'duration']"
      />
      <IBox :title="$t('ConnectivityResults')">
        <div class="result-summary">
          <el-tag type="success"
            >{{ $t('Success') }}: {{ execution.summary?.ok_assets || 0 }}</el-tag
          >
          <el-tag type="danger"
            >{{ $t('Failed') }}: {{ execution.summary?.fail_assets || 0 }}</el-tag
          >
          <el-tag type="warning"
            >{{ $t('ConnectivityUnsupported') }}: {{ execution.summary?.error_assets || 0 }}</el-tag
          >
        </div>
        <el-table :data="pageRows" border>
          <el-table-column
            prop="target"
            :label="$t('ConnectivityTarget')"
            min-width="240"
            show-overflow-tooltip
          />
          <el-table-column :label="$t('Status')" width="130">
            <template #default="{ row }">
              <el-tag :type="row.tone">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="error"
            :label="$t('Error')"
            min-width="240"
            show-overflow-tooltip
          />
        </el-table>
        <el-pagination
          v-if="resultRows.length > pageSize"
          v-model:current-page="page"
          :page-size="pageSize"
          :total="resultRows.length"
          layout="total, prev, pager, next"
        />
      </IBox>
    </template>
    <ReportDialog
      v-if="execution.id"
      v-model:visible="reportVisible"
      :url="`${connectivity.executionUrl}${execution.id}/report/`"
    />
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
import IBox from '@/components/Common/IBox'
import ReportDialog from '@/components/Dialog/ReportDialog.vue'
import { openTaskPage } from '@/utils/jms'
import { connectivityMixin } from './config'
import RecordList from './RecordList.vue'

export default {
  name: 'ConnectivityExecutionDetail',
  components: { GenericDetailPage, AutoDetailCard, IBox, ReportDialog, RecordList },
  mixins: [connectivityMixin],
  data() {
    return { execution: {}, activeMenu: 'basic', reportVisible: false, page: 1, pageSize: 20 }
  },
  computed: {
    submenu() {
      return [
        { name: 'basic', title: this.$t('BasicInfo') },
        { name: 'records', title: this.$t('ExecutionRecord') }
      ]
    },
    resultRows() {
      const result = this.execution.result || {}
      return [
        ...(result.fail_assets || []).map(([target, error]) => ({
          target,
          error,
          status: this.$t('Failed'),
          tone: 'danger'
        })),
        ...(result.error_assets || []).map((target) => ({
          target,
          error: '',
          status: this.$t('ConnectivityUnsupported'),
          tone: 'warning'
        })),
        ...(result.ok_assets || []).map((target) => ({
          target,
          error: '',
          status: this.$t('Success'),
          tone: 'success'
        }))
      ]
    },
    pageRows() {
      return this.resultRows.slice((this.page - 1) * this.pageSize, this.page * this.pageSize)
    }
  },
  methods: {
    openLog() {
      openTaskPage(this.execution.id)
    }
  }
}
</script>

<style scoped>
.result-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.el-pagination {
  margin-top: 16px;
}
</style>
