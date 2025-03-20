<template>
  <TwoCol>
    <BaseList :columns-show="columnsShow" :columns-meta="columnsMeta" :url="url" />
  </TwoCol>
</template>

<script>
import BaseList from '@/views/sessions/SessionList/BaseList.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'AssetsSession',
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
      url: `/api/v1/terminal/sessions/?asset_id=${this.object.id}&order=is_finished,-date_end`,
      columnsShow: {
        min: ['id'],
        default: [
          'id', 'user', 'asset', 'account',
          'date_start', 'duration'
        ]
      },
      columnsMeta: {
        id: {
          width: '80px'
        }
      }
    }
  }
}
</script>
