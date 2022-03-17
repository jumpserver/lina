<template>
  <DataActions
    v-if="hasLeftActions"
    :actions="iActions"
    v-bind="$attrs"
    class="header-action"
  />
</template>

<script>
import i18n from '@/i18n/i18n'
import DataActions from '@/components/DataActions'
import { createSourceIdCache } from '@/api/common'
import { cleanActions } from './utils'

const defaultTrue = { type: [Boolean, Function], default: true }
const defaultFalse = { type: [Boolean, Function], default: false }
export default {
  name: 'LeftSide',
  components: {
    DataActions
  },
  props: {
    hasLeftActions: defaultTrue,
    hasCreate: defaultTrue,
    canCreate: defaultTrue,
    createRoute: {
      type: [String, Object, Function],
      default: function() {
        return this.$route.name.replace('List', 'Create')
      }
    },
    createInNewPage: {
      type: Boolean,
      default: false
    },
    hasBulkDelete: defaultTrue,
    canBulkDelete: defaultTrue,
    hasBulkUpdate: defaultFalse,
    canBulkUpdate: defaultTrue,
    hasMoreActions: defaultTrue,
    tableUrl: {
      type: String,
      default: ''
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
    moreCreates: {
      type: Object,
      default: null
    },
    createTitle: {
      type: String,
      default: () => i18n.t('common.Create')
    }
  },
  data() {
    const defaultActions = [
      {
        name: 'actionCreate',
        title: this.createTitle,
        type: 'primary',
        has: this.hasCreate && !this.moreCreates,
        can: this.canCreate,
        callback: this.handleCreate
      }
    ]
    if (this.moreCreates) {
      const defaultMoreCreate = {
        name: 'actionMoreCreate',
        title: this.createTitle,
        type: 'primary',
        has: true,
        can: this.canCreate,
        dropdown: [],
        callback: this.handleCreate
      }
      const createCreateAction = Object.assign(defaultMoreCreate, this.moreCreates)
      defaultActions.push(createCreateAction)
    }
    const vm = this
    return {
      defaultActions: defaultActions,
      defaultMoreActions: [
        {
          title: this.$t('common.deleteSelected'),
          name: 'actionDeleteSelected',
          has: this.hasBulkDelete,
          can({ selectedRows }) {
            // vm.$log.debug('Delete select rows length: ', selectedRows.length)
            return selectedRows.length > 0 && vm.canBulkDelete
          },
          callback: this.defaultBulkDeleteCallback
        },
        {
          title: this.$t('common.updateSelected'),
          name: 'actionUpdateSelected',
          has: this.hasBulkUpdate,
          can: ({ selectedRows }) => {
            return selectedRows.length > 0 && vm.canBulkUpdate
          },
          callback: this.handleBulkUpdate
        }
      ]
    }
  },
  computed: {
    iActions() {
      return [...this.actions, this.moreAction]
    },
    actions() {
      const actions = [...this.defaultActions, ...this.extraActions]
      return cleanActions(actions, true, {
        selectedRows: this.selectedRows,
        reloadTable: this.reloadTable
      })
    },
    moreAction() {
      if (!this.hasMoreActions) {
        return
      }
      let dropdown = _.uniqBy([...this.extraMoreActions, ...this.defaultMoreActions], 'name')
      dropdown = cleanActions(dropdown, true, {
        selectedRows: this.selectedRows,
        reloadTable: this.reloadTable
      })
      return {
        name: 'moreActions',
        title: this.moreActionsTitle || this.$t('common.MoreActions'),
        dropdown: dropdown
      }
    },
    hasSelectedRows() {
      return this.selectedRows.length > 0
    }
  },
  methods: {
    handleCreate() {
      let route
      if (typeof this.createRoute === 'string') {
        route = { name: this.createRoute }
        route.name = this.createRoute
      } else if (typeof this.createRoute === 'function') {
        route = this.createRoute()
      } else if (typeof this.createRoute === 'object') {
        route = this.createRoute
      }
      this.$log.debug('handle create')
      if (this.createInNewPage) {
        const { href } = this.$router.resolve(route)
        window.open(href, '_blank')
      } else {
        this.$router.push(route)
      }
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
      const url = (this.tableUrl.indexOf('?') === -1) ? `${this.tableUrl}?spm=` + data.spm : `${this.tableUrl}&spm=` + data.spm
      return this.$axios.delete(url)
    },
    handleBulkUpdate({ selectedRows }) {
    }
  }
}
</script>

<style scoped>
</style>
