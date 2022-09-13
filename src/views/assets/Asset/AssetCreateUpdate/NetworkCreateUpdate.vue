<template>
  <GenericCreateUpdatePage v-if="!loading" v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { assetFieldsMeta, setPlatformInitial } from '../../const'

export default {
  name: 'HostCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      loading: true,
      initial: {},
      platform: {},
      url: '/api/v1/assets/assets/',
      createSuccessNextRoute: { name: 'AssetList' },
      hasDetailInMsg: false,
      fields: [
        [this.$t('common.Basic'), ['name', 'ip', 'platform', 'domain']],
        [this.$t('assets.Protocols'), ['protocols']],
        [this.$t('assets.Node'), ['nodes']],
        this.$route.params.id ? null : [this.$t('assets.Account'), ['accounts']],
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
