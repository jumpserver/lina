<template>
  <GenericListTableDialog :visible.sync="iVisible" v-bind="config" />
</template>

<script>
import { GenericListTableDialog } from '@/layout/components'
import { ShowKeyCopyFormatter } from '@/components/Table/TableFormatters'

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
  data() {
    return {
      config: {
        title: this.$t('accounts.HistoryPassword'),
        visible: false,
        width: '60%',
        tableConfig: {
          id: 'history_date',
          url: `/api/v1/accounts/account-secrets/${this.account.id}/histories/`,
          columns: ['secret', 'version', 'history_date'],
          columnsMeta: {
            secret: {
              label: this.$t('assets.Password'),
              formatter: ShowKeyCopyFormatter,
              formatterArgs: {
                hasDownload: false,
                name: this.account.name
              }
            },
            history_date: {
              label: this.$t('accounts.HistoryDate')
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
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  }
}
</script>

<style scoped>

</style>
