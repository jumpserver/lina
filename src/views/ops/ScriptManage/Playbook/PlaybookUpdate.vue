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
    return {
      url: '/api/v1/ops/playbooks/',
      fields: [
        [this.$t('common.Basic'), ['name', 'comment']]
      ],
      createSuccessNextRoute: {
        name: 'ScriptManage'
      },
      updateSuccessNextRoute: {
        name: 'ScriptManage'
      }
    }
  }
}
</script>

<style scoped>

</style>
