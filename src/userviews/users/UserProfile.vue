<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <QuickActions type="primary" :actions="quickActions" />
    </el-col>
  </el-row>
</template>a

<script>
import DetailCard from '@/components/DetailCard'
import QuickActions from '@/components/QuickActions'
import { toSafeLocalDateStr } from '@/utils/common'
export default {
  name: 'UserProfile',
  components: {
    DetailCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      quickActions: [
        {
          title: this.$t('assets.SetMFA'),
          attrs: {
            type: 'primary',
            label: this.object.mfa_enabled ? this.$t('common.Disable') : this.$t('common.Enable'),
            disabled: this.object.mfa_force_enabled
          },
          callbacks: {
            click: function() {
              if (this.object.mfa_enabled) {
                if (!this.object.mfa_force_enabled) {
                  window.location.href = `/users/profile/otp/disable/authentication/?next=${this.$route.fullPath}`
                }
              } else {
                window.location.href = `/users/profile/otp/enable/start/?next=${this.$route.fullPath}`
              }
            }.bind(this)
          }
        },
        {
          title: this.$t('assets.UpdateMFA'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Update')
          },
          callbacks: {
            click: function() {
              window.location.href = `/users/profile/otp/update/?next=${this.$route.fullPath}`
            }.bind(this)
          }
        },
        {
          title: this.$t('assets.UpdatePassword'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Update')
          },
          callbacks: {
            click: function() {

            }
          }
        },
        {
          title: this.$t('assets.UpdateSSHPublicKey'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Update')
          },
          callbacks: {
            click: function() {}
          }
        },
        {
          title: this.$t('assets.ResetPublicKeyAndDownload'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Reset')
          },
          callbacks: {
            click: function() {}
          }
        }
      ]
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          value: this.object.username,
          key: this.$t('assets.Username')
        },
        {
          value: this.object.name,
          key: this.$t('assets.Name')
        },
        {
          value: this.object.role_display,
          key: this.$t('assets.Role')
        },
        {
          value: this.object.email,
          key: this.$t('assets.Email')
        },
        {
          value: `${this.object.is_active}`,
          key: this.$t('assets.IsActive')
        },
        {
          value: `没有这个API`,
          key: this.$t('assets.sshkey')
        },
        {
          value: this.object.mfa_level_display,
          key: this.$t('assets.MfaLevel')
        },
        {
          value: this.object.source_display,
          key: this.$t('assets.Source')
        },
        {
          value: toSafeLocalDateStr(this.object.date_joined),
          key: (this.$t('assets.date_joined'))
        },
        {
          value: toSafeLocalDateStr(this.object.last_login),
          key: this.$t('assets.last_login')
        },
        {
          value: toSafeLocalDateStr(this.object.date_password_last_updated),
          key: this.$t('assets.date_password_last_updated')
        },
        {
          value: toSafeLocalDateStr(this.object.date_expired),
          key: this.$t('assets.date_expired')
        },
        {
          value: this.object.groups_display,
          key: this.$t('perms.UserGroups')
        },
        {
          value: this.object.comment,
          key: this.$t('assets.Comment')
        }
      ]
    }
  },
  mounted() {
    console.log(this.object)
  },
  methods: {
  }
}
</script>

<style lang='less' scoped>
</style>
