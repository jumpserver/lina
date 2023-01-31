<template>
  <GenericUpdateFormDialog
    v-if="visible"
    :selected-rows="selectedRows"
    :form-setting="formSetting"
    :visible="visible"
    v-on="$listeners"
  />
</template>

<script>
import { GenericUpdateFormDialog } from '@/layout/components'

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
    }
  },
  data() {
    return {
      formSetting: {
        url: '/api/v1/assets/assets/',
        hasSaveContinue: false,
        initial: {},
        fields: [
          'domain', 'labels', 'comment'
        ],
        fieldsMeta: {
          domain: {
            label: this.$t('assets.Domain'),
            hidden: () => false,
            el: {
              multiple: false,
              ajax: {
                url: '/api/v1/assets/domains/'
              }
            }
          },
          labels: {
            label: this.$t('assets.Label'),
            hidden: () => false,
            el: {
              ajax: {
                url: '/api/v1/assets/labels/'
              }
            }
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
