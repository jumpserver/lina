<template>
  <div style="display: flex;">
    <Select2
      v-model="iValue"
      :options="options"
      :multiple="false"
      :clearable="false"
      :disabled="disabled"
      @change="onChange"
      @change-options="onChangeOptions"
    />
    <el-button
      v-if="showSetting"
      :disabled="!objectId"
      icon="el-icon-setting"
      size="mini"
      @click="onSettingClick()"
    />
    <el-dialog
      :title="title"
      :visible.sync="visible"
      width="80%"
      :show-cancel="false"
      :show-confirm="false"
    >
      <component :is="dialogComponent" ref="dialogRef" :config="config" @close-dialog="visible=false" />
    </el-dialog>
  </div>
</template>

<script>
import Select2 from './Select2'

export default {
  name: 'Select2SettingDialog',
  components: {
    Select2
  },
  props: {
    value: {
      type: [Array, String, Number, Boolean, Object],
      default: () => ([])
    },
    options: {
      type: Array,
      default: () => ([])
    },
    title: {
      type: String,
      default: () => ''
    },
    disabled: {
      type: Boolean,
      default: () => false
    },
    dialogComponent: {
      type: Object,
      default: () => ({})
    },
    objectId: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      visible: false,
      showSetting: false,
      config: {
        objectId: this.objectId,
        value: this.value
      }
    }
  },
  computed: {
    iValue: {
      set(val) {
        this.$log.debug('set iValue', val)
        this.$emit('input', val)
      },
      get() {
        return this.value
      }
    }
  },
  created() {
    this.adaptSelect2Setting(this.value)
  },
  methods: {
    adaptSelect2Setting(val) {
      this.showSetting = this.options.some((item) => {
        return item.value === val && item.canSetting
      })
    },
    onChange(val) {
      this.adaptSelect2Setting(val)
      this.config.value = val
      this.$log.debug('onChange .... ', val)
      this.$emit('change', val)
    },
    onChangeOptions(val) {
      this.$log.debug('onChangeOptions', val)
      this.$emit('changeOptions', val)
    },
    onSettingClick() {
      this.visible = true
    }
  }
}
</script>

<style scoped>

</style>
