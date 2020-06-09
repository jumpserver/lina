<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :initial="initial"
    :fields-meta="fieldsMeta"
    :url="url"
    :create-success-next-route="createSuccessNextRoute"
    :update-success-next-route="updateSuccessNextRoute"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
export default {
  name: 'RulesCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    const filterId = this.$route.params.id
    return {
      initial: {
        filter: filterId,
        type: 'regex',
        priority: 50,
        action: 0
      },
      fields: [
        [this.$t('common.Basic'), ['filter', 'type', 'content', 'priority', 'action', 'comment']]
      ],
      fieldsMeta: {
        filter: {
          type: 'input',
          el: {
            disabled: true,
            multiple: false
          }
        },
        content: {
          type: 'input',
          el: {
            type: 'textarea',
            placeholder: 'rm.*|reboot|shutdown'
          },
          helpText: '每行一个命令'
        },
        priority: {
          helpText: '优先级可选范围为1-100，1最低优先级，100最高优先级'
        }
      },
      updateSuccessNextRoute: {
        name: 'CommandFilterList'
      },
      createSuccessNextRoute: {
        name: 'CommandFilterList'
      },
      url: `/api/v1/assets/cmd-filters/${filterId}/rules/`
    }
  },
  computed: {
  },
  mounted() {
    console.log(this.url)
  }
}
</script>

<style lang='less' scoped>

</style>
