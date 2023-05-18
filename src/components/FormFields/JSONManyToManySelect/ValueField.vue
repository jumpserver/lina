<template>
  <div v-if="!loading">
    <TagInput v-if="type === 'array'" :value="value" @input="handleInput" />
    <Select2 v-else-if="type === 'select'" :value="value" v-bind="attr.el" @change="handleInput" @input="handleInput" />
    <Switcher v-else-if="type === 'bool'" :value="value" @change="handleInput" />
    <el-input v-else :value="value" @input="handleInput" />
  </div>
</template>

<script>
import TagInput from '@/components/FormFields/TagInput.vue'
import Select2 from '@/components/FormFields/Select2.vue'
import Switcher from '@/components/FormFields/Switcher.vue'

export default {
  name: 'ValueField',
  components: { Switcher, TagInput, Select2 },
  props: {
    value: {
      type: [String, Number, Boolean, Array, Object],
      default: () => ''
    },
    match: {
      type: String,
      default: 'exact'
    },
    attr: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: true,
      type: 'string'
    }
  },
  watch: {
    match() {
      this.getSetType()
    },
    attr: {
      handler() {
        this.getSetType()
      },
      deep: true
    }
  },
  mounted() {
    this.getSetType()
    this.loading = false
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value)
    },
    getSetType() {
      this.loading = true
      this.type = this.getType()
      if (['select', 'array'].includes(this.type) && typeof this.value === 'string') {
        const value = this.value ? this.value.split(',') : []
        console.log('Type: ', this.type, 'Value: ', value)
        this.handleInput(value)
      }
      this.$nextTick(() => {
        this.loading = false
      })
    },
    getType() {
      const attrType = this.attr.type
      if (attrType === 'm2m') {
        return 'select'
      } else if (attrType === 'bool') {
        return 'bool'
      } else if (attrType === 'select') {
        return 'select'
      }
      if (['in', 'ip_in'].includes(this.match)) {
        return 'array'
      } else {
        return 'string'
      }
    }
  }
}
</script>

<style scoped>

</style>
