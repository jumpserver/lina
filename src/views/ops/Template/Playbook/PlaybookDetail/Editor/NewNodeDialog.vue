<template>
  <Dialog
    v-if="iVisible"
    :show-cancel="false"
    :show-confirm="true"
    :title="$tc('NewFile')"
    :visible.sync="iVisible"
    top="1vh"
    width="40%"
    @confirm="onConfirm"
  >
    <el-form>
      <el-form-item :label="$tc('DisplayName')">
        <el-input v-model="name" />
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
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      name: ''
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
  },
  methods: {
    onConfirm() {
      this.$emit('confirm', this.name)
      this.iVisible = false
    }
  }
}
</script>

