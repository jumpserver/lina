<template>
  <GenericTicketDetail :object="object" />
</template>

<script>
import { STATUS_MAP } from '../../const'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'
import { getAssetUrl } from '@/utils/assets'

export default {
  name: 'AssetTicketDetail',
  components: {
    GenericTicketDetail
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      statusMap:
        this.object.status.value === 'open'
          ? STATUS_MAP['pending']
          : STATUS_MAP[this.object.state.value],
      imageUrl: getAssetUrl('img/avatar.png'),
      form: {
        comments: ''
      },
      comments: ''
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped></style>
