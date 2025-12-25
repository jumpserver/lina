<template>
  <Dialog
    v-if="visible"
    :show-cancel="false"
    :show-confirm="true"
    :title="$tc('NewFile')"
    :visible="visible"
    top="1vh"
    width="40%"
    @update:visible="$emit('update:visible', $event)"
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
  emits: ['update:visible', 'confirm'],
  data() {
    return {
      name: ''
    }
  },
  mounted() {
  },
  methods: {
    onConfirm() {
      this.$emit('confirm', this.name)
      this.$emit('update:visible', false)
    }
  }
}
</script>
