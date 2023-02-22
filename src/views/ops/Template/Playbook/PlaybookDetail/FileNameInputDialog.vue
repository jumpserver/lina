<template>
  <Dialog
    :title="$tc('common.Create')"
    :visible.sync="iVisible"
    width="25%"
    top="1vh"
    :show-cancel="true"
    :show-confirm="true"
    @confirm="onConfirm"
  >

    <el-form ref="form" label-width="80px">
      <el-form-item :label="$tc('common.Filename')">
        <el-input v-model="newFileName" />
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'

export default {
  components: {
    Dialog
  },
  props: {
    fileName: {
      type: String,
      default: () => {}
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      newFileName: ''
    }
  },
  computed: {
    iVisible: {
      set(val) {
        this.$emit('update:visible', val)
      },
      get() {
        return this.visible
      }
    }
  },
  mounted() {
    this.newFileName = this.fileName
  },
  methods: {
    onConfirm() {
      this.$emit('submit', this.newFileName)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
