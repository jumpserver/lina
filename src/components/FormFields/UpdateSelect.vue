<template>
  <div>
    <el-button
      v-show="!isShow"
      type="text"
      class="button-text"
      :disabled="disabled"
      @click="isShow=true"
    >
      {{ iLabel }}
      <svg-icon class-name="icon" icon-class="switch" />
    </el-button>
    <Select2
      v-show="isShow"
      ref="select2"
      v-model="iValue"
      :disabled="disabled"
      v-bind="$attrs"
      @change="onSelectChange"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import Select2 from './Select2'
import { hasUUID } from '@/utils/common'

export default {
  components: {
    Select2
  },
  props: {
    value: {
      type: String,
      default: () => ''
    },
    label: {
      type: String,
      default: () => ''
    },
    showSelect: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShow: this.showSelect,
      iLabel: this.label
    }
  },
  computed: {
    iValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  created() {
    const { path } = this.$route
    if (hasUUID(path) && this.value) {
      this.isShow = false
    }
  },
  methods: {
    onSelectChange(val) {
      const options = this.$refs.select2.options.filter(item => item.value === val)
      const label = options.length > 0 ? options[0].label : ''
      this.isShow = false
      this.iLabel = val ? label : '-'
    }
  }
}
</script>

<style scoped>
.button-text {
  color: #676a6c;
  padding: 5px!important;
}
.icon {
  color: #676a6c!important;
}
</style>
