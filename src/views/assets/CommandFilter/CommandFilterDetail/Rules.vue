<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
import { ActionsFormatter } from '@/components/ListTable/formatters'

export default {
  name: 'Rules',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/assets/cmd-filters/${this.object.id}/rules/`,
        columns: [
          {
            prop: 'type.display',
            label: this.$t('assets.Type')
          },
          {
            prop: 'content',
            label: this.$t('assets.Content')
          },
          {
            prop: 'priority',
            label: this.$t('assets.Priority')
          },
          {
            prop: 'action.display',
            label: this.$t('assets.RuleAction')
          },
          {
            prop: 'action.comment',
            label: this.$t('assets.Comment')
          },
          {
            prop: 'id',
            align: 'center',
            label: this.$t('assets.Action'),
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/cmd-filters/${this.object.id}/rules/${id}/`
                return this.$axios.delete(url).then(res => {
                  this.$message.success(this.$t('common.deleteSuccessMsg'))
                }).catch(err => {
                  this.$message.error(this.$t('common.deleteFailedMsg' + ' ' + err))
                })
              },
              onUpdate: ({ row, col }) => {
                console.log(this)
                this.$router.push({
                  name: 'CommandFilterRulesUpdate',
                  params: {
                    ruleid: this.object.id,
                    id: row.id
                  }
                })
              }

            }
          }
        ]
      },
      headerActions: {
        hasRightActions: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
        hasBulkDelete: false,
        hasSearch: true,
        extraActions: [
          {
            name: 'actionCreate',
            title: this.$t('assets.CreateRules'),
            type: 'primary',
            has: true,
            can: true,
            callback: this.createRoute.bind(this)
          }
        ],
        hasCreate: false
      }
    }
  },
  methods: {
    createRoute(val) {
      this.$router.push({
        name: 'CommandFilterRulesCreate',
        params: {
          ruleid: this.object.id
        }
      })
    }
  }
}
</script>

<style lang='less' scoped>

</style>
