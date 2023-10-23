<template>
  <el-drawer
    :direction="direction"
    :size="width"
    :title="iTitle"
    :visible.sync="visible"
    class="drawer"
    destroy-on-close
  >
    <div class="el-drawer__content">
      <slot>
        <GenericCreateUpdateForm
          :action="action"
          :action-id="actionId"
          v-bind="$attrs"
          @submitSuccess="onSubmitSuccess"
          v-on="$listeners"
        />
      </slot>
    </div>
  </el-drawer>
</template>
<script>

import GenericCreateUpdateForm from '../GenericCreateUpdateForm/index.vue'

export default {
  name: 'GenericCreateUpdateDrawer',
  components: {
    GenericCreateUpdateForm
  },
  props: {
    direction: {
      type: String,
      default: 'rtl'
    },
    title: {
      type: String,
      default: ''
    },
    resource: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '700px'
    }
  },
  data() {
    return {
      visible: false,
      action: 'create',
      actionId: '',
      success: false
    }
  },
  computed: {
    iTitle() {
      if (this.title) {
        return this.title
      }
      let resource = this.resource
      if (!resource) {
        const routeName = this.$route.meta.title || this.$route.name
        resource = routeName.replace('List', '').replace('列表', '')
      }
      let title
      if (this.action === 'update') {
        title = this.$t('common.Update') + ' ' + resource
      } else {
        title = this.$t('common.Create') + ' ' + resource
      }
      return title
    }
  },
  watch: {
    shown(val) {
      if (!val) {
        this.$eventBus.$emit(
          'closeCreateUpdateDrawer',
          { action: this.action, actionId: this.actionId, success: this.success }
        )
        this.$emit('close', { action: this.action, actionId: this.actionId, success: this.success })
      }
    }
  },
  mounted() {
    this.$eventBus.$on('showCreateUpdateDrawer', (action, { url, row, col }) => {
      if (action === 'create') {
        const tableUrl = this.$attrs.url
        if (!tableUrl || !url) {
          return
        }
        const tablePath = tableUrl.split('?')[0]
        const createPath = url.split('?')[0]
        if (tablePath !== createPath) {
          return
        }
      }
      this.action = action
      this.actionId = row ? row.id : ''
      this.visible = true
    })
  },
  methods: {
    onSubmitSuccess(res, { addContinue }) {
      this.success = true
      if (!addContinue) {
        this.visible = false
      }
    }
  }
}
</script>

<style lang='scss' scoped>
  .ibox >>> .el-card__body {
    padding-top: 30px;
  }
  .el-drawer__content {

    >>> .form-fields {
      overflow: auto;
      max-height: calc(100vh - 150px);
    }

    >>> .form-buttons {
      //position: absolute;
      //bottom: 15px;
      width: 100%;
      background: white;
    }
  }

  .el-drawer__footer {
    text-align: right;
    vertical-align: middle;
    padding-right: 52px;
    border-top: solid 1px #ebeef5;
  }

  .drawer >>> .el-drawer__header {
    font-weight: 500;
    font-size: 16px;
  }

  .el-drawer__footer_buttons {
    margin-top: 10px;
  }

</style>
