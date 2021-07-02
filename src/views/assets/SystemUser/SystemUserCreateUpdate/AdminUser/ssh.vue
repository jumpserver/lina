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

export default {
  name: 'AdminUserSSH',
  components: { GenericCreateUpdatePage },
  data() {
    const fields = getFields.bind(this)()
    return {
      url: '/api/v1/assets/system-users/',
      initial: {
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'protocol', 'username', 'type']],
        [this.$t('common.Auth'), ['update_password', 'password', 'private_key']],
        [this.$t('common.Command filter'), ['cmd_filters']],
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
        update_password: {
          label: this.$t('users.UpdatePassword'),
          type: 'checkbox',
          hidden: (formValue) => {
            if (formValue.update_password) {
              return true
            }
            return !this.$route.params.id
          }
        },
        password: {
          helpText: this.$t('common.passwordOrPassphrase'),
          hidden: (formValue) => {
            if (!this.$route.params.id) {
              return false
            }
            return !formValue.update_password
          }
        },
        private_key: {
          component: UploadKey
        },
        cmd_filters: fields.cmd_filters,
        home: {
          label: this.$t('assets.Home'),
          hidden: (item) => item.protocol !== 'ssh' || !item.auto_push || item.username_same_with_user,
          helpText: this.$t('assets.HomeHelpMessage')
        }
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
