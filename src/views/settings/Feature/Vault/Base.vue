<template>
  <div>
    <el-button size="mini" type="primary" @click="visible=true">{{ $t('setting.Setting') }}</el-button>
    <Dialog
      v-if="visible"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      :title="title"
      :visible.sync="visible"
      width="70%"
      @confirm="onConfirm()"
      v-on="$listeners"
    >
      <GenericCreateUpdateForm ref="form" v-bind="iConfig" @submitSuccess="submitSuccess" />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'

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
