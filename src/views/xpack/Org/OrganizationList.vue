<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
const performDelete = function({ row, col }) {
  const id = row.id
  const url = `${this.url}${id}/`
  return this.$axios.delete(url)
}
export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/orgs/orgs/',
        columns: ['name', 'comment', 'actions'],
        columnsMeta: {
          actions: {
            prop: '',
            formatterArgs: {
              onDelete: function({ row, col, cellValue, reload }) {
                const msg = this.$t('xpack.Organization.DeleteOrgMsg')
                const title = this.$t('xpack.Organization.DeleteOrgTitle')
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
                      this.$message.success(this.$t('common.deleteSuccessMsg'))
                    } finally {
                      instance.confirmButtonLoading = false
                    }
                  }
                }).catch(() => {
                  /* 取消*/
                })
              }
            }
          }
        }
      },
      headerActions: {
        hasRightActions: false,
        hasBulkDelete: false
      }
    }
  }
}
</script>

<style scoped>

</style>
