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
    const exclude = ['device', 'cloud', 'web']
    const platformQuery = this.category === 'all' ? '' : this.category
    return {
      tips: this.$t('assets.AssetBulkUpdateTips'),
      formSetting: {
        url: '/api/v1/assets/assets/',
        hasSaveContinue: false,
        fields: ['platform', 'nodes', 'domain', 'labels', 'is_active', 'comment'],
        fieldsMeta: {
          platform: {
            el: {
              multiple: false,
              ajax: {
                url: `/api/v1/assets/platforms/?category=${platformQuery}`,
                transformOption: (item) => {
                  return { label: item.name, value: item.id }
                }
              }
            },
            rules: [
              { required: false }
            ],
            label: this.$t('assets.Platform'),
            helpText: this.$t('assets.BulkUpdatePlatformHelpText')
          },
          nodes: {
            ...meta.nodes,
            label: this.$t('assets.Node')
          },
          domain: {
            ...meta.domain,
            label: this.$t('assets.Domain'),
            disabled: exclude.includes(this.category)
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
