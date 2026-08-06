<template>
  <GenericCreateUpdatePage v-bind="config" v-if="!loading" />
</template>

<script>
import { MatchExcludeParenthesis, Required } from '@/components/Form/DataForm/rules'
import { ProtocolsFormatter } from '@/components/Table/TableFormatters'
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'

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
          [this.$t('Basic'), ['name', 'display_name', 'version', 'author']],
          [this.$t('Image'), ['image_name', 'image_protocol', 'image_port']],
          [this.$t('Protocol'), ['protocols']],
          [this.$t('Other'), ['tags', 'is_active', 'comment']]
        ],
        addFieldsMeta: {
          name: {
            rules: [Required, MatchExcludeParenthesis]
          },
          protocols: {
            label: this.$t('Protocols'),
            formatter: ProtocolsFormatter
          }
        },
        createSuccessNextRoute: { name: 'VirtualAppDetail' },
        updateSuccessNextRoute: { name: 'VirtualAppDetail' }
      }
    }
  },
  async mounted() {
    this.loading = false
  },
  methods: {}
}
</script>

<style lang="scss" scoped></style>
