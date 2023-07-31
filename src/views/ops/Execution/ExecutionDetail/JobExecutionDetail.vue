<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :excludes="excludes" :object="object" :url="url" />
    </el-col>
    <el-col v-if="hasSummary" :md="10" :sm="24">
      <IBox
        v-if="object.summary.ok"
        :title="`${$tc('ops.SuccessAsset')} (${object.summary.ok.length})` "
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
        :title="`${$tc('ops.ExcludeAsset')} (${Object.keys(object.summary.excludes).length})` "
        type="warning"
      >
        <el-collapse>
          <el-collapse-item
            v-for="(val,key,index) in object.summary.excludes"
            :key="index"
            :name="index"
            :title="key"
          >
            <div>{{ $tc('ops.Reason') }}: {{ val }}</div>
          </el-collapse-item>
        </el-collapse>
      </IBox>
      <IBox
        v-if="object.summary.failures"
        :title="`${$tc('ops.FailedAsset')} (${Object.keys(Object.assign(object.summary.failures,object.summary.dark)).length})` "
        type="danger"
      >
        <el-collapse>
          <el-collapse-item
            v-for="(val,key,index) in Object.assign(object.summary.failures,object.summary.dark)"
            :key="index"
            :name="index"
            :title="key"
          >
            <div>{{ $tc('ops.Reason') }}: {{ val }}</div>
          </el-collapse-item>
        </el-collapse>
      </IBox>
      <IBox
        v-if="object.summary.error"
        :title="$tc('ops.SystemError') "
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
      url: `/api/v1/ops/job-executions/${this.object.id}/`
    }
  },
  computed: {
    hasSummary() {
      return this.object.is_finished && Object.keys(this.object.summary).length
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
