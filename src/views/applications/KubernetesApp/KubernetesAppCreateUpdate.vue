<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    return {
      initial: {
        type: 'k8s'
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'type']],
        [this.$t('applications.kubernetes'), ['cluster']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        type: {
          disabled: true,
          hidden: () => vm.$route.params.id
        }
      },
      url: '/api/v1/applications/k8s-apps/'
    }
  },
  computed: {

  }
}
</script>

<style lang="less" scoped>

</style>
