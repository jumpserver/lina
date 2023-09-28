<template>
  <el-drawer
    :direction="direction"
    :size="width"
    :title="iTitle"
    :visible="visible"
    class="drawer"
    @update:visible="(val) => $emit('update:visible', val)"
  >
    <div class="el-drawer__content">
      <GenericCreateUpdateForm v-bind="$attrs" @submitSuccess="onSubmitSuccess" v-on="$listeners" />
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
    visible: {
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
      default: ''
    },
    width: {
      type: String,
      default: '700px'
    }
  },
  data() {
    return {
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
  mounted() {
    console.log('Dat: ', this.$attrs)
  },
  methods: {
    onSubmitSuccess(res, { addContinue }) {
      this.$emit('update:visible', false)
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
