<template>
  <TwoCol>
    <div class="group-info-card">
      <AutoDetailCard :excludes="excludes" :object="object" :url="url" />
    </div>
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'GroupInfo',
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
      url: this.object.id ? `/api/v1/users/groups/${this.object.id}/` : '/api/v1/users/groups/',
      excludes: ['users']
    }
  },
  computed: {},
  watch: {
    group(iNew, iOld) {
      this.$log.debug('Group has changed')
      this.relationConfig.hasObjectsId = iNew.users
    }
  },
  methods: {}
}
</script>

<style scoped>
.group-info-card {
  max-width: 800px;
}
</style>
