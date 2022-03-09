<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'

export default {
  name: 'Rules',
  components: {
    GenericListTable
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
        permissions: {
          resource: 'commandfilterrule'
        },
        columns: ['type', 'content', 'ignore_case', 'action', 'priority', 'pattern', 'comment', 'actions'],
        columnsMeta: {
          type: {
            width: '100px'
          },
          ignore_case: {
            width: '100px',
            formatterArgs: {
              showFalse: false
            }
          },
          priority: {
            width: '70px'
          },
          action: {
            width: '90px'
          },
          content: {
            showOverflowTooltip: true
          },
          actions: {
            formatterArgs: {
              hasClone: false,
              updateRoute: {
                name: 'CommandFilterRulesUpdate',
                query: {
                  filter: this.object.id
                }
              }
            }
          }
        }
      },
      headerActions: {
        hasSearch: true,
        hasBulkDelete: false,
        hasMoreActions: false,
        createRoute: {
          name: 'CommandFilterRulesCreate',
          query: {
            filter: this.object.id
          }
        }
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
