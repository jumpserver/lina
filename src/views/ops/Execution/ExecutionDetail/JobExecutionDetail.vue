<template>
  <TwoCol>
    <template>
      <AutoDetailCard :excludes="excludes" :fields="detailFields" :object="object" :url="url" />
    </template>
    <template v-if="hasSummary" #right class="detail-right-quick-actions">
      <IBox
        v-if="object.summary.ok"
        :title="`${$tc('SuccessAsset')} (${object.summary.ok.length})`"
        type="success"
      >
        <el-collapse>
          <el-collapse-item
            v-for="(item, index) in object.summary.ok"
            :key="index"
            :name="index"
            disabled
          >
            <template #title>
              <el-tooltip :content="item" placement="top" class="text-overflow">
                <span>{{ item }}</span>
              </el-tooltip>
            </template>
          </el-collapse-item>
        </el-collapse>
      </IBox>
      <IBox
        v-if="object.summary.excludes"
        :title="`${$tc('ExcludeAsset')} (${Object.keys(object.summary.excludes).length})`"
        type="warning"
      >
        <el-collapse>
          <el-collapse-item
            v-for="(val, key, index) in object.summary.excludes"
            :key="index"
            :name="index"
          >
            <template #title>
              <el-tooltip :content="key" placement="top" class="text-overflow">
                <span>{{ key }}</span>
              </el-tooltip>
            </template>

            <div>{{ $tc('Reason') }}: {{ val }}</div>
          </el-collapse-item>
        </el-collapse>
      </IBox>
      <IBox
        v-if="object.summary.failures"
        :title="`${$tc('FailedAsset')} (${Object.keys(Object.assign(object.summary.failures, object.summary.dark)).length})`"
        type="danger"
      >
        <el-collapse>
          <el-collapse-item
            v-for="(val, key, index) in Object.assign(object.summary.failures, object.summary.dark)"
            :key="index"
            :name="index"
          >
            <template #title>
              <el-tooltip :content="key" placement="top" class="text-overflow">
                <span>{{ key }}</span>
              </el-tooltip>
            </template>

            <div>{{ $tc('Reason') }}: {{ val }}</div>
          </el-collapse-item>
        </el-collapse>
      </IBox>
      <IBox v-if="object.summary.error" :title="$tc('SystemError')" type="danger">
        {{ object.summary.error }}
      </IBox>
    </template>
  </TwoCol>
</template>

<script type="text/jsx">
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import IBox from '@/components/Common/IBox'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  components: {
    TwoCol,
    IBox,
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      excludes: ['job', 'parameters', 'summary', 'task_id', 'timedelta'],
      detailFields: [
        'task_id',
        'time_cost',
        {
          key: this.$t('IsFinished'),
          value: this.object.is_finished ? this.$t('Yes') : this.$t('No')
        },
        {
          key: this.$t('IsSuccess'),
          value: this.object.is_success ? this.$t('Yes') : this.$t('No')
        },
        'job_type',
        'material',
        'org_name',
        'date_start',
        'date_finished',
        'date_created'
      ],
      url: `/api/v1/ops/job-executions/${this.object.id}/`
    }
  },
  computed: {
    hasSummary() {
      return this.object.is_finished && Object.keys(this.object.summary).length
    }
  }
}
</script>
