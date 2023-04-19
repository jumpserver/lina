<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :initial="initial"
    :fields-meta="fieldsMeta"
    :url="url"
    :create-success-next-route="createSuccessNextRoute"
    v-bind="$data"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'

export default {
  name: 'CommandGroupCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    const regexPlaceholder = 'rm.*|reboot|shutdown'
    const commandPlaceholder = 'rm\rreboot'
    const commandHelpText = this.$t('assets.CommandFilterRuleContentHelpText')
    const vm = this
    return {
      initial: {},
      fields: [
        [this.$t('common.Basic'), ['name', 'type', 'content', 'ignore_case', 'comment']]
      ],
      url: `/api/v1/acls/command-groups/`,
      createSuccessNextRoute: { name: 'CommandFilterAclList' },
      updateSuccessNextRoute: { name: 'CommandFilterAclList' },
      fieldsMeta: {
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
            placeholder: commandPlaceholder,
            rows: 4
          },
          helpText: ''
        }
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
