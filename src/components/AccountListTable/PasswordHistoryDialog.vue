<template>
  <GenericListTableDialog :visible.sync="iVisible" v-bind="config" />
</template>

<script>
import { GenericListTableDialog } from '@/layout/components'

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
          url: `/api/v1/assets/account-secrets/${this.account.id}/histories/`,
          columns: [
            'name', 'version', 'password', 'date_created'
          ],
          columnsShow: {
            min: ['name'],
            default: [
              'name', 'version', 'password', 'date_created'
            ]
          },
          columnsMeta: {
            name: {
              showOverflowTooltip: true
            }
          }
        },
        headerActions: {
          hasImport: false,
          hasExport: false,
          hasLeftActions: false,
          hasColumnSetting: false
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
  },
  created() {

  },
  methods: {

  }
}
</script>

<style scoped>

</style>
