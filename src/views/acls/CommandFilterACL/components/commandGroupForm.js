import CommandMatchMode from './CommandMatchMode.vue'
import CommandRuleEditor from './CommandRuleEditor.vue'

export function getCommandGroupFormConfig(vm) {
  return {
    initial: {
      type: 'command',
      ignore_case: true
    },
    fields: [
      [vm.$t('BasicInfo'), ['name']],
      [vm.$t('CommandRules'), ['type', 'content', 'ignore_case']],
      [vm.$t('Other'), ['comment']]
    ],
    fieldsMeta: {
      content: {
        label: vm.$t('CommandRules'),
        component: CommandRuleEditor,
        el: {
          placeholder: 'rm\nreboot\nsystemctl restart sshd',
          rows: 6
        }
      },
      ignore_case: {
        label: vm.$t('IgnoreCase'),
        type: 'checkbox',
        required: false,
        rules: []
      },
      type: {
        label: vm.$t('CommandMatchMode'),
        component: CommandMatchMode,
        required: false,
        rules: []
      }
    }
  }
}
