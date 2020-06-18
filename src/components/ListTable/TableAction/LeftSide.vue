<template>
  <ActionsGroup v-if="hasLeftActions" :actions="actions" :more-actions="moreActions" :more-actions-title="moreActionsTitle" v-bind="$attrs" class="header-action" />
</template>

<script>
import ActionsGroup from '@/components/ActionsGroup'
import { createSourceIdCache } from '@/api/common'
import { cleanActions } from './utils'

const defaultTrue = { type: Boolean, default: true }
const defaultFalse = { type: Boolean, default: false }
export default {
  name: 'LeftSide',
  components: {
    ActionsGroup
  },
  props: {
    hasCreate: defaultTrue,
    hasBulkDelete: defaultTrue,
    hasBulkUpdate: defaultFalse,
    hasLeftActions: defaultTrue,
    tableUrl: {
      type: String,
      default: ''
    },
    createRoute: {
      type: [String, Object],
      default: function() {
        return this.$route.name.replace('List', 'Create')
      }
    },
    reloadTable: {
      type: Function,
      default: () => {}
    },
    performBulkDelete: {
      type: Function,
      default: null
    },
    selectedRows: {
      type: Array,
      default: () => ([])
    },
    extraActions: {
      type: Array,
      default: () => ([])
    },
    extraMoreActions: {
      type: Array,
      default: () => ([])
    },
    moreActionsTitle: {
      type: String,
      default: null
    },
    moreActionsButton: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      defaultActions: [
        {
          name: 'actionCreate',
          title: this.$t('common.Create'),
          type: 'primary',
          has: this.hasCreate,
          can: true,
          callback: this.handleCreate
        }
      ],
      defaultMoreActions: [
        {
          title: this.$t('common.deleteSelected'),
          name: 'actionDeleteSelected',
          has: this.hasBulkDelete,
          can({ selectedRows }) {
            // vm.$log.debug('Delete select rows length: ', selectedRows.length)
            return selectedRows.length > 0
          },
          callback: this.defaultBulkDeleteCallback
        },
        {
          title: this.$t('common.updateSelected'),
          name: 'actionUpdateSelected',
          has: this.hasBulkUpdate,
          can: ({ selectedRows }) => selectedRows.length > 0,
          callback: this.handleBulkUpdate
        }
      ]
    }
  },
  computed: {
    actions() {
      const actions = [...this.defaultActions, ...this.extraActions]
      return cleanActions(actions, true, {
        selectedRows: this.selectedRows,
        reloadTable: this.reloadTable
      })
    },
    moreActions() {
      const actions = [...this.defaultMoreActions, ...this.extraMoreActions]
      return cleanActions(actions, true, {
        selectedRows: this.selectedRows,
        reloadTable: this.reloadTable
      })
    },
    hasSelectedRows() {
      return this.selectedRows.length > 0
    }
  },
  methods: {
    handleCreate() {
      let route = {}
      if (typeof this.createRoute === 'string') {
        route.name = this.createRoute
      } else {
        route = this.createRoute
      }
      this.$router.push(route)
      this.$log.debug('handle create')
    },
    defaultBulkDeleteCallback({ selectedRows, reloadTable }) {
      const msg = this.$t('common.deleteWarningMsg') + ' ' + selectedRows.length + ' ' + this.$t('common.rows') + ' ?'
      const title = this.$t('common.Info')
      const performDelete = this.performBulkDelete || this.defaultPerformBulkDelete
      this.$alert(msg, title, {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        showCancelButton: true,
        beforeClose: async(action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          try {
            await performDelete(selectedRows)
            done()
            reloadTable()
            this.$message.success(this.$t('common.bulkDeleteSuccessMsg'))
          } catch (error) {
            this.$message.error(this.$t('common.bulkDeleteErrorMsg') + error)
          } finally {
            instance.confirmButtonLoading = false
          }
        }
      }).catch(() => {
        /* 取消*/
      })
    },
    async defaultPerformBulkDelete(selectedRows) {
      const ids = selectedRows.map((v) => {
        return v.id
      })
      const data = await createSourceIdCache(ids)
      const url = `${this.tableUrl}?spm=` + data.spm
      return this.$axios.delete(url)
    },
    handleBulkUpdate({ selectedRows }) {
    }
  }
}
</script>

<style scoped>
</style>
