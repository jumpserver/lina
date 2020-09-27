<template>
  <Dialog
    v-if="setting.investDialogVisible"
    :title="this.$t('users.InvestUserInOrg')"
    :visible.sync="setting.investDialogVisible"
    custom-class="asset-select-dialog"
    :show-cancel="false"
    :show-confirm="false"
    width="28%"
    top="15vh"
    after
    :destroy-on-close="true"
    @close="clearSelect"
  >
    <div>
      <el-select
        v-model="investValue"
        multiple
        filterable
        remote
        size="small"
        reserve-keyword
        :placeholder="this.$t('setting.usernamePlaceholder')"
        :remote-method="remoteMethod"
        :loading="selectLoading"
      >
        <el-option
          v-for="item in investOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-collapse-transition>
        <div
          v-if="investValue.length > 0"
          style="margin-top:15px;
                   display: flex;
                   flex-direction:column;
                   align-items:center;
                   justify-content:center;"
        >
          <el-checkbox-group
            v-model="rulesList"
            size="small"
            style="display: flex;
                   flex-direction:row;
                   justify-content:center;"
          >
            <el-checkbox label="User" checked>{{ $t('users.OrgUser') }}</el-checkbox>
            <el-checkbox label="Auditor">{{ $t('users.OrgAuditor') }}</el-checkbox>
            <el-checkbox label="Admin">{{ $t('users.OrgAdmin') }}</el-checkbox>
          </el-checkbox-group>

          <el-button
            type="primary"
            :loading="investLoading"
            size="small"
            style="margin-top: 20px;width: 10vw"
            @click="investConfirm"
          >{{ $t('users.Invest') }}</el-button>
        </div>
      </el-collapse-transition>
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
    setting: {
      type: Object,
      default: () => {
        return { investDialogVisible: false }
      }
    }
  },
  data() {
    return {
      selectLoading: false,
      investLoading: false,
      investOptions: [],
      investValue: [],
      rulesList: []
    }
  },
  computed: {
    ...mapGetters(['currentOrg', 'currentUser', 'device'])
  },
  methods: {
    remoteMethod(query) {
      if (query !== '') {
        this.investOptions = []
        this.selectLoading = true
        this.$axios
          .get(` /api/v1/users/users/?search=${query}&all=1`)
          .then(result => {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
              this.investOptions.push({
                value: result[i].id,
                label: result[i].name + '(' + result[i].username + ')'
              })
            }
          })
          .finally(() => {
            this.selectLoading = false
          })
      } else {
        this.investOptions = []
      }
    },
    clearSelect() {
      this.investValue = []
      this.rulesList = []
      this.investOptions = []
    },
    investConfirm() {
      this.investLoading = true
      const data = []
      for (const rule of this.rulesList) {
        for (const user of this.investValue) {
          data.push({
            org: this.currentOrg.id,
            user: user,
            role: rule
          })
        }
      }
      this.$axios.post('/api/v1/orgs/org-memeber-relation/', data).then(() => {
        this.$message.success(this.$t('common.updateSuccessMsg'))
      }).finally(() => {
        this.investLoading = false
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
