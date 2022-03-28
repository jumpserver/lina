<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :initial="initial"
    :fields-meta="fieldsMeta"
    :url="url"
    :clean-form-value="cleanFormValue"
    v-bind="$attrs"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import getFields from '../fields'
import { UploadKey } from '@/components'
import { Required } from '@/components/DataForm/rules'
import { UpdateToken } from '@/components/FormFields'

export default {
  name: 'AdminUserSSH',
  components: { GenericCreateUpdatePage },
  data() {
    const fields = getFields.bind(this)()
    return {
      url: '/api/v1/assets/admin-users/',
      initial: {
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'protocol', 'username', 'type']],
        [this.$t('common.Auth'), ['password', 'private_key', 'passphrase']],
        [this.$t('common.Command filter'), ['cmd_filters']],
        [this.$t('assets.UserSwitch'), ['su_enabled', 'su_from']],
        [this.$t('common.Other'), ['priority', 'sftp_root', 'comment']]
      ],
      fieldsMeta: {
        name: {
          el: {
            placeholder: this.$t('common.Name')
          }
        },
        type: {
          hidden() {
            return true
          }
        },
        username: {
          el: {
            placeholder: this.$t('common.Username')
          },
          rules: [Required]
        },
        protocol: {
          el: {
            style: 'width:100%',
            disabled: true
          }
        },
        password: {
          helpText: this.$t('common.passwordOrPassphrase'),
          component: UpdateToken,
          hidden: (formValue) => {
            if (!this.$route.params.id) {
              return false
            }
          }
        },
        passphrase: {
          component: UpdateToken
        },
        private_key: {
          component: UploadKey
        },
        sftp_root: {
          rules: [Required],
          helpText: this.$t('assets.SFTPHelpMessage')
        },
        cmd_filters: fields.cmd_filters,
        su_enabled: fields.su_enabled,
        su_from: fields.su_from
      },
      cleanFormValue: (values) => {
        values['type'] = 'admin'
        return values
      }
    }
  },
  method: {
  }
}
</script>

<style lang='less' scoped>

</style>
