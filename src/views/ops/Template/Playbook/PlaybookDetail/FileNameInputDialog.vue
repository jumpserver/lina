<template>
  <Dialog
    :show-cancel="true"
    :show-confirm="true"
    :title="$tc('Create')"
    :visible.sync="iVisible"
    top="1vh"
    width="25%"
    @confirm="onConfirm"
  >

    <el-form ref="form" label-width="80px">
      <el-form-item :label="$tc('Filename')">
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
