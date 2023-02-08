<template>
  <Dialog
    v-if="iVisible"
    :title="''"
    class="about-dialog"
    :visible.sync="iVisible"
    width="50%"
    top="10%"
    :close-on-click-modal="false"
    :show-cancel="false"
    :show-confirm="false"
  >
    <div class="box">
      <div class="head">
        <img :src="logoTextSrc" class="sidebar-logo-text" alt="logo">
      </div>
      <div class="text">{{ $tc('ops.version') }}：<strong> dev </strong> <span v-if="!publicSettings.XPACK_LICENSE_IS_VALID"> GPLv3. </span></div>
      <div class="text">{{ $tc('common.PermissionCompany') }}：{{ corporation }}</div>
      <div class="text">
        <span @click="onClick('github')">
          <i class="fa fa-github icon" />github
        </span>
      </div>
      <div class="text">
        <span @click="onClick('download')">
          <i class="fa fa-download icon" />{{ $tc('common.Download') }}
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
      logoTextSrc: require('@/assets/img/logo_text_green.png')
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
    padding: 10px 30px 20px;
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
      color: var(--color-info);
      cursor: pointer;
    }
  }
}
</style>
