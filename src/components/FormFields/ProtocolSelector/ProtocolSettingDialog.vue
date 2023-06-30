<template>
  <Dialog
    v-if="$attrs.visible"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('assets.PlatformProtocolConfig') + '：' + item.name"
    class="setting-dialog"
    v-bind="$attrs"
    width="70%"
    v-on="$listeners"
  >
    <el-alert v-if="disabled && platformDetail" style="margin-bottom: 10px" type="success">
      {{ $t('assets.InheritPlatformConfig') }}
      <el-link :href="platformDetail" class="link-more" target="_blank">
        {{ $t('common.View') }}
      </el-link>
      <i class="fa fa-external-link" />
    </el-alert>
    <AutoDataForm
      :disabled="disabled"
      :form="form"
      class="data-form"
      v-bind="config"
      @submit="onSubmit"
    />
  </Dialog>
</template>

<script>
import { AutoDataForm, Dialog } from '@/components'

export default {
  name: 'ProtocolSetting',
  components: {
    Dialog,
    AutoDataForm
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const vm = this
    const platform = this.$route.query.platform
    return {
      baseAttrs: ['primary', 'required', 'default', 'public'], // 基础属性， 放到 setting 中处理了，处理完成后，还得返回回去
      defaultSetting: {
        sftp_enabled: true,
        sftp_home: '/tmp',
        username_selector: '#username',
        password_selector: '#password',
        submit_selector: '.btn-submit',
        security: 'any',
        console: false
      },
      loading: true,
      form: {},
      platformDetail: platform ? '#/console/assets/platforms/' + platform : '',
      config: {
        hasSaveContinue: false,
        hasButtons: !this.disabled,
        url: '/api/v1/assets/protocol-settings/?name=' + this.item.name,
        fields: [
          [vm.$t('common.Basic'), [
            'primary', 'required', 'default', 'public'
          ]],
          [vm.$t('common.Advanced'), ['setting']]
        ],
        fieldsMeta: {
          setting: {
            fields: '__all__'
          }
        }
      }
    }
  },
  created() {
    this.form = this.item.setting
    if (!this.form || !this.item) {
      return
    }
    for (const i of this.baseAttrs) {
      this.form[i] = !!this.item[i]
    }
  },
  methods: {
    onSubmit(form) {
      for (const i of this.baseAttrs) {
        if (form.hasOwnProperty(i)) {
          this.item[i] = form[i]
        }
      }
      this.item.setting = form
      this.$emit('update:visible', false)
      this.$emit('confirm', this.item)
    }
  }
}
</script>

<style lang="scss" scoped>
.data-form > > > .el-form-item.form-buttons {
  padding-top: 10px;
  margin-bottom: 0;
}

.setting-dialog > > > .el-dialog__body {
  padding-top: 10px;
}

.link-more {
  font-size: 10px;
  border-bottom: solid 1px;
  color: inherit;
}
</style>
