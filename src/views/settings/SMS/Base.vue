<template>
  <div>
    <el-button type="default" size="mini" @click="visible=true">{{ $t('setting.Config') }}</el-button>
    <Dialog
      :visible.sync="visible"
      :title="title"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      width="70%"
      v-on="$listeners"
      @confirm="onConfirm()"
    >
      <slot />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
export default {
  name: 'Base',
  components: {
    Dialog
  },
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false
    }
  },
  methods: {
    onConfirm() {
    }
  }
}
</script>

<style scoped>

</style>
