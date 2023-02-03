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
            },
            on: {
              change: ([event], updateForm) => {
                if (!event?.pk) {
                  updateForm({ domain: '' })
                }
              }
            }
          },
          labels: {
            label: this.$t('assets.Label'),
            hidden: () => false,
            el: {
              ajax: {
                url: '/api/v1/assets/labels/',
                transformOption: (item) => {
                  return { label: `${item.name}:${item.value}`, value: item.id }
                }
              },
              allowCreate: true
            },
            on: {
              change: ([event], updateForm) => {
                const selects = this.filterSelectValues(event)
                updateForm({ labels: selects })
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
  },
  methods: {
    filterSelectValues(values) {
      if (!values) return
      const selects = []
      values.forEach((item) => {
        if (item.hasOwnProperty('pk')) {
          selects.push(item)
        } else {
          // 格式校验：不以:开头，不以:结尾
          const rule = /^(?!:).*(?<!:)$/
          if (item.name.indexOf(':') > -1 && rule.test(item.name)) {
            const [name, value] = item.name.split(':')
            const inputValue = { name, value }
            selects.push(inputValue)
          } else {
            this.$message.error(this.$t('assets.LabelInputFormatValidation'))
          }
        }
      })
      return selects
    }
  }
}
</script>

<style scoped>

</style>
