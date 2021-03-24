<template>
  <Page>
    <IBox v-if="!loading">
      <GenericCreateUpdateForm
        :fields="fields"
        :url="url"
        :initial="interfaceInfo"
        :update-success-next-route="successUrl"
        :fields-meta="fieldsMeta"
        :on-submit="submitForm"
        :more-buttons="moreButtons"
        :has-save-continue="hasSaveContinue"
      />
    </IBox>
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import { IBox, ThemePicker, UploadField } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { getInterfaceInfo, postInterface, restoreInterface } from '@/views/xpack/api'

export default {
  name: 'InterfaceSettings',
  components: {
    IBox,
    Page,
    GenericCreateUpdateForm
  },
  data() {
    return {
      loading: true,
      files: {},
      interfaceInfo: {},
      hasSaveContinue: false,
      successUrl: { name: 'Settings' },
      fields: [
        ['', ['login_title']],
        ['', ['login_image']],
        ['', ['favicon']],
        ['', ['logo_index']],
        ['', ['logo_logout']],
        ['', ['theme_color', 'bar_menu_color', 'bar_menu_active_color', 'bar_submenu_color', 'bar_submenu_active_color']]
      ],
      fieldsMeta: {
        login_title: {
          label: this.$t('xpack.loginTitle'),
          helpText: this.$t('xpack.loginTitleTip')
        },
        login_image: {
          component: UploadField,
          label: this.$t('xpack.loginImage'),
          el: {
            width: '10%',
            height: '10%',
            tip: this.$t('xpack.loginImageTip')
          },
          on: {
            fileChange: ([value], updateForm) => {
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
            tip: this.$t('xpack.faviconTip')
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
            tip: this.$t('xpack.logoIndexTip')
          },
          on: {
            fileChange: ([value], updateForm) => {
              this.files['logo_index'] = value
            }
          }
        },
        theme_color: {
          label: `主题色设置`,
          component: ThemePicker,
          el: {
            defaultColor: '#1ab394'
          }
        },
        // bar_title_color: {
        //   label: `侧边栏标题颜色设置`,
        //   component: ThemePicker,
        //   el: {
        //     defaultColor: '#2f4050'
        //   }
        // },
        bar_menu_color: {
          label: `侧边栏菜单颜色设置`,
          component: ThemePicker,
          el: {
            defaultColor: '#2f4050'
          }
        },
        bar_menu_active_color: {
          label: `侧边栏菜单高亮颜色设置`,
          component: ThemePicker,
          el: {
            defaultColor: '#293846'
          }
        },
        bar_submenu_color: {
          label: `侧边栏子菜单颜色设置`,
          component: ThemePicker,
          el: {
            defaultColor: '#1f2d3d'
          }
        },
        bar_submenu_active_color: {
          label: `侧边栏子菜单高亮颜色设置`,
          component: ThemePicker,
          el: {
            defaultColor: '#001528'
          }
        },
        logo_logout: {
          component: UploadField,
          label: this.$t('xpack.logoLogout'),
          el: {
            width: '5%',
            height: '5%',
            tip: this.$t('xpack.logoLogoutTip')
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
            this.$confirm(this.$t('xpack.restoreDialogMessage'),
              this.$t('xpack.restoreDialogTitle'), {
                confirmButtonText: this.$t('common.Confirm'),
                cancelButtonText: this.$t('common.Cancel'),
                type: 'warning'
              }).then(() => {
              restoreInterface().then(res => {
                this.$message.success(res.success)
                location.reload()
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
