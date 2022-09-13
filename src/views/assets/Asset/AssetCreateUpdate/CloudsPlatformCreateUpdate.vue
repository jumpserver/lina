<template>
  <GenericCreateUpdatePage v-if="!loading" v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { assetFieldsMeta, setPlatformInitial } from '@/views/assets/const'

export default {
  name: 'DatabaseCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      loading: true,
      initial: {},
      url: '/api/v1/assets/databases/',
      createSuccessNextRoute: { name: 'AssetList' },
      hasDetailInMsg: false,
      fields: [
        [this.$t('common.Basic'), ['name', 'ip', 'platform', 'cluster']],
        [this.$t('assets.Protocols'), ['protocols']],
        [this.$t('assets.Domain'), ['domain']],
        [this.$t('assets.Node'), ['nodes']],
        [this.$t('assets.Label'), ['labels']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: assetFieldsMeta(this)
    }
  },
  async created() {
    try {
      await setPlatformInitial(this)
    } finally {
      this.loading = false
    }
  },
  methods: {
  }
}
</script>

<style>

</style>
