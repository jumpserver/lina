<template>
  <Dialog
    v-if="iVisible"
    :title="$tc('ops.SaveAdhoc')"
    :visible.sync="iVisible"
    width="40%"
    top="1vh"
    :show-cancel="false"
    :show-confirm="false"
  >
    <GenericCreateUpdateForm v-if="ready" v-bind="$data" :on-perform-success="onSubmitSuccess" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { GenericCreateUpdateForm } from '@/layout/components'
import CodeEditor from '@/components/Form/FormFields/CodeEditor'

export default {
  components: {
    Dialog, GenericCreateUpdateForm
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    args: {
      type: String,
      default: () => ({})
    },
    module: {
      type: String,
      default: 'shell'
    }
  },
  data() {
    return {
      ready: false,
      hasSaveContinue: false,
      url: '/api/v1/ops/adhocs/',
      fields: [
        ['', ['name', 'module', 'args']]
      ],
      initial: {
        module: 'shell',
        args: ''
      },
      fieldsMeta: {
        module: {
          hidden: () => {
            return true
          }
        },
        args: {
          component: CodeEditor,
          hidden: () => {
            return true
          }
        }
      }
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
  }, mounted() {
    this.initial.args = this.args
    this.initial.module = this.module
    this.ready = true
  },
  methods: {
    onSubmitSuccess() {
      this.$message.success(this.$tc('ops.SaveCommandSuccess'))
      this.iVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.el-row-divider {
  margin-bottom: 20px;
}

.select-prop-label {
  float: right;
  padding-right: 30px;
}

</style>
