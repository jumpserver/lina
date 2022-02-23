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
import { IBox, UploadField } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { getInterfaceInfo, postInterface, restoreInterface } from '@/api/interface'

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
        ['', ['logo_logout']]
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
