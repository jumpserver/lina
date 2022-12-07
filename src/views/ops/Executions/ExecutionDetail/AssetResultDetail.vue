<template>
  <el-row :gutter="20">
    <IBox title="资产结果" fa="fa-info-circle">
      <el-collapse>
        <el-collapse-item v-for="(item,index) in detailData.detail" :key="index" :title="item.name">
          <el-form>
            <el-form-item label="status">
              {{ item.status }}
            </el-form-item>
            <el-form-item label="ok" />
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </IBox>
  </el-row>
</template>

<script>
import { IBox } from '@/components'

export default {
  components: {
    IBox
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      detailData: {}
    }
  },
  mounted() {
    this.$axios.get(`/api/v1/ops/job-execution/asset-detail/?execution_id=${this.object.id}`).then((data) => {
      this.detailData = data
    })
  }
}
</script>

<style scoped>

</style>
