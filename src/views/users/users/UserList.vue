<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { mapGetters } from 'vuex'
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/users/users/',
        columns: [
          'name', 'username', 'groups_display', 'role', 'source', 'is_valid', 'actions'
        ],
        columnsMeta: {
          source: {
            width: '100px'
          },
          role: {
            width: '100px'
          },
          groups_display: {
            width: '200px',
            showOverflowTooltip: true
          },
          actions: {
            hasDelete: () => this.currentOrgIsDefault,
            extraActions: [
              {
                title: this.$t('users.Remove'),
                name: 'remove',
                type: 'warning',
                has: () => !this.currentOrgIsDefault,
                callback: this.removeUserFromOrg
              }
            ]
          }
        }
      },
      headerActions: {
        extraMoreActions: [
          {
            name: 'disableSelected',
            title: this.$t('common.disableSelected'),
            callback: () => {
              console.log('disableSelected')
            }
          },
          {
            name: 'activateSelected',
            title: this.$t('common.activateSelected'),
            callback: () => {
              console.log('activateSelected')
            }
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'currentOrg',
      'currentUser',
      'device'
    ]),
    currentOrgIsDefault() {
      console.log('Current org is default: ', this.currentOrg.id === 'DEFAULT')
      return this.currentOrg.id === 'DEFAULT'
    }
  },
  methods: {
    removeUserFromOrg({ row, col, reload }) {
      const msg = this.$t('users.removeWarningMsg') + ' "' + row.name + '"'
      const title = this.$t('common.Info')
      const performDelete = function() {
        const url = `/api/v1/users/users/${row.id}/`
        return this.$axios.delete(url)
      }
      this.$alert(msg, title, {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        showCancelButton: true,
        beforeClose: async(action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          try {
            await performDelete.bind(this)({ row: row, col: col })
            done()
            reload()
            this.$message.success(this.$t('users.removeSuccessMsg'))
          } catch (error) {
            this.$message.error(this.$t('users.removeErrorMsg' + ' ' + error))
          } finally {
            instance.confirmButtonLoading = false
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
