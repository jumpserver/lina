<template>
  <div>
    <el-button v-if="!value" type="default" size="mini" @click="visible=true">{{ $t('setting.Enable') }}</el-button>
    <el-button v-else type="primary" size="mini" @click="visible=true">{{ $t('setting.Setting') }}</el-button>
    <Dialog
      v-if="visible"
      :visible.sync="visible"
      :title="title"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      width="70%"
      v-on="$listeners"
    >
      <GenericCreateUpdateForm v-bind="iConfig" @submitSuccess="submitSuccess" />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import { GenericCreateUpdateForm } from '@/layout/components'
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
    value: {
      type: Boolean,
      required: true
    },
    config: {
      type: Object,
      default: () => ({})
    },
    enableField: {
      type: String,
      default: ''
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
    submitSuccess(res) {
      this.$emit('input', !!res[this.enableField])
      this.visible = false
    }
  }
}
</script>

<style scoped>

</style>
