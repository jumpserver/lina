<template>
  <GenericUpdateFormDialog
    v-if="visible"
    :form-setting="formSetting"
    :selected-rows="selectedRows"
    :target-resource-setting="targetResourceSetting"
    :tips="tips"
    :visible="visible"
    @update="$emit('update', $event)"
    @update:visible="$emit('update:visible', $event)"
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
  emits: ['update', 'update:visible'],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedRows: {
      type: Array,
      default: () => []
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
      tips: this.$t('AssetBulkUpdateTips'),
      targetResourceSetting: {
        label: this.$t('Asset'),
        url: '/api/v1/assets/assets/?fields_size=mini',
        resourceName: this.$t('Assets'),
        queryParams: this.category === 'all' ? {} : { category: this.category },
        nodeFilter: {
          treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
          typeTreeUrl: '/api/v1/assets/nodes/category/tree/?count_resource=none',
          includeDescendants: true
        }
      },
      formSetting: {
        url: '/api/v1/assets/assets/',
        hasSaveContinue: false,
        fields: ['platform', 'nodes', 'zone', 'labels', 'is_active', 'comment'],
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
            rules: [{ required: false }],
            label: this.$t('Platform'),
            helpText: this.$t('UpdatePlatformHelpText')
          },
          nodes: {
            ...meta.nodes,
            label: this.$t('Node')
          },
          zone: {
            ...meta.zone,
            label: this.$tc('Zone'),
            disabled: exclude.includes(this.category)
          },
          labels: {
            ...meta.labels,
            label: this.$t('Tags')
          },
          is_active: {
            ...meta.is_active,
            label: this.$t('Active')
          },
          comment: {
            label: this.$t('Comment'),
            hidden: () => false
          }
        }
      }
    }
  }
}
</script>

<style scoped></style>
