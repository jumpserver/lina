<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import select2 from '@/components/Select2'
export default {
  name: 'SystemUserCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {
        login_mode: 'auto',
        priority: '20',
        protocol: 'ssh',
        username_same_with_user: false,
        auto_generate_key: true,
        auto_push: true,
        sftp_root: 'tmp',
        sudo: '/bin/whoami',
        shell: '/bin/bash'

      },
      fields: [
        [this.$t('common.BasicInfo'), ['name', 'login_mode', 'username', 'username_same_with_user', 'priority', 'protocol']],
        [this.$t('common.Auth'), ['auto_generate_key', 'password', 'auto_push']],
        [this.$t('common.Command filter'), ['cmd_filters']],
        [this.$t('common.Others'), ['sftp_root', 'sudo', 'shell', 'comment']]
      ],
      fieldsMeta: {
        login_mode: {
          helpText: '如果选择手动登录模式，用户名和密码可以不填写'
        },
        username: {
          el: {
            disabled: false
          }
        },
        username_same_with_user: {
          type: 'switch',
          helpText: '用户名是动态的，登录资产时使用当前用户的用户名登录',
          hidden: (form) => {
            this.fieldsMeta.username.el.disabled = form.username_same_with_user
            return false
          }
        },
        auto_generate_key: {
          type: 'switch',
          hidden: form => {
            if (JSON.stringify(this.$route.params) !== '{}') {
              return true
            } else {
              return form.login_mode !== 'auto'
            }
          }
        },
        protocol: {
          rules: [
            { required: true }
          ],
          el: {
            style: 'width:100%'
          }
        },
        cmd_filters: {
          component: select2,
          el: {
            placeholder: '命令过滤器'
          }
        },
        priority: {
          rules: [
            { required: true }
          ],
          helpText: '1-100, 1最低优先级，100最高优先级。授权多个用户时，高优先级的系统用户将会作为默认登录用户'
        },
        auto_push: {
          type: 'switch',
          hidden: form => form.login_mode !== 'auto'
        },
        sftp_root: {
          rules: [
            { required: true }
          ],
          helpText: 'SFTP的起始路径，tmp目录, 用户home目录或者自定义'
        },
        sudo: {
          rules: [
            { required: true }
          ],
          helpText: '使用逗号分隔多个命令，如: /bin/whoami,/sbin/ifconfig'
        },
        password: {
          helpText: '密码或密钥密码',
          hidden: form => form.auto_generate_key === true || form.login_mode !== 'auto'
        },
        shell: {
          rules: [
            { required: true }
          ]
        }
      },
      url: '/api/v1/assets/system-users/',
      authHiden: false
    }
  },
  computed: {

  }
}
</script>

<style lang='less' scoped>

</style>
