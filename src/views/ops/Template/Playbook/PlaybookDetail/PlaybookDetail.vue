<template>
  <TwoCol>
    <AutoDetailCard :excludes="excludes" :object="object" :url="url" />
  </TwoCol>
</template>

<script type="text/jsx">
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  components: {
    TwoCol,
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      url: `/api/v1/ops/playbooks/${this.object.id}/`,
      excludes: [
        'path', 'create_method', 'vcs_url'
      ]
    }
  },
  computed: {
    cardTitle() {
      return this.object.name
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
