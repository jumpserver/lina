<template>
  <IBox :title="title">
    <el-form
      ref="usergroup"
      size="small"
      :rules="rules"
      label-position="left"
      label-width="80px"
      :model="usergroup"
      class="form"
    >
      <el-form-item label="名称" prop="name" required>
        <el-input v-model="usergroup.name" />
      </el-form-item>
      <el-form-item label="用户">
        <el-select
          v-model="usergroup.users"
          multiple
          remote
          :remote-method="remoteSerach"
          :loading="loading"
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in tableData"
            :key="item.id"
            :label="item.name+ '(' + item.username + ')' "
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="usergroup.comment"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
      <el-form-item class="foot_button">
        <el-button @click="resetForm('usergroup')">重置</el-button>
        <el-button type="primary" @click="submitForm('usergroup')">{{ buttonTitle }}</el-button>
      </el-form-item>
    </el-form>
  </IBox>
</template>

<script>
import { IBox } from '@/layout/components'
import { getUserList, editUserGroup, getUserGroup, updateUserGroup } from '@/api/user'
export default {
  components: {
    IBox
  },
  data() {
    return {
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      usergroup: {
        name: '',
        users: {},
        comment: ''
      },
      tableData: [],
      loading: false
    }
  },
  computed: {
    title() {
      if (this.$route.params.id === 'create') {
        return this.$t('users.createusergroup')
      } else {
        return this.$t('usergroup.update_user_group')
      }
    },
    buttonTitle() {
      if (this.$route.params.id === 'create') {
        return this.$t('users.createusergroup')
      } else {
        return this.$t('usergroup.update')
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    remoteSerach(word) {
      this.loading = true
      getUserList({ search: word, limit: 10, offset: 0 }).then(response => {
        this.loading = false
        this.tableData = response.results
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.$route.params.id === 'create') {
            editUserGroup(this.usergroup).then(response => {
              this.$message({
                message: '创建成功',
                type: 'success',
                duration: 5 * 1000
              })
              this.$router.push({ name: 'UserGroupList' })
            }).catch(error => {
              console.log(error)
            })
          } else {
            updateUserGroup(this.$route.params.id, this.usergroup).then(response => {
              this.$message({
                message: '创建成功',
                type: 'success',
                duration: 5 * 1000
              })
              this.$router.push({ name: 'UserGroupList' })
            }).catch(error => {
              console.log(error)
            })
          }
        } else {
          // console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    init() {
      if (this.$route.params.id === 'create') {
        // Do Nothing
      } else {
        getUserGroup(this.$route.params.id).then(response => {
          this.usergroup.name = response.name
          // 这里差一个API
          this.usergroup.comment = response.comment
        })
      }
    }
  }
}
</script>

<style lang='less' scoped>
.form{
  margin-top: 20px;
  width: 80%;
  margin-left: 10%;
}
.foot_button{
  padding-bottom: 18px ;
}
//重置El-select宽度
.el-select{
  width: 100%;
}

</style>
