<template>
  <div>
    <el-radio-group v-model="currentValue.strategy" @change="onChange">
      <el-radio
        v-for="item in radioGroup.options"
        :key="item.value"
        :label="item.value"
      >
        {{ item.label }}
      </el-radio>
    </el-radio-group>
    <Select2
      v-show="isHidden('objects')"
      ref="select2"
      v-model="currentValue.objects"
      v-bind="Object.assign(newObjects, objects)"
    />
    <ResourceTable
      v-show="isHidden('attrs')"
      v-model="currentValue.attrs"
      :attrs-option="attrsOption"
      :new-attrs="newAttrs"
    />
  </div>
</template>

<script>
import { Select2 } from '@/components/FormFields'
import ResourceTable from './components/ResourceTable'
export default {
  components: {
    Select2,
    ResourceTable
  },
  props: {
    value: {
      type: Object,
      default: () => {}
    },
    // Custom select2 configuration
    objects: {
      type: Object,
      default: () => {}
    },
    // Custom attrs form configuration
    attrsOption: {
      type: Object,
      default: () => {}
    },
    // Get the configuration returned by the option interface
    fields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      radioGroup: {},
      newObjects: {},
      newAttrs: {},
      currentValue: {
        strategy: this.value.strategy || 'all',
        objects: this.value.objects || {},
        attrs: this.value.attrs || []
      }
    }
  },
  computed: {
    isHidden() {
      return value => {
        return this.currentValue.strategy === value
      }
    }
  },
  watch: {
    currentValue: {
      handler(val) {
        let strategy = val.strategy
        const obj = { [val.strategy]: this.currentValue[val.strategy] }
        if (strategy === 'all') strategy = ''
        this.$emit('change', {
          strategy: val.strategy,
          ...(strategy && obj)
        })
      },
      deep: true
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.fields.forEach(item => {
        if (item.id === 'strategy') this.radioGroup = item
        if (item.id === 'objects') this.newObjects = item
        if (item.id === 'attrs') this.newAttrs = item
      })
      // console.log(this.value, 'vvvv-----')
      // console.log(this.currentValue, 'currentValue----------------')
      console.log(this.fields, '-------fields-------zujian')
      // console.log(this.newObjects, 'this.newObjects--')
      // console.log(this.newAttrs, 'this.newAttrs')
    },
    onChange(val) {
      this.currentValue.strategy = val
    }
  }
}
</script>

<style scoped>
</style>
