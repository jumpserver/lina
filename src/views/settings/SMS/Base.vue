<template>
  <div>
    <el-button type="primary" size="mini" @click="visible=true">{{ $t('setting.Setting') }}</el-button>
    <Dialog
      v-if="visible"
      :visible.sync="visible"
      :title="title"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      width="70%"
      v-on="$listeners"
      @confirm="onConfirm()"
    >
      <GenericCreateUpdateForm v-bind="iConfig" @submitSuccess="submitSuccess" />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
export default {
  name: 'Base',
  components: {
    Dialog,
    GenericCreateUpdateForm
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false
    }
  },
  computed: {
    iConfig() {
      return this.config
    }
  },
  methods: {
    onConfirm() {
    },
    submitSuccess(res) {
      this.$emit('input', !!res[this.enableField])
      this.visible = false
    }
  }
}
</script>

<style scoped>

</style>
