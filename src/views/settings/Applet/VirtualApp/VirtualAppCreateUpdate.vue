<template>
  <GenericCreateUpdatePage v-if="!loading" v-bind="config" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { MatchExcludeParenthesis, Required } from '@/components/Form/DataForm/rules'
import { ProtocolsFormatter } from '@/components/Table/TableFormatters'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      loading: true,
      config: {
        url: '/api/v1/terminal/virtual-apps/',
        fields: [
          [this.$t('common.Basic'), ['name', 'image_name']],
          [this.$t('assets.Protocol'), ['protocols']],
          [this.$t('common.Other'), ['is_active', 'comment']]
        ],
        addFieldsMeta: {
          name: {
            rules: [Required, MatchExcludeParenthesis]
          },
          protocols: {
            label: this.$t('assets.Protocols'),
            formatter: ProtocolsFormatter
          }
        },
        createSuccessNextRoute: { name: 'Applets' },
        updateSuccessNextRoute: { name: 'Applets' }
      }
    }
  },
  async mounted() {
    this.loading = false
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
