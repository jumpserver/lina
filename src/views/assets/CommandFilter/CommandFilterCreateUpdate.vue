<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
export default {
  name: 'CommandFilterCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {

      },
      fields: [
        [this.$t('common.BasicInfo'), ['name', 'comment']]
      ],
      fieldsMeta: {

      },
      url: '/api/v1/assets/cmd-filters/'
    }
  }
}
</script>

<style lang='less' scoped>

</style>
