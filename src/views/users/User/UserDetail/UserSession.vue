<template>
  <TwoCol>
    <BaseList :columns-show="columnsShow" :url="url" />
  </TwoCol>
</template>

<script>
import BaseList from '@/views/sessions/SessionList/BaseList.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'UserSession',
  components: {
    TwoCol,
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
