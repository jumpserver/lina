<template>
  <TwoCol>
    <BaseList :asset-id="object.id" :is-page="false" />
  </TwoCol>
</template>

<script>
import BaseList from '@/views/sessions/CommandList/index.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'AssetCommand',
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
      title: '',
      url: `/api/v1/terminal/command-storages/tree/?real=1&asset_id=${this.object.id}&order=-date_end&is_finished=1`
    }
  }

}
</script>
