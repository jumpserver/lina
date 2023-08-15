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
    },
    testPerformError(error) {
      const data = error.response.data
      for (const key of Object.keys(data)) {
        let value = data[key]
        if (value instanceof Array) {
          value = value.join(';')
        }
        this.$refs.form.$refs.form.setFieldError(key, value)
      }
    }
  }
}
</script>

<style scoped>

</style>
