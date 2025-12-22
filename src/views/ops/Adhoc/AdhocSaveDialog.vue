<template>
  <Dialog
    v-if="iVisible"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('SaveAdhoc')"
    :visible.sync="iVisible"
    top="1vh"
    width="40%"
  >
    <GenericCreateUpdateForm v-if="ready" :on-perform-success="onSubmitSuccess" v-bind="$data" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { GenericCreateUpdateForm } from '@/layout/components'
import CodeEditor from '@/components/Form/FormFields/CodeEditor.vue'

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
      default: ''
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
      this.$message.success(this.$tc('SaveCommandSuccess'))
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
