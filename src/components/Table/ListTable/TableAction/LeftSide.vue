<template>
  <DataActions
    v-if="hasLeftActions && iActions.length > 0"
    :actions="iActions"
    class="header-action"
    v-bind="$attrs"
  />
</template>

<script>
import { cleanActions } from './utils'
import { createSourceIdCache } from '@/api/common'
import { getErrorResponseMsg } from '@/utils/common/index'

import i18n from '@/i18n/i18n'
import DataActions from '@/components/Common/DataActions/index.vue'

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
      default: ''
    },
    beforeCreate: {
      type: Function,
      default: () => null
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
      default: () => {}
    },
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
      default: () => []
    },
    extraActions: {
      type: Array,
      default: () => []
    },
    extraMoreActions: {
      type: Array,
      default: () => []
    },
    moreActionsTitle: {
      type: String,
      default: ''
    },
    moreActionsType: {
      type: String,
      default: null
    },
    moreCreates: {
      type: Object,
      default: null
    },
    createTitle: {
      type: String,
      default: ''
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
          icon: 'trash',
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
    iCreateTitle() {
      return this.createTitle || this.$t('Create')
    },
    iCreateRoute() {
      return this.createRoute || this.$route?.name?.replace('List', 'Create')
    },
    defaultActions() {
      const defaultActions = [
        {
          name: 'actionCreate',
          title: this.iCreateTitle,
          type: 'primary',
          has: this.hasCreate && !this.moreCreates,
          can: this.canCreate,
          icon: 'plus',
          callback: () => {
            this.beforeCreate()
            const callback = this.onCreate || this.handleCreate
            callback()
          }
        }
      ]
      if (this.moreCreates) {
        const defaultMoreCreate = {
          name: 'actionMoreCreate',
          title: this.iCreateTitle,
          type: 'primary',
          has: true,
          icon: 'plus',
          can: this.canCreate,
          dropdown: [],
          callback: () => {
            this.beforeCreate()
            const callback = this.onCreate || this.handleCreate
            callback()
          }
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
          title: this.$t('BatchProcessing', { number: this.selectedRows.length }),
          divided: true,
          has: function({ selectedRows }) {
            return selectedRows.length > 0
          },
          class: 'more-batch-processing',
          can: true
        }
      ]
      let dropdown = _.uniqBy(
        [...invariantActions, ...this.extraMoreActions, ...this.defaultMoreActions],
        'name'
      )
      dropdown = cleanActions(dropdown, true, {
        selectedRows: this.selectedRows,
        reloadTable: this.reloadTable
      })
      return {
        name: 'moreActions',
        title: this.moreActionsTitle || this.$t('MoreActions'),
        dropdown: dropdown,
        type: this.moreActionsType
      }
    },
    hasSelectedRows() {
      return this.selectedRows.length > 0
    }
  },
  mounted() {
    this.$emit('init-actions-done', this.iActions)
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
      const msg =
        this.$t('DeleteWarningMsg') + ' ' + selectedRows.length + ' ' + this.$t('Rows') + ' ?'
      const title = this.$tc('Info')
      const performDelete = this.performBulkDelete || this.defaultPerformBulkDelete
      this.$alert(msg, title, {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        showCancelButton: true,
        beforeClose: async (action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          try {
            await performDelete(selectedRows)
            done()
            reloadTable()
            this.$message.success(this.$tc('BulkDeleteSuccessMsg'))
          } catch (error) {
            const msg = getErrorResponseMsg(error)
            this.$message.error(this.$tc('BulkDeleteErrorMsg') + msg)
          } finally {
            instance.confirmButtonLoading = false
          }
        }
      }).catch(() => {
        /* 取消*/
      })
    },
    async defaultPerformBulkDelete(selectedRows) {
      const ids = selectedRows.map(v => {
        return v.id
      })
      const data = await createSourceIdCache(ids)
      const url =
        this.tableUrl.indexOf('?') === -1
          ? `${this.tableUrl}?spm=` + data.spm
          : `${this.tableUrl}&spm=` + data.spm
      return this.$axios.delete(url)
    }
  }
}
</script>

<style lang="scss" scoped></style>
