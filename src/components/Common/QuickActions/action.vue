<template>
  <tr>
    <td>
      {{ getActionTitle(action) }}
      <el-tooltip v-if="action.attrs.showTip" :content="action.attrs.tip" :open-delay="500" effect="dark">
        <i class="fa fa-question-circle-o" />
      </el-tooltip>
    </td>
    <td>
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
    </td>
  </tr>
</template>

<script>
import Switcher from '@/components/Form/FormFields/Switcher.vue'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import UpdateSelect from '@/components/Form/FormFields/UpdateSelect.vue'
import { toSentenceCase } from '@/utils/common/index'

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
