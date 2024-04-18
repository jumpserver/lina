<template>
  <Page>
    <div v-if="isDev" style="margin-bottom: 20px">
      <div class="dz">
        <el-button
          v-for="tp of ['primary', 'success', 'info', 'warning', 'danger']"
          :key="tp"
          :type="tp"
        >
          {{ tp.toUpperCase() }}
        </el-button>
      </div>
      <div class="dz">
        <el-button
          v-for="tp of ['primary', 'success', 'info', 'warning', 'danger']"
          :key="tp"
          :type="tp"
          disabled
        >
          {{ tp.toUpperCase() }}
        </el-button>
      </div>

      <div class="dz">
        <el-link
          v-for="tp of ['primary', 'success', 'info', 'warning', 'danger']"
          :key="tp"
          :type="tp"
        >
          <span style="padding-right: 10px">{{ tp.toUpperCase() }}</span>
        </el-link>
      </div>
      <div class="dz">
        <el-radio-group v-model="dz.radio">
          <el-radio :label="3">备选项1</el-radio>
          <el-radio :label="6">备选项2</el-radio>
          <el-radio :label="9">备选项3</el-radio>
        </el-radio-group>
      </div>
      <el-steps :active="1" :space="200" class="dz" finish-status="error">
        <el-step title="已完成" />
        <el-step title="进行中" />
        <el-step title="步骤 3" />
      </el-steps>
      <div class="dz" />
    </div>
    <IBox v-if="!loading">
      <GenericCreateUpdateForm
        :fields="fields"
        :fields-meta="fieldsMeta"
        :has-save-continue="hasSaveContinue"
        :initial="interfaceInfo"
        :more-buttons="moreButtons"
        :on-submit="submitForm"
        :submit-method="submitMethod"
        :update-success-next-route="successUrl"
        :url="url"
      />
    </IBox>
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import { IBox, UploadField } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { getInterfaceInfo, previewThemes, restoreInterface, updateInterface } from '@/api/interface'
import MarkDown from '@/components/Widgets/MarkDown'

export default {
  name: 'InterfaceSettings',
  components: {
    IBox,
    Page,
    GenericCreateUpdateForm
  },
  data() {
    return {
      dz: {},
      loading: true,
      files: {},
      interfaceInfo: {},
      hasSaveContinue: false,
      successUrl: { name: 'Settings' },
      isDev: process.env.NODE_ENV === 'development',
      themeConfigs: [],
      fields: [
        [this.$t('common.Basic'), ['login_title', 'theme']],
        ['Logo', ['logo_index', 'logo_logout', 'favicon']],
        [this.$t('xpack.Images'), ['login_image']],
        [this.$t('xpack.Footer'), ['footer_content']]
      ],
      fieldsMeta: {
        login_title: {
          label: this.$t('xpack.loginTitle'),
          helpText: this.$t('xpack.loginTitleTip')
        },
        theme: {
          label: this.$t('notifications.Subject'),
          on: {
            change: ([value]) => {
              const themeColors = this.getSelectThemeConfig(value)
              this.$store.dispatch('settings/changeThemeStyle', themeColors)
            }
          }
        },
        login_image: {
          component: UploadField,
          label: this.$t('xpack.loginImage'),
          el: {
            width: '10%',
            height: '10%',
            accept: 'image/jpg, image/png, image/jpeg',
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
            accept: 'image/jpg, image/png, image/jpeg',
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
            accept: 'image/jpg, image/png, image/jpeg',
            tip: this.$t('xpack.logoIndexTip'),
            showBG: true
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
            accept: 'image/jpg, image/png, image/jpeg',
            tip: this.$t('xpack.logoLogoutTip')
          },
          on: {
            fileChange: ([value], updateForm) => {
              this.files['logo_logout'] = value
            }
          }
        },
        footer_content: {
          component: MarkDown,
          el: {
            preview: true,
            rows: 5
          }
        }
      },
      url: '/api/v1/xpack/interface/setting/',
      submitMethod() {
        return 'put'
      },
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
    this.getPreviewThemes()
  },
  methods: {
    getPreviewThemes() {
      previewThemes().then(res => {
        this.themeConfigs = res
      })
    },
    getSelectThemeConfig(value) {
      let themeConfig
      for (const item of this.themeConfigs) {
        if (item.name === value) {
          themeConfig = item.colors
          break
        }
      }
      return themeConfig
    },
    submitForm(values) {
      const form = new FormData()
      const imageKeys = ['favicon', 'login_image', 'logo_logout', 'logo_index']
      for (const key in values) {
        let value
        if (imageKeys.includes(key)) {
          value = this.files[key]
        } else {
          value = values[key]
        }
        if (value) {
          form.append(key, value)
        }
      }
      updateInterface(form).then(res => {
        this.$message.success(this.$tc('common.updateSuccessMsg'))
      }).catch(error => {
        this.$message.error(this.$tc('common.updateErrorMsg' + ' ' + error))
      })
    }
  }
}
</script>

<style scoped>
.dz {
  padding: 10px 0
}
</style>
