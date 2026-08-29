<template>
  <div>
    <el-alert v-sanitize="helpText" type="info" />
    <IBox>
      <GenericCreateUpdateForm
        :create-success-next-route="successUrl"
        :update-success-next-route="successUrl"
        v-bind="$data"
      />
    </IBox>
    <Dialog
      :visible.sync="testDialogVisible"
      :title="$t('EmailTest')"
      :disabled-status="testButtonLoading"
      width="500px"
      @confirm="handleTestConfirm"
      @cancel="handleTestCancel"
    >
      <el-form label-width="100px">
        <el-form-item :label="$t('Recipient')" :error="testRecipientError">
          <el-input
            v-model.trim="testRecipient"
            @keyup.enter.native="handleTestConfirm"
          />
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script>
import { Dialog, IBox } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'
import { testEmailSetting } from '@/api/settings'
import rules from '@/components/Form/DataForm/rules'

export default {
  name: 'Email',
  components: {
    Dialog,
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    const vm = this
    return {
      helpText: this.$t('EmailHelpText'),
      encryptedFields: ['EMAIL_HOST_PASSWORD'],
      fields: [
        [
          this.$t('Server'),
          [
            'EMAIL_PROTOCOL',
            'EMAIL_HOST',
            'EMAIL_PORT',
            'EMAIL_HOST_USER',
            'EMAIL_HOST_PASSWORD',
            'EMAIL_FROM',
            'EMAIL_SECURITY_PROTOCOL'
          ]
        ]
      ],
      fieldsMeta: {
        EMAIL_PORT: {
          hidden: formValue => formValue.EMAIL_PROTOCOL !== 'smtp'
        },
        EMAIL_FROM: {
          rules: [rules.EmailCheck]
        },
        EMAIL_SECURITY_PROTOCOL: {
          hidden: formValue => formValue.EMAIL_PROTOCOL !== 'smtp',
          label: this.$t('UseSSL'),
          type: 'radio-group',
          value: 'ssl',
          options: [
            { label: this.$t('None'), value: 'none' },
            { label: this.$t('SSL'), value: 'ssl' },
            { label: this.$t('TLS'), value: 'tls' }
          ]
        }
      },
      afterGetFormValue(obj) {
        if (obj?.EMAIL_USE_SSL === true) {
          obj.EMAIL_SECURITY_PROTOCOL = 'ssl'
        } else if (obj?.EMAIL_USE_TLS === true) {
          obj.EMAIL_SECURITY_PROTOCOL = 'tls'
        } else {
          obj.EMAIL_SECURITY_PROTOCOL = 'none'
        }
        return obj
      },
      hasDetailInMsg: false,
      successUrl: { name: 'Msg' },
      url: '/api/v1/settings/setting/?category=email',
      testDialogVisible: false,
      testButtonLoading: false,
      testRecipient: '',
      testRecipientError: '',
      testFormValue: {},
      moreButtons: [
        {
          title: this.$t('EmailTest'),
          loading: false,
          callback: function(value, form, btn) {
            vm.testFormValue = { ...value }
            vm.testRecipient = ''
            vm.testRecipientError = ''
            vm.testButtonLoading = false
            vm.testDialogVisible = true
          }
        }
      ],
      cleanFormValue(data) {
        Object.keys(data).forEach(function(key) {
          if (data[key] === null) {
            delete data[key]
          }
          if (!data['EMAIL_HOST_PASSWORD']) {
            delete data['EMAIL_HOST_PASSWORD']
          }
          switch (data['EMAIL_SECURITY_PROTOCOL']) {
            case 'ssl':
              data['EMAIL_USE_SSL'] = true
              data['EMAIL_USE_TLS'] = false
              break
            case 'tls':
              data['EMAIL_USE_SSL'] = false
              data['EMAIL_USE_TLS'] = true
              break
            default:
              data['EMAIL_USE_SSL'] = false
              data['EMAIL_USE_TLS'] = false
              break
          }
        })
        return data
      },
      submitMethod() {
        return 'patch'
      }
    }
  },
  methods: {
    handleTestCancel() {
      this.testDialogVisible = false
      this.testButtonLoading = false
      this.testRecipientError = ''
    },
    handleTestConfirm() {
      const recipient = this.testRecipient
      if (!recipient) {
        this.testRecipientError = this.$t('FieldRequiredError')
        return
      }
      if (!/\S+@\S+\.\S+/.test(recipient)) {
        this.testRecipientError = this.$t('InputEmailAddress')
        return
      }

      this.testRecipientError = ''
      this.testButtonLoading = true
      testEmailSetting({
        EMAIL_FROM: this.testFormValue.EMAIL_FROM,
        EMAIL_RECIPIENT: recipient
      })
        .then(res => {
          this.$message.success(res.msg)
          this.testDialogVisible = false
        })
        .catch(res => {
          this.$message.error(res.response.data.error)
        })
        .finally(() => {
          this.testButtonLoading = false
        })
    }
  }
}
</script>

<style scoped></style>
