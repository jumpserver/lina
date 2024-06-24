<template>
  <div>
    <el-checkbox
      v-if="hasCheckAll && options.length > 0"
      v-model="checkAll"
      :indeterminate="isIndeterminate"
      @change="handleCheckAllChange"
    >
      {{ $tc('SelectAll') }}
    </el-checkbox>
    <el-checkbox-group v-model="checked" @change="onChange">
      <el-alert v-show="tipShow" type="error"> {{ noOptionTip }}</el-alert>
      <el-checkbox v-for="item in options" :key="item.value" :label="item.value">{{ item.label }}</el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script>

export default {
  name: 'Checkbox',
  props: {
    value: {
      type: Array,
      default: () => ([])
    },
    url: {
      type: String,
      default: ''
    },
    processResults: {
      type: Function,
      default: (data) => data
    },
    noOptionTip: {
      type: String,
      default: () => ''
    },
    hasCheckAll: {
      type: Boolean,
      default: () => true
    }
  },
  data() {
    return {
      checkAll: false,
      tipShow: false,
      isIndeterminate: false,
      checked: this.value || [],
      options: []
    }
  },
  async mounted() {
    await this.getOptions()
    this.tipShow = this.options.length === 0 && this.noOptionTip
  },
  methods: {
    async getOptions() {
      const validateStatus = (status) => {
        if (status === 403) {
          return 200
        }
        return status
      }
      await this.$axios.get(this.url, { validateStatus }).then((data) => {
        this.processResults(data)?.forEach((v) => {
          this.options.push(v)
        })
        this.refreshCheckboxStatus()
      })
    },
    refreshCheckboxStatus() {
      const checkedCount = this.checked.length
      this.checkAll = checkedCount === this.options.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.options.length
    },
    onChange() {
      this.$log.debug('Current checked: ', this.checked)
      this.refreshCheckboxStatus()
      this.$emit('input', this.checked)
    },
    handleCheckAllChange(val) {
      this.checked = val ? this.options.map((o) => o.value) : []
      this.isIndeterminate = false
      this.$emit('input', this.checked)
    }
  }
}

</script>

<style scoped>
</style>
