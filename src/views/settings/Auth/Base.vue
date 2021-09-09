<template>
  <div>
    <el-button v-if="!value" type="default" size="mini" @click="visible=true">{{ $t('setting.Enable') }}</el-button>
    <el-button v-else type="primary" size="mini" @click="visible=true">{{ $t('setting.Setting') }}</el-button>
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
    },
    value: {
      type: Boolean,
      required: true
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
