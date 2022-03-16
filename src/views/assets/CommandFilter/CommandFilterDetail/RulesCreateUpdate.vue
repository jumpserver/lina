<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :initial="initial"
    :fields-meta="fieldsMeta"
    :url="url"
    :has-detail-in-msg="false"
    :get-next-route="getNextRoute"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import Select2 from '@/components/FormFields/Select2'
import rules from '@/components/DataForm/rules'
export default {
  name: 'RulesCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    const filterId = this.$route.query.filter || '00000000-0000-0000-0000-000000000000'
    const regexPlaceholder = 'rm.*|reboot|shutdown'
    const commandPlaceholder = 'rm\rreboot'
    const commandHelpText = this.$t('assets.CommandFilterRuleContentHelpText')
    const vm = this
    return {
      initial: {
        filter: filterId,
        type: 'regex',
        action: 0
      },
      fields: [
        [this.$t('common.Basic'), ['filter', 'type', 'content', 'ignore_case', 'priority', 'action', 'reviewers', 'comment']]
      ],
      fieldsMeta: {
        filter: {
          component: Select2,
          el: {
            ajax: {
              url: '/api/v1/assets/cmd-filters/'
            },
            disabled: true,
            multiple: false
          }
        },
        type: {
          on: {
            change: ([val]) => {
              if (val === 'command') {
                vm.fieldsMeta.content.el.placeholder = commandPlaceholder
                vm.fieldsMeta.content.helpText = commandHelpText
              } else {
                vm.fieldsMeta.content.el.placeholder = regexPlaceholder
                vm.fieldsMeta.content.helpText = ''
              }
            }
          }
        },
        content: {
          type: 'input',
          el: {
            type: 'textarea',
            placeholder: 'rm.*|reboot|shutdown',
            rows: 4
          },
          helpText: ''
        },
        priority: {
          // helpText: '优先级可选范围为1-100，1最低优先级，100最高优先级'
          // helpText: this.$t('assets.CommandFilterRulePriorityHelpText')
        },
        reviewers: {
          hidden: (item) => item.action !== 2,
          rules: [rules.RequiredChange],
          el: {
            value: [],
            ajax: {
              url: '/api/v1/users/users/?fields_size=mini',
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
          }
        }
      },
      getNextRoute(res, method) {
        return {
          name: 'CommandFilterDetail',
          params: {
            id: res.filter
          },
          query: {
            activeTable: 'rules'
          }
        }
      },
      url: `/api/v1/assets/cmd-filters/${filterId}/rules/`
    }
  }
}
</script>

<style lang='less' scoped>

</style>
