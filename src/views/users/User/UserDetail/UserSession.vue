<template>
  <el-row :gutter="10">
    <el-col :md="24" :sm="24">
      <BaseList :columns-show="columnsShow" :url="url" />
    </el-col>
  </el-row>
</template>

<script>
import BaseList from '@/views/sessions/SessionList/BaseList.vue'

export default {
  name: 'UserSession',
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
      url: `/api/v1/terminal/sessions/?user_id=${this.object.id}&order=is_finished,-date_end`,
      columnsShow: {
        min: ['id', 'user', 'asset', 'account'],
        default: [
          'id', 'user', 'asset', 'account', 'protocol',
          'date_start', 'duration'
        ]
      }
    }
  }

}
</script>
