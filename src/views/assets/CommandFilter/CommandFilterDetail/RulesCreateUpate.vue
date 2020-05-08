<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
export default {
  name: 'RulesCreateUpate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {
        filter: this.$route.params.ruleid,
        type: 'regex',
        priority: 50,
        action: 0
      },
      fields: [
        ['', ['filter', 'type', 'content', 'priority', 'action', 'comment']]
      ],
      fieldsMeta: {
        filter: {
          el: {
            disabled: true
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
      url: `/api/v1/assets/cmd-filters/${this.$route.params.ruleid}/rules/`
    }
  },
  computed: {

  }
}
</script>

<style lang='less' scoped>

</style>
