<template>
  <Dialog
    v-if="setting.InviteDialogVisible"
    :title="this.$t('users.InviteUserInOrg')"
    :visible.sync="setting.InviteDialogVisible"
    custom-class="asset-select-dialog"
    :show-cancel="false"
    :show-confirm="false"
    width="50vw"
    top="15vh"
    after
    :destroy-on-close="true"
    @close="clearSelect"
  >
    <AutoDataForm v-bind="formConfig" />
  </Dialog>
</template>
<script>
import Dialog from '@/components/Dialog'
import { AutoDataForm, Select2 } from '@/components'
import { mapGetters } from 'vuex'
export default {
  components: {
    Dialog,
    AutoDataForm
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
      InviteOptions: [],
      InviteValue: [],
      rulesList: [],
      formConfig: {
        url: '/api/v1/users/users/invite/',
        method: 'post',
        fields: ['users', 'org_roles'],
        fieldsMeta: {
          users: {
            component: Select2,
            el: {
              ajax: {
                url: '/api/v1/users/users/suggestion/'
              }
            }
          },
          org_roles: {
            component: Select2,
            el: {
              ajax: {
                url: '/api/v1/rbac/roles/?scope=org',
                transformOption: (item) => {
                  return { label: `${item.name_display}`, value: item.id }
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
    remoteMethod(query) {
      if (query !== '') {
        this.InviteOptions = []
        this.selectLoading = true
        this.$axios
          .get(` /api/v1/users/users/suggestion/?search=${query}`)
          .then(result => {
            // console.log(result)
            for (let i = 0; i < result.length; i++) {
              this.InviteOptions.push({
                value: result[i].id,
                label: result[i].name + '(' + result[i].username + ')'
              })
            }
          })
          .finally(() => {
            this.selectLoading = false
          })
      } else {
        this.InviteOptions = []
      }
    },
    clearSelect() {
      this.InviteValue = []
      this.rulesList = []
      this.InviteOptions = []
    },
    InviteConfirm() {
      this.InviteLoading = true
      const data = []
      for (const rule of this.rulesList) {
        for (const user of this.InviteValue) {
          data.push({
            user: user,
            role: rule
          })
        }
      }
      this.$axios.post(`/api/v1/users/users/invite/`, data).then(() => {
        this.$message.success(this.$t('common.AddSuccessMsg'))
      }).finally(() => {
        this.InviteLoading = false
        this.clearSelect()
        this.$emit('close')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.dialog ::v-deep .el-input {
  width: 25.5vw;
}

.dialog ::v-deep .el-dialog__footer {
  padding: 0;
}
</style>
