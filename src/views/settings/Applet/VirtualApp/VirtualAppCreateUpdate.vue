<template>
  <GenericCreateUpdatePage v-bind="config" v-if="!loading" />
</template>

<script>
import { markRaw } from 'vue'
import { MatchExcludeParenthesis, Required } from '@/components/Form/DataForm/rules'
import { Select2, TagInput } from '@/components/Form/FormFields'
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
        initial: {
          protocols: [],
          tags: []
        },
        fields: [
          [this.$t('Basic'), ['name', 'display_name', 'version', 'author']],
          [this.$t('VirtualAppImages'), ['image_name', 'image_protocol', 'image_port']],
          [this.$t('Protocol'), ['protocols']],
          [this.$t('Other'), ['tags', 'is_active', 'comment']]
        ],
        fieldsMeta: {
          name: {
            rules: [Required, MatchExcludeParenthesis]
          },
          protocols: {
            label: this.$t('Protocols'),
            type: 'select',
            component: markRaw(Select2),
            el: {
              multiple: true,
              url: '/api/v1/assets/protocols/',
              ajax: {
                transformOption: (item) => ({ label: item.label, value: item.value })
              }
            }
          },
          tags: {
            type: 'input',
            component: markRaw(TagInput)
          }
        },
        objectDetailRoute: { name: 'VirtualAppDetail' },
        getNextRoute: (res) => ({ name: 'VirtualAppDetail', params: { id: res.id } })
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
