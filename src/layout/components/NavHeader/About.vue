<template>
  <Dialog
    v-if="iVisible"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('About')"
    :visible.sync="iVisible"
    class="about-dialog"
    top="10%"
    width="50%"
  >
    <div class="box">
      <div class="head">
        <img :src="logoSrc" alt="logo" class="sidebar-logo-text" height="70">
      </div>
      <tr v-for="item of items" v-show="item.has || item.has === undefined" :key="item.label" class="text">
        <td class="title">{{ item.label }}: </td>
        <td class="value">{{ item.value }}</td>
      </tr>
      <el-divider class="divider" />
      <div class="text">
        <span v-for="(i, index) in actions" :key="index" class="text-link" @click="onClick(i.name)">
          <i :class="i.icon" class="icon" />{{ i.label }}
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
      actions: [
        {
          name: 'github',
          label: 'GitHub',
          icon: 'fa fa-github'
        },
        {
          name: 'download',
          label: this.$tc('DownloadCenter'),
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
    versionType() {
      return this.hasXPack ? this.$t('EnterpriseEdition') : this.$tc('CommunityEdition') + ' GPLv3'
    },
    items() {
      return [
        {
          label: this.$t('Product'),
          value: 'JumpServer ' + this.versionType
        },
        {
          label: this.$t('Version'),
          value: 'version-dev'
        },
        {
          label: this.$t('PermissionCompany'),
          value: this.corporation,
          has: this.hasXPack
        },
        {
          label: 'Copyright',
          value: this.copyright,
          has: !this.hasXPack
        }
      ]
    },
    corporation() {
      return this.publicSettings.XPACK_LICENSE_INFO.corporation
    },
    copyright() {
      if (this.corporation.indexOf('FIT2CLOUD 飞致云') > -1) {
        return this.corporation
      } else {
        return ''
      }
    },
    logoSrc() {
      return this.publicSettings['INTERFACE']['logo_logout']
    },
    hasXPack() {
      return this.publicSettings.XPACK_LICENSE_IS_VALID
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
  &.dialog ::v-deep .el-dialog__body {
    padding: 20px 30px;
  }

  &.dialog ::v-deep .el-dialog__footer {
    border-top: none;
    display: none;
  }
}

.head {
  float: right;
}

.box {
  .text {
    line-height: 2;
    font-size: 14px;
    color: #666;

    .title {
      font-weight: 600;
    }

    .value {
      padding-left: 30px;
    }

    .icon {
      margin-right: 4px;
    }

    span {
      cursor: pointer;
    }
  }
}

::v-deep .divider.el-divider {
  margin: 15px 0 !important;
}
</style>
