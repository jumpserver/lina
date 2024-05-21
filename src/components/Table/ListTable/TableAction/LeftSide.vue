<template>
  <DataActions
    v-if="hasLeftActions"
    :actions="iActions"
    class="header-action"
    v-bind="$attrs"
  />
</template>

<script>
import i18n from '@/i18n/i18n'
import DataActions from '@/components/DataActions/index.vue'
import { createSourceIdCache } from '@/api/common'
import { cleanActions } from './utils'

const defaultTrue = { type: [Boolean, Function, String], default: true }
const defaultFalse = { type: [Boolean, Function, String], default: false }
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
      default() {
        return this.$route.name?.replace('List', 'Create')
      }
    },
    onCreate: {
      type: Function,
      default: null
    },
    createInNewPage: {
      type: Boolean,
      default: false
    },
    hasBulkDelete: defaultTrue,
    canBulkDelete: defaultTrue,
    hasBulkUpdate: defaultFalse,
    canBulkUpdate: defaultTrue,
    handleBulkUpdate: {
      type: Function,
      default: () => {
      }
    },
    hasMoreActions: defaultTrue,
    tableUrl: {
      type: String,
      default: ''
    },
    reloadTable: {
      type: Function,
      default: () => {
      }
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
      default: () => i18n.t('Create')
    }
  },
  data() {
    const vm = this
    return {
      defaultMoreActions: [
        {
          title: this.$t('DeleteSelected'),
          name: 'actionDeleteSelected',
          has: this.hasBulkDelete,
          icon: 'fa fa-trash-o',
          can({ selectedRows }) {
            return selectedRows.length > 0 && vm.canBulkDelete
          },
          callback: this.defaultBulkDeleteCallback
        },
        {
          title: this.$t('UpdateSelected'),
          name: 'actionUpdateSelected',
          has: this.hasBulkUpdate,
          icon: 'batch-update',
          can: function({ selectedRows }) {
            let canBulkUpdate = vm.canBulkUpdate
            if (typeof canBulkUpdate === 'function') {
              canBulkUpdate = canBulkUpdate({ selectedRows })
            }
            return selectedRows.length > 0 && canBulkUpdate
          },
          callback: this.handleBulkUpdate
        }
      ]
    }
  },
  computed: {
    defaultActions() {
      const defaultActions = [
        {
          name: 'actionCreate',
          title: this.createTitle,
          type: 'primary',
          has: this.hasCreate && !this.moreCreates,
          can: this.canCreate,
          icon: 'plus',
          callback: this.onCreate || this.handleCreate
        }
      ]
      if (this.moreCreates) {
        const defaultMoreCreate = {
          name: 'actionMoreCreate',
          title: this.createTitle,
          type: 'primary',
          has: true,
          icon: 'plus',
          can: this.canCreate,
          dropdown: [],
          callback: this.onCreate || this.handleCreate
        }
        const createCreateAction = Object.assign(defaultMoreCreate, this.moreCreates)
        defaultActions.push(createCreateAction)
      }
      return defaultActions
    },
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
      const invariantActions = [
        {
          name: 'batch',
          title: this.$t('BatchProcessing', { 'number': this.selectedRows.length }),
          divided: true,
          has: function({ selectedRows }) {
            return selectedRows.length > 0
          },
          class: 'more-batch-processing',
          can: true
        }
      ]
      let dropdown = _.uniqBy([...invariantActions, ...this.extraMoreActions, ...this.defaultMoreActions], 'name')
      dropdown = cleanActions(dropdown, true, {
        selectedRows: this.selectedRows,
        reloadTable: this.reloadTable
      })
      return {
        name: 'moreActions',
        title: this.moreActionsTitle || this.$t('MoreActions'),
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
      const msg = this.$t('DeleteWarningMsg') + ' ' + selectedRows.length + ' ' + this.$t('Rows') + ' ?'
      const title = this.$tc('Info')
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
            this.$message.success(this.$tc('BulkDeleteSuccessMsg'))
          } catch (error) {
            this.$message.error(this.$tc('BulkDeleteErrorMsg') + error.message)
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
    }
  }
}
</script>

<style scoped>
</style>
