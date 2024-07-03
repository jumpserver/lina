<template>
  <tr>
    <td>{{ getActionTitle(action) }}</td>
    <td>
      <el-popover
        :content="action.attrs.tip"
        :disabled="!action.attrs.showTip"
        placement="left-end"
        trigger="hover"
      >
        <span slot="reference">
          <component
            :is="iType"
            v-model="action.attrs.model"
            :title="label"
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
import { toSentenceCase } from '@/utils/common'

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
  },
  methods: {
    getActionTitle(action) {
      return toSentenceCase(action.title)
    }
  }
}
</script>
