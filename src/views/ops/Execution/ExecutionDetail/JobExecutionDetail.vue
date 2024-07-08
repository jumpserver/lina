<template>
  <el-row :gutter="20">
    <el-col :md="15" :sm="24">
      <AutoDetailCard
        :excludes="excludes"
        :object="object"
        :url="url"
        :fields="detailFields"
      />
    </el-col>
    <el-col v-if="hasSummary" :md="9" :sm="24">
      <IBox
        v-if="object.summary.ok"
        :title="`${$tc('SuccessAsset')} (${object.summary.ok.length})` "
        type="success"
      >
        <el-collapse>
          <el-collapse-item
            v-for="(item,index) in object.summary.ok"
            :key="index"
            :name="index"
            :title="item"
            disabled
          />
        </el-collapse>
      </IBox>
      <IBox
        v-if="object.summary.excludes"
        :title="`${$tc('ExcludeAsset')} (${Object.keys(object.summary.excludes).length})` "
        type="warning"
      >
        <el-collapse>
          <el-collapse-item
            v-for="(val,key,index) in object.summary.excludes"
            :key="index"
            :name="index"
            :title="key"
          >
            <div>{{ $tc('Reason') }}: {{ val }}</div>
          </el-collapse-item>
        </el-collapse>
      </IBox>
      <IBox
        v-if="object.summary.failures"
        :title="`${$tc('FailedAsset')} (${Object.keys(Object.assign(object.summary.failures,object.summary.dark)).length})` "
        type="danger"
      >
        <el-collapse>
          <el-collapse-item
            v-for="(val,key,index) in Object.assign(object.summary.failures,object.summary.dark)"
            :key="index"
            :name="index"
            :title="key"
          >
            <div>{{ $tc('Reason') }}: {{ val }}</div>
          </el-collapse-item>
        </el-collapse>
      </IBox>
      <IBox
        v-if="object.summary.error"
        :title="$tc('SystemError') "
        type="danger"
      >
        {{ object.summary.error }}
      </IBox>
    </el-col>
  </el-row>
</template>

<script type="text/jsx">
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import IBox from '@/components/IBox'

export default {
  components: {
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
      excludes: [
        'job', 'parameters', 'summary', 'task_id', 'timedelta'
      ],
      detailFields: [
        'task_id', 'time_cost',
        {
          key: this.$t('IsFinished'),
          value: `${this.object.is_finished ? '是' : '否'}`
        },
        {
          key: this.$t('IsSuccess'),
          value: `${this.object.is_success ? '是' : '否'}`
        },
        'job_type', 'material', 'org_name',
        'date_start', 'date_finished', 'date_created'
      ],
      url: `/api/v1/ops/job-executions/${this.object.id}/`
    }
  },
  computed: {
    hasSummary() {
      return this.object.is_finished && Object.keys(this.object.summary).length
    }
  },
  mounted() {
    console.log(this.object)
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
