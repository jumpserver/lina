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
  name: 'ProfileInfo',
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
      url: `/api/v1/users/profile/`,
      quickActions: [
        {
          title: this.$t('users.SetMFA'),
          attrs: {
            type: 'primary',
            label: this.object.mfa_enabled ? this.$t('common.Disable') : this.$t('common.Enable'),
            disabled: this.object.mfa_force_enabled
          },
          callbacks: {
            click: function() {
              if (this.object.mfa_enabled) {
                if (!this.object.mfa_force_enabled) {
                  window.location.href = `/core/users/profile/otp/disable/authentication/?next=${this.$route.fullPath}`
                }
              } else {
                window.location.href = `/core/users/profile/otp/enable/start/?next=${this.$route.fullPath}`
              }
            }.bind(this)
          }
        },
        {
          title: this.$t('users.UpdateMFA'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Update')
          },
          callbacks: {
            click: function() {
              window.location.href = `/core/users/profile/otp/update/?next=${this.$route.fullPath}`
            }.bind(this)
          }
        },
        {
          title: this.$t('users.ResetPublicKeyAndDownload'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Reset')
          },
          callbacks: {
            click: function() {
              window.open(`/core/users/profile/pubkey/generate/`, '_blank')
            }
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
          key: this.$t('users.Username')
        },
        {
          value: this.object.name,
          key: this.$t('users.Name')
        },
        {
          value: this.object.role_display,
          key: this.$t('users.Role')
        },
        {
          value: this.object.email,
          key: this.$t('users.Email')
        },
        {
          value: `${this.object.is_active}`,
          key: this.$t('users.IsActive')
        },
        {
          value: `${this.object.public_key_comment} ${this.object.public_key_hash_md5}`,
          key: 'SSHKey'
        },
        {
          value: this.object.mfa_level_display,
          key: this.$t('users.MfaLevel')
        },
        {
          value: this.object.source_display,
          key: this.$t('users.Source')
        },
        {
          value: toSafeLocalDateStr(this.object.date_joined),
          key: (this.$t('users.DateJoined'))
        },
        {
          value: toSafeLocalDateStr(this.object.last_login),
          key: this.$t('users.DateLastLogin')
        },
        {
          value: toSafeLocalDateStr(this.object.date_password_last_updated),
          key: this.$t('users.DatePasswordLastUpdated')
        },
        {
          value: toSafeLocalDateStr(this.object.date_expired),
          key: this.$t('users.DateExpired')
        },
        {
          value: this.object.groups_display,
          key: this.$t('users.UserGroups')
        },
        {
          value: this.object.comment,
          key: this.$t('users.Comment')
        }
      ]
    }
  },
  methods: {
  }
}
</script>

<style lang='less' scoped>
</style>
