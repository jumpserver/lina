<template>
  <tr>
    <td>{{ action.title }}:</td>
    <td>
      <el-popover
        placement="left-end"
        trigger="hover"
        :disabled="!action.attrs.showTip"
        :content="action.attrs.tip"
      >
        <span slot="reference">
          <component
            :is="iType"
            v-model="action.attrs.model"
            v-bind="action.attrs"
            v-on="callbacks"
          >
            {{ label }}
          </component>
        </span>
      </el-popover>
    </td>
  </tr>
</template>

<script>
import Switcher from '@/components/Form/FormFields/Switcher'
import Select2 from '@/components/Form/FormFields/Select2'
import UpdateSelect from '@/components/Form/FormFields/UpdateSelect'

class Action {
  constructor() {
    this.title = ''
    this.type = ''
    this.attrs = {}
    this.callbacks = ''
  }
}

export default {
  name: 'ActionItem',
  components: {
    Switcher,
    Select2,
    UpdateSelect
  },
  props: {
    action: {
      type: [Action, Object],
      default: () => ({ title: '' })
    }
  },
  data() {
    return {
      empty: () => {
      }
    }
  },
  computed: {
    iType() {
      switch (this.action.type) {
        case 'switch':
          return 'Switcher'
        case 'switcher':
          return 'Switcher'
        case 'select2':
          return 'Select2'
        case 'updateSelect':
          return 'UpdateSelect'
        default:
          return 'el-button'
      }
    },
    label() {
      return this.action.attrs ? this.action.attrs.label : ''
    },
    model() {
      return this.action.attrs ? this.action.attrs.model : ''
    },
    callbacks() {
      const wrappers = {}
      const callbacks = this.action.callbacks || {}
      for (const [event, callback] of Object.entries(callbacks)) {
        wrappers[event] = (e) => callback(e, this.action)
      }
      return wrappers
    }
  }
}
</script>

<style scoped>

</style>
