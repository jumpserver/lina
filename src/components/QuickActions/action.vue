<template>
  <tr>
    <td>{{ action.title }}:</td>
    <td>
      <span>
        <component :is="iType" v-model="action.attrs.model" v-bind="action.attrs" v-on="callbacks">{{ label }}</component>
      </span>
    </td>
  </tr>
</template>

<script>
import Switch from '../FormFields/Swicher'
export default {
  name: 'ActionItem',
  components: {
    Switch
  },
  props: {
    action: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      empty: () => {}
    }
  },
  computed: {
    iType() {
      switch (this.action.type) {
        case 'switcher':
          return 'Switch'
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
