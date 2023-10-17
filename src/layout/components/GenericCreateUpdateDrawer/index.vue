<template>
  <el-drawer
    :direction="direction"
    :size="width"
    :title="iTitle"
    :visible.sync="visible"
    class="drawer"
  >
    <div class="el-drawer__content">
      <GenericCreateUpdateForm
        :action="action"
        :action-id="actionId"
        v-bind="$attrs"
        @submitSuccess="onSubmitSuccess"
        v-on="$listeners"
      />
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
        return title
      }
      let title = this.$route.meta.title || this.$route.name
      title = title.replace('List', '').replace('列表', '')
      if (this.action === 'create') {
        title = this.$t('common.Create') + title
      } else if (this.action === 'update') {
        title = this.$t('common.Update') + title
      }
      return title
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.$eventBus.$emit('closeCreateUpdateDrawer')
      }
    }
  },
  mounted() {
    this.$eventBus.$on('showCreateUpdateDrawer', (action, { url, col, row }) => {
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
