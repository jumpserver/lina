<template>
  <GenericUpdateFormDialog
    v-if="visible"
    :form-setting="formSetting"
    :selected-rows="selectedRows"
    :tips="tips"
    :visible="visible"
    v-on="$listeners"
  />
</template>

<script>
import { GenericUpdateFormDialog } from '@/layout/components'
import { assetFieldsMeta } from '@/views/assets/const'

export default {
  name: 'AssetBulkUpdateDialog',
  components: {
    GenericUpdateFormDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedRows: {
      type: Array,
      default: () => ([])
    },
    category: {
      type: String,
      default: ''
    }
  },
  data() {
    const meta = assetFieldsMeta(this)
    return {
      tips: this.$t('assets.AssetBulkUpdateTips'),
      formSetting: {
        url: '/api/v1/assets/assets/',
        hasSaveContinue: false,
        initial: {},
        fields: ['nodes', 'domain', 'labels', 'is_active', 'comment'],
        fieldsMeta: {
          nodes: {
            ...meta.nodes,
            label: this.$t('assets.Node')
          },
          domain: {
            ...meta.domain,
            label: this.$t('assets.Domain'),
            disabled: this.category === 'cloud'
          },
          labels: {
            ...meta.labels,
            label: this.$t('assets.Label')
          },
          is_active: {
            ...meta.is_active,
            label: this.$t('common.Active')
          },
          comment: {
            label: this.$t('common.Comment'),
            hidden: () => false
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
