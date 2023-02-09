<template>
  <Dialog
    v-if="iVisible"
    :title="''"
    class="about-dialog"
    :visible.sync="iVisible"
    width="50%"
    top="10%"
    :show-cancel="false"
    :show-confirm="false"
  >
    <div class="box">
      <div class="head">
        <img :src="logoTextSrc" class="sidebar-logo-text" alt="logo">
      </div>
      <div class="text">{{ $tc('ops.version') }}：<strong> dev </strong> <span v-if="!publicSettings.XPACK_LICENSE_IS_VALID"> GPLv3. </span></div>
      <div class="text">{{ $tc('common.PermissionCompany') }}：{{ corporation }}</div>
      <el-divider class="divider" />
      <div class="text">
        <span v-for="(i, index) in actions" :key="index" class="text-link" @click="onClick(i.name)">
          <i class="icon" :class="i.icon" />{{ i.label }}
          <el-divider v-if="index !== actions.length - 1" direction="vertical" />
        </span>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { mapGetters } from 'vuex'

export default {
  components: {
    Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      logoTextSrc: require('@/assets/img/logo_text_green.png'),
      actions: [
        {
          name: 'github',
          label: 'github',
          icon: 'fa fa-github'
        },
        {
          name: 'download',
          label: this.$tc('common.Download'),
          icon: 'fa fa-download'
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'publicSettings'
    ]),
    iVisible: {
      set(val) {
        this.$emit('update:visible', val)
      },
      get() {
        return this.visible
      }
    },
    corporation() {
      return this.publicSettings.XPACK_LICENSE_INFO.corporation
    }
  },
  methods: {
    onClick(type) {
      switch (type) {
        case 'download':
          window.open('/core/download/', '_blank')
          break
        case 'github':
          window.open('https://github.com/jumpserver/jumpserver', '_blank')
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.about-dialog {
  &>>> .el-dialog__header {
    background-color: #FAFBFD;
    border-bottom: none;
  }
  &>>> .el-dialog__body {
    background-color: #FAFBFD;
    padding: 10px 40px 20px;
  }
  &>>> .el-dialog__footer {
    padding: 0;
  }
}
.head {
  text-align: center;
}
.box {
  .text {
    margin-bottom: 10px;
    font-size: 14px;
    color: #666;
    .icon {
      margin-right: 4px;
    }
    span {
      cursor: pointer;
    }
  }
}
 >>> .divider.el-divider {
  margin: 15px 0!important;
}
</style>
