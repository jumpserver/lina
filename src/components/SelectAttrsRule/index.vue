<template>
  <div>
    <el-radio-group v-model="curValue.current">
      <el-radio
        v-for="(item, index) in assetsChoice"
        :key="index"
        :label="index + 1"
      >
        {{ item }}
      </el-radio>
    </el-radio-group>
    <Select2
      v-show="curValue.current===2"
      ref="select2"
      v-model="curValue.specific"
      v-bind="assets"
    />
    <CurTable
      v-show="curValue.current===3"
      v-model="curValue.assetsMatch"
      v-bind="assetsMatch"
    />
  </div>
</template>

<script>
import { Select2 } from '@/components/FormFields'
import CurTable from './components/CurTable'

export default {
  components: {
    Select2,
    CurTable
  },
  props: {
    valued: {
      type: Object,
      default: () => {
        return {
          current: 1,
          assets: {},
          assetsMatch: [
            {
              attrs: 'zichanming',
              operator: '=',
              content: '输入内容'
            },
            {
              attrs: 'ip',
              operator: '=<',
              content: '输入内容'
            }
          ]
        }
      }
    },
    assetsChoice: {
      type: Array,
      default: () => [
        '全部用户',
        '用户/用户组',
        '指定规则'
      ]
    },
    assets: {
      type: Object,
      default: () => {}
    },
    assetsMatch: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      curValue: {
        current: this.valued.current,
        all: '*',
        specific: this.assets.value || '',
        assetsMatch: this.valued.assetsMatch || []
      }
    }
  },
  watch: {
    curValue: {
      handler(val) {
        this.$emit('change', this.curValue)
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
  }
}
</script>

<style scoped>
</style>
