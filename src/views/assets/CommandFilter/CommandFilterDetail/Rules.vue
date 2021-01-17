<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'

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
        columns: ['type', 'content', 'priority', 'action', 'comment', 'actions'],
        columnsMeta: {
          type: {
            width: '100px'
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
