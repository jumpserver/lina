<template>
  <Dialog
    :title="$tc('common.Create')"
    :visible.sync="iVisible"
    width="50%"
    top="1vh"
    :show-cancel="false"
    :show-confirm="false"
  >
    <GenericCreateUpdateForm ref="createUpdateForm" v-bind="$data" v-on="$listeners" />

  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { GenericCreateUpdateForm } from '@/layout/components'

export default {
  components: {
    Dialog,
    GenericCreateUpdateForm
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      hasSaveContinue: false,
      url: '/api/v1/ops/playbooks/',
      fields: [
        ['', ['create_method', 'name', 'comment']]
      ],
      createSuccessNextRoute: {
        name: 'Template'
      },
      updateSuccessNextRoute: {
        name: 'Template'
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
  },
  mounted() {
  },
  methods: {}
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
