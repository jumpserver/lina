<template>
  <el-row :gutter="24">
    <el-col :md="24" :sm="24">
      <BaseList :asset-id="object.id" :is-page="false" />
    </el-col>
  </el-row>
</template>

<script>
import BaseList from '@/views/sessions/CommandList/index.vue'

export default {
  name: 'AssetCommand',
  components: {
    BaseList
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      title: '',
      url: `/api/v1/terminal/command-storages/tree/?real=1&asset_id=${this.object.id}&order=-date_end&is_finished=1`
    }
  }

}
</script>
