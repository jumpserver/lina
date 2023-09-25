<template>
  <el-drawer
    :direction="direction"
    :size="width"
    :title="title"
    :visible="drawer"
    class="drawer"
    @update:visible="(val) => $emit('update:drawer', val)"
  >
    <div class="el-drawer__content">
      <GenericCreateUpdateForm ref="createUpdateForm" v-bind="$attrs" v-on="$listeners" />
    </div>
  </el-drawer>
</template>
<script>
import GenericCreateUpdateForm from '../GenericCreateUpdateForm'

export default {
  name: 'GenericCreateUpdateForm',
  components: {
    GenericCreateUpdateForm
  },
  props: {
    drawer: {
      type: Boolean,
      default: false
    },
    direction: {
      type: String,
      default: 'rtl'
    },
    action: {
      type: String,
      default: 'create'
    },
    title: {
      type: String,
      default: '创建用户'
    },
    width: {
      type: String,
      default: '800px'
    }
  },
  data() {
    return {
    }
  },
  computed: {
  }
}
</script>

<style lang='scss' scoped>
  .ibox >>> .el-card__body {
    padding-top: 30px;
  }
  .el-drawer__content {
    overflow: auto;
    height: calc(100vh - 130px);

    >>> .form-buttons {
      position: absolute;
      bottom: 10px;
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
