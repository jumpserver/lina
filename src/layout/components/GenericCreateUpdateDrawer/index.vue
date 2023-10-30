<template>
  <el-drawer
    :direction="direction"
    :modal="false"
    :size="width"
    :title="iTitle"
    :visible.sync="visible"
    append-to-body
    wrapper-closable
    class="drawer generic-create-update-drawer"
    v-on="$listeners"
  >
    <div class="el-drawer__content">
      <slot>
        <GenericCreateUpdateForm
          v-if="visible"
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
    },
    name: {
      type: String,
      default: ''
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
        resource = routeName.replace('List', '')
          .replace('列表', '')
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
    visible(val) {
      console.log('Visible changed: ', val, ' ', this.$attrs.url)
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
    this.$eventBus.$on('showCreateUpdateDrawer', (action, { url, row }) => {
      const tableUrl = this.$attrs.url
      this.$log.debug('Table url: ', tableUrl, ' action url: ', url, 'action: ', action)
      if (!tableUrl || !url) {
        return
      }
      const tablePath = tableUrl.split('?')[0]
      const actionPath = url.split('?')[0]
      if (tablePath !== actionPath) {
        return
      }
      this.action = action
      this.actionId = row ? row.id : ''
      this.setVisible(true)
    })
  },
  beforeDestroy() {
    this.$eventBus.$off('showCreateUpdateDrawer')
  },
  methods: {
    setVisible: _.debounce(function(val) {
      this.visible = val
    }, 100),
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
