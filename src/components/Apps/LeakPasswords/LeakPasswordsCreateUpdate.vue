<template>
  <div v-loading="loading">
    <GenericCreateUpdatePage
      v-if="!loading"
      class="user-create-update"
      v-bind="$data"
      :title="null"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'

export default {
  name: 'LeakPasswordsCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      loading: true,
      fields: [
        [this.$t('Basic'), ['password']]
      ],
      encryptedFields: [],
      url: '/api/v1/settings/leak-passwords/'

    }
  },
  async mounted() {
    this.loading = false
  },
  methods: {}
}
</script>

<style lang="scss" scoped>

</style>
