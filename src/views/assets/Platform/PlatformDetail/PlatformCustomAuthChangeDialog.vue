<template>
  <Dialog
    :title="$tc('assets.CustomAuthCommand')"
    :visible.sync="iVisible"
    width="80%"
    top="1vh"
    :show-cancel="false"
    :show-confirm="false"
  >
    <el-alert v-if="helpMessage" type="success">
      <span v-html="helpMessage" />
    </el-alert>
    <DynamicInput ref="DynamicInput" v-bind="$data" />
  </Dialog>
</template>

<script>
import { Dialog, DynamicInput } from '@/components'

export default {
  components: {
    Dialog,
    DynamicInput
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      helpMessage: this.$t('assets.CustomAuthCommandHelpMessage'),
      url: `/api/v1/assets/platforms/${this.object.id}/custom-auth-commands/`,
      submitMethod: 'put',
      submitSuccess: this.submitSuccessAction
    }
  },
  computed: {
    iVisible: {
      set(val) {
        this.$emit('update:visible', val)
      },
      get() { return this.visible }
    }
  },
  created() {
  },
  methods: {
    submitSuccessAction() {
      this.iVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
