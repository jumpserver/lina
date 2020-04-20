<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="title" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/cmd-filters/',
        columns: [
          {
            prop: 'name',
            label: this.$t('assets.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'CommandFilterDetail'
          },
          {
            prop: 'rules.length',
            label: this.$t('assets.rules')
          },
          {
            prop: 'system_users.length',
            label: this.$t('assets.systemUser')
          },
          {
            prop: 'comment',
            label: this.$t('assets.comment'),
            sortable: 'custom'
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/cmd-filters/${id}/`
                return this.$axios.delete(url)
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
        createRoute: 'CommandFilterCreate'
      }
    }
  },
  computed: {
    title() {
      return this.$t('系统用户可以绑定一些命令过滤器，一个过滤器可以定义一些规则 当用户使用这个系统用户登录资产，然后执行一个命令 这个命令需要被绑定过滤器的所有规则匹配，高优先级先被匹配， 当一个规则匹配到了，如果规则的动作是允许，这个命令会被放行， 如果规则的动作是禁止，命令将会被禁止执行， 否则就匹配下一个规则，如果最后没有匹配到规则，则允许执行\n')
    }
  }
}
</script>

<style>

</style>
