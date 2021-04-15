<template>
  <Dialog width="50" :title="this.$t('assets.UpdateAssetUserToken')" :visible.sync="show" @confirm="handleConfirm()" @cancel="handleCancel()">
    <el-form label-position="right" label-width="80px" :model="dialogInfo">
      <el-form-item :label="this.$t('assets.Hostname')">
        <el-input v-model="dialogInfo.hostname" disabled />
      </el-form-item>
      <el-form-item :label="this.$t('assets.Username')">
        <el-input v-model="dialogInfo.username" disabled />
      </el-form-item>
      <el-form-item :label="this.$t('assets.Password')">
        <el-input v-model="dialogInfo.password" type="password" />
      </el-form-item>
      <el-form-item :label="this.$t('assets.sshkey')">
        <input type="file" @change="Onchange">
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
export default {
  name: 'UpdateSecretInfo',
  components: {
    Dialog
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    assetUser: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogInfo: {
        asset: '',
        username: '',
        hostname: '',
        password: '',
        key: ''
      }
    }
  },
  methods: {
    handleConfirm() {
      const data = {
        asset: this.dialogInfo.asset,
        username: this.dialogInfo.username
      }
      if (this.dialogInfo.password !== '') {
        data.password = this.dialogInfo.password
      }
      if (this.dialogInfo.key !== '') {
        data.key = this.dialogInfo.key
      }
      this.$axios.post(
        `/api/v1/assets/asset-users/`,
        data
      ).then(res => {
        this.$message.success(this.$t('common.updateSuccessMsg'))
      }).catch(err => {
        this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
      })
      this.dialogInfo = {
        asset: '',
        username: '',
        hostname: '',
        password: '',
        key: ''
      }
      this.showDialog = false
      this.$refs.ListTable.reloadTable()
    },
    handleCancel() {
      this.dialogInfo = {
        asset: '',
        username: '',
        hostname: '',
        password: '',
        key: ''
      }
      this.showDialog = false
      this.$refs.ListTable.reloadTable()
    },
    Onchange(e) {
      const vm = this
      // TODO 校验文件类型
      const reader = new FileReader()
      reader.onload = function() {
        vm.dialogInfo.key = this.result
      }
      reader.readAsText(
        e.target.files[0]
      )
    }
  }
}
</script>

<style scoped>

</style>
