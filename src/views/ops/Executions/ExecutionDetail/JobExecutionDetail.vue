<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailCardItems" />
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
      <IBox type="warning" :title="`${$tc('ops.ExcludeAsset')} (${Object.keys(object.summary.excludes).length})` ">
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
      <IBox type="danger" :title="`${$tc('ops.FailedAsset')} (${Object.keys(object.summary.failures).length})` ">
        <el-collapse>
          <el-collapse-item
            v-for="(val,key,index) in object.summary.failures"
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
import DetailCard from '@/components/DetailCard'
import IBox from '@/components/IBox'

export default {
  components: {
    IBox,
    DetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  },
  computed: {
    hasSummary() {
      return this.object.is_finished && Object.keys(this.object.summary).length
    },
    detailCardItems() {
      return [
        {
          key: 'ID',
          value: this.object.id
        },
        {
          key: this.$t('ops.Type'),
          value: this.object.job_type
        },
        {
          key: this.$t('ops.isFinished'),
          value: this.object.is_finished
        },
        {
          key: this.$t('ops.isSuccess'),
          value: this.object.is_success
        },
        {
          key: this.$t('ops.DateCreated'),
          value: this.object.date_created
        },
        {
          key: this.$t('ops.DateStart'),
          value: this.object.date_start
        },
        {
          key: this.$t('ops.DateFinished'),
          value: this.object.date_finished
        },
        {
          key: this.$t('ops.Material'),
          value: this.object.material
        }
      ]
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
