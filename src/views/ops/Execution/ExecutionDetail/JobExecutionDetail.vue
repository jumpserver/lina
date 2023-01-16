<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :url="url" :object="object" :excludes="excludes" />
    </el-col>
    <el-col v-if="hasSummary" :md="10" :sm="24">
      <IBox type="success" :title="`${$tc('ops.SuccessAsset')} (${object.summary.ok.length})` ">
        <el-collapse>
          <el-collapse-item
            v-for="(item,index) in object.summary.ok"
            :key="index"
            :title="item"
            :name="index"
            disabled
          />
        </el-collapse>
      </IBox>
      <IBox
        v-if="object.summary.excludes"
        type="warning"
        :title="`${$tc('ops.ExcludeAsset')} (${Object.keys(object.summary.excludes).length})` "
      >
        <el-collapse>
          <el-collapse-item
            v-for="(val,key,index) in object.summary.excludes"
            :key="index"
            :title="key"
            :name="index"
          >
            <div>{{ $tc('ops.Reason') }}: {{ val }}</div>
          </el-collapse-item>
        </el-collapse>
      </IBox>
      <IBox
        type="danger"
        :title="`${$tc('ops.FailedAsset')} (${Object.keys(Object.assign(object.summary.failures,object.summary.dark)).length})` "
      >
        <el-collapse>
          <el-collapse-item
            v-for="(val,key,index) in Object.assign(object.summary.failures,object.summary.dark)"
            :key="index"
            :title="key"
            :name="index"
          >
            <div>{{ $tc('ops.Reason') }}: {{ val }}</div>
          </el-collapse-item>
        </el-collapse>
      </IBox>
    </el-col>
  </el-row>
</template>

<script type="text/jsx">
import AutoDetailCard from '@/components/DetailCard/auto'
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
