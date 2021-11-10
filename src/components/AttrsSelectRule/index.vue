<template>
  <div>
    <el-radio-group v-model="curValue.strategy" @change="onChange">
      <el-radio
        v-for="(item, index) in radioGroup.options"
        :key="index"
        :label="item.value"
      >
        {{ item.label }}
      </el-radio>
    </el-radio-group>
    <Select2
      v-show="curValue.strategy==='objects'"
      ref="select2"
      v-model="curValue.objects"
      v-bind="Object.assign(newObjects, objects)"
    />
    <AttrsTable
      v-show="curValue.strategy==='attrs'"
      v-model="curValue.attrs"
      :attrs="attrs"
    />
  </div>
</template>

<script>
import { Select2 } from '@/components/FormFields'
import AttrsTable from './components/AttrsTable'

export default {
  components: {
    Select2,
    AttrsTable
  },
  props: {
    value: {
      type: Object,
      default: () => {}
    },
    objects: {
      type: Object,
      default: () => {}
    },
    attrs: {
      type: Array,
      default: () => []
    },
    // 获取接口返回的配置信息
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
      curValue: {
        strategy: this.value.strategy || 'all',
        objects: this.value.objects || [],
        attrs: this.value.attrs || {}
      }
    }
  },
  watch: {
    curValue: {
      handler(val) {
        let strategy = val.strategy
        const obj = { [val.strategy]: this.curValue[val.strategy] }
        if (strategy === 'all') {
          strategy = ''
        }
        this.$emit('change', {
          strategy: val.strategy,
          ...(strategy && obj)
        })
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    this.fields.filter(e => {
      if (e.id === 'strategy') {
        this.radioGroup = e
      }
      if (e.id === 'objects') {
        this.newObjects = e
      }
      if (e.id === 'attrs') {
        this.newAttrs = e
      }
    })
    console.log(this.value, 'vvvv-----')
    console.log(this.fields, '-------fields-------zujian')
    console.log(this.newObjects, 'this.newObjects--')
    console.log(this.newAttrs, 'this.newAttrs')
  },
  methods: {
    onChange(val) {
      this.curValue.strategy = val
    }
  }
}
</script>

<style scoped>
</style>
