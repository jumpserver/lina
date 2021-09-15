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
import Protocols from '@/views/assets/Asset/components/Protocols'
import rules from '@/components/DataForm/rules'
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
        initial: {
          platform: 'Linux',
          protocols: ['ssh/22']
        },
        fields: [
          'platform', 'protocols', 'domain', 'admin_user', 'labels', 'comment'
        ],
        fieldsMeta: {
          platform: {
            label: this.$t('assets.Platform'),
            hidden: () => false,
            el: {
              multiple: false,
              ajax: {
                url: '/api/v1/assets/platforms/',
                transformOption: (item) => {
                  return { label: `${item.name}`, value: item.name }
                }
              }
            }
          },
          protocols: {
            label: this.$t('assets.Protocols'),
            component: Protocols
          },
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
          admin_user: {
            rules: [rules.RequiredChange],
            label: this.$t('assets.AdminUser'),
            hidden: () => false,
            el: {
              multiple: false,
              ajax: {
                url: '/api/v1/assets/admin-users/',
                transformOption: (item) => {
                  return { label: `${item.name}(${item.username})`, value: item.id }
                }
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
