<template>
  <TabPage :submenu="submenu" :active-menu="activeMenu">
    <IBox v-if="!loading">
      <GenericCreateUpdateForm
        :fields="fields"
        :url="url"
        :initial="interfaceInfo"
        :update-success-next-route="successUrl"
        :fields-meta="fieldsMeta"
        :on-submit="submitForm"
        :more-buttons="moreButtons"
      />
    </IBox>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import { IBox, UploadField } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { getInterfaceInfo, postInterface, restoreInterface } from '@/views/xpack/api'

export default {
  name: 'InterfaceSettings',
  components: {
    IBox,
    TabPage,
    GenericCreateUpdateForm
  },
  data() {
    return {
      loading: true,
      files: {},
      interfaceInfo: {},
      activeMenu: 'interface',
      submenu: [
        {
          title: this.$t('xpack.InterfaceSettings'),
          name: 'interface'
        }
      ],
      successUrl: { name: 'Settings' },
      fields: [
        ['', ['login_title']],
        ['', ['login_image']],
        ['', ['favicon']],
        ['', ['logo_index']],
        ['', ['logo_logout']]
      ],
      fieldsMeta: {
        login_title: {
          label: this.$t('xpack.loginTitle'),
          helpText: '提示：将会显示在企业版用户登录页面（eg: 欢迎使用JumpServer开源堡垒机)'
        },
        login_image: {
          component: UploadField,
          label: this.$t('xpack.loginImage'),
          el: {
            width: '10%',
            height: '10%',
            tip: '提示：将会显示在企业版用户登录页面（建议图片大小为: 492*472px）'
          },
          on: {
            fileChange: ([value], updateForm) => {
              console.log(value)
              this.files['login_image'] = value
            }
          }
        },
        favicon: {
          component: UploadField,
          label: this.$t('xpack.favicon'),
          el: {
            width: '5%',
            height: '5%',
            tip: '提示：网站图标（建议图片大小为: 16px*16px）'
          },
          on: {
            fileChange: ([value], updateForm) => {
              this.files['favicon'] = value
            }
          }
        },
        logo_index: {
          component: UploadField,
          label: this.$t('xpack.logoIndex'),
          el: {
            width: '10%',
            height: '10%',
            tip: '提示：将会显示在管理页面左上方（建议图片大小为: 185px*55px）'
          },
          on: {
            fileChange: ([value], updateForm) => {
              this.files['logo_index'] = value
            }
          }
        },
        logo_logout: {
          component: UploadField,
          label: this.$t('xpack.logoLogout'),
          el: {
            width: '5%',
            height: '5%',
            tip: '提示：将会显示在企业版用户退出页面（建议图片大小为：82px*82px）'
          },
          on: {
            fileChange: ([value], updateForm) => {
              this.files['logo_logout'] = value
            }
          }
        }
      },
      url: '/api/v1/xpack/interface/setting',
      moreButtons: [
        {
          title: this.$t('xpack.RestoreButton'),
          callback: function(value, form) {
            this.$confirm('您确定要恢复默认初始化吗？', '你确认吗?', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              restoreInterface().then(res => {
                this.$message.success(res.success)
                location.reload()
              }).catch(errMsg => {
                this.$message.error(errMsg.response.data.error)
              })
            })
          }.bind(this)
        }
      ]
    }
  },
  mounted() {
    getInterfaceInfo().then(data => {
      this.interfaceInfo = data
      this.loading = false
    })
  },
  methods: {
    submitForm(values) {
      const form = new FormData()
      const ImageKeys = ['favicon', 'login_image', 'logo_logout', 'logo_index']
      ImageKeys.forEach((value, index) => {
        if (this.files[value] !== undefined) {
          form.append(value, this.files[value])
        }
      })
      if (values['login_title'] !== undefined) {
        form.append('login_title', values['login_title'])
      }
      postInterface(form).then(res => {
        location.reload()
      })
    }

  }
}
</script>

<style scoped>

</style>
