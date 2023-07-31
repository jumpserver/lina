<template>
  <Dialog
    v-if="setting.InviteDialogVisible"
    :title="$tc('users.InviteUserInOrg')"
    :visible.sync="setting.InviteDialogVisible"
    :show-cancel="false"
    :show-confirm="false"
    custom-class="asset-select-dialog"
    width="50vw"
    top="15vh"
    after
    :destroy-on-close="true"
  >
    <GenericCreateUpdateForm
      v-bind="formConfig"
      @submitSuccess="onSubmitSuccess"
    />
  </Dialog>
</template>
<script>
import Dialog from '@/components/Dialog'
import { Select2 } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'
import { mapGetters } from 'vuex'
import rules from '@/components/Form/DataForm/rules'

export default {
  components: {
    Dialog,
    GenericCreateUpdateForm
  },
  props: {
    setting: {
      type: Object,
      default: () => {
        return { InviteDialogVisible: false }
      }
    }
  },
  data() {
    return {
      selectLoading: false,
      InviteLoading: false,
      formConfig: {
        url: '/api/v1/users/users/invite/',
        getUrl: () => '/api/v1/users/users/invite/',
        submitMethod: () => 'post',
        hasReset: false,
        hasSaveContinue: false,
        createSuccessMsg: this.$t('users.InviteSuccess'),
        fields: ['users', 'org_roles'],
        fieldsMeta: {
          users: {
            component: Select2,
            el: {
              ajax: {
                url: '/api/v1/users/users/suggestions/',
                transformOption: (item) => {
                  return { label: `${item.name}(${item.username})`, value: item.id }
                }
              }
            }
          },
          org_roles: {
            rules: [rules.RequiredChange],
            component: Select2,
            el: {
              ajax: {
                url: '/api/v1/rbac/org-roles/',
                transformOption: (item) => {
                  return { label: `${item.display_name}`, value: item.id }
                }
              }
            }
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters(['currentOrg', 'currentUser', 'device'])
  },
  methods: {
    onSubmitSuccess(res) {
      this.setting.InviteDialogVisible = false
      this.$emit('close', res)
      this.$store.dispatch('users/currentUserJoinNewOrg', res.users)
    }
  }
}
</script>

<style lang="less" scoped>
.dialog ::v-deep form {
  padding: 0 40px;
}

.dialog ::v-deep .el-dialog__footer {
  padding: 0;
}
</style>
