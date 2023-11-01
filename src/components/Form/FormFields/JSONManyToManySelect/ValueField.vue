<template>
  <div v-if="!loading">
    <TagInput v-if="type === 'array'" :value="iValue" @input="handleInput" />
    <Select2 v-else-if="type === 'select'" :value="iValue" v-bind="attr.el" @change="handleInput" @input="handleInput" />
    <Switcher v-else-if="type === 'bool'" :value="iValue" @change="handleInput" @input="handleInput" />
    <el-input v-else :value="iValue" @input="handleInput" />
  </div>
</template>

<script>
import TagInput from '@/components/Form/FormFields/TagInput.vue'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import Switcher from '@/components/Form/FormFields/Switcher.vue'

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
  computed: {
    iValue: {
      get() {
        const multipleTypes = ['array', 'select']
        let newValue = this.value
        if (multipleTypes.includes(this.type)) {
          if (!Array.isArray(this.value)) {
            newValue = []
          }
        } else if (this.type === 'bool') {
          newValue = !!this.value
        } else {
          if (Array.isArray(this.value)) {
            newValue = ''
          } else {
            newValue = this.value.toString()
          }
        }
        if (this.value !== newValue) {
          this.handleInput(newValue)
        }
        return newValue
      }
    }
  },
  watch: {
    match() {
      this.changeValueType()
    },
    attr: {
      handler() {
        this.changeValueType()
      },
      deep: true
    }
  },
  mounted() {
    this.changeValueType()
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value)
    },
    changeValueType() {
      this.loading = true
      this.type = this.getType()
      this.$nextTick(() => {
        this.loading = false
      })
    },
    getType() {
      const attrType = this.attr.type || 'str'
      this.$log.debug('Value field attr type: ', attrType, this.attr, this.match)
      if (['m2m', 'fk', 'select'].includes(attrType)) {
        return 'select'
      } else if (attrType === 'bool') {
        return 'bool'
      }
      if (['in', 'ip_in'].includes(this.match)) {
        return 'array'
      } else if (this.match.startsWith('m2m')) {
        return 'select'
      } else {
        return 'string'
      }
    }
  }
}
</script>

<style scoped>

</style>
