<template>
  <GenericListTableDialog
    v-bind="config"
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
  />
</template>

<script>
import { GenericListTableDialog } from '@/layout/components'
import { SecretViewerFormatter } from '@/components/Table/TableFormatters'

export default {
  components: {
    GenericListTableDialog
  },
  props: {
    account: {
      type: Object,
      default: () => ({})
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible'],
  data() {
    return {
      config: {
        title: this.$t('HistoryPassword'),
        visible: false,
        width: '60%',
        tableConfig: {
          id: 'history_date',
          url: `/api/v1/accounts/account-secrets/${this.account.id}/histories/`,
          columns: ['secret', 'version', 'history_date'],
          columnsMeta: {
            secret: {
              label: this.$t('Password'),
              formatter: SecretViewerFormatter,
              formatterArgs: {
                hasDownload: false,
                name: this.account.name
              }
            },
            history_date: {
              label: this.$t('HistoryDate')
            },
            secret_type: {
              width: '200px'
            },
            version: {
              width: '100px'
            },
            actions: {
              has: false
            }
          }
        },
        headerActions: {
          hasLeftActions: false,
          hasSearch: false
        }
      }
    }
  }
}
</script>

<style scoped></style>
