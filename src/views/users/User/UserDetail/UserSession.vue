<template>
  <el-row :gutter="10">
    <el-col :span="18">
      <OfflineList :url="url" />
    </el-col>
  </el-row>
</template>

<script>
import OfflineList from '@/views/sessions/SessionList/OfflineList.vue'

export default {
  name: 'UserSession',
  components: {
    OfflineList
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      url: `/api/v1/terminal/sessions/?user_id=${this.object.id}&order=-date_end&is_finished=1`
    }
  }

}
</script>
