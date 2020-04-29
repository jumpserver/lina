<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
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
        [this.$tc('Basic Info'), ['name', 'login_mode', 'username', 'username_same_with_user', 'priority', 'protocol']],
        [this.$tc('Auth'), ['auto_generate_key', 'password', 'auto_push']],
        [this.$tc('Command filter'), ['cmd_filters']],
        [this.$tc('Others'), ['sftp_root', 'sudo', 'shell', 'comment']]
      ],
      fieldsMeta: {
        login_mode: {
          helpText: '如果选择手动登录模式，用户名和密码可以不填写'
        },
        username_same_with_user: {
          type: 'switch',
          helpText: '用户名是动态的，登录资产时使用当前用户的用户名登录'
        },
        auto_generate_key: {
          type: 'switch'
        },
        protocol: {
          rules: [
            { required: true }
          ]
        },
        cmd_filters: {
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
          type: 'switch'
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
          hidden: form => form.auto_generate_key === true
        },
        shell: {
          rules: [
            { required: true }
          ]
        }
      },
      url: '/api/v1/assets/system-users/'
    }
  }
}
</script>

<style lang='less' scoped>

</style>
