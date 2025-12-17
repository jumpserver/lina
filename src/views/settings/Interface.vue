<template>
  <Page>
    <div v-if="isDev" style="margin-bottom: 20px">
      <div class="dz">
        <el-button
          v-for="(value, tp) in examples"
          :key="tp"
          :type="tp"
          size="small"
        >
          {{ value }}
        </el-button>
      </div>
      <div class="dz">
        <el-button
          v-for="(value, tp) in examples"
          :key="tp"
          :type="tp"
          size="small"
          disabled
        >
          {{ value }}
        </el-button>
      </div>
      <div class="dz">
        <el-link
          v-for="(value, tp) in examples"
          :key="tp"
          :type="tp"
          style="padding-right: 10px;"
        >
          {{ value }}
        </el-link>
      </div>
      <div class="dz">
        <el-radio-group v-model="dz.radio">
          <el-radio v-for="i in 3" :key="i" :label="$tc('Options') + ` ${i}`" />
        </el-radio-group>
      </div>
      <div class="dz">
        <el-steps :active="1" :space="100">
          <el-step
            v-for="(s, i) in stepStatus"
            :key="s"
            :title="$tc('Step') + ` ${i+1}`"
            :status="s"
          />
        </el-steps>
      </div>
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

<script lang="jsx">
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
      stepStatus: ['wait', 'success', 'finish', 'process', 'error'],
      loading: true,
      files: {},
      examples: {
        'primary': this.$t('Primary'), 'info': this.$t('Info'), 'warning': this.$t('Warning'),
        'success': this.$t('Success'), 'danger': this.$t('Danger')
      },
      interfaceInfo: {},
      hasSaveContinue: false,
      successUrl: { name: 'Settings' },
      isDev: process.env.NODE_ENV === 'development',
      themeConfigs: [],
      fields: [
        [this.$t('Basic'), ['login_title', 'theme']],
        ['Logo', ['logo_index', 'logo_logout', 'favicon']],
        [this.$t('Images'), ['login_image']],
        [this.$t('Footer'), ['footer_content']]
      ],
      fieldsMeta: {
        login_title: {
          helpText: this.$t('LoginTitleTip')
        },
        theme: {
          on: {
            change: ([value]) => {
              const themeColors = this.getSelectThemeConfig(value)
              this.$store.dispatch('settings/changeThemeStyle', themeColors)
            }
          }
        },
        login_image: {
          component: UploadField,
          el: {
            width: '10%',
            height: '10%',
            accept: 'image/jpg, image/png, image/jpeg',
            tip: this.$t('LoginImageTip')
          },
          on: {
            fileChange: ([value], updateForm) => {
              this.files['login_image'] = value
            }
          }
        },
        favicon: {
          component: UploadField,
          el: {
            width: '5%',
            height: '5%',
            accept: 'image/jpg, image/png, image/jpeg',
            tip: this.$t('FaviconTip')
          },
          on: {
            fileChange: ([value], updateForm) => {
              this.files['favicon'] = value
            }
          }
        },
        logo_index: {
          component: UploadField,
          el: {
            width: '10%',
            height: '10%',
            accept: 'image/jpg, image/png, image/jpeg',
            tip: this.$t('LogoIndexTip'),
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
          el: {
            width: '5%',
            height: '5%',
            accept: 'image/jpg, image/png, image/jpeg',
            tip: this.$t('LogoLogoutTip')
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
          title: this.$t('RestoreButton'),
          callback: function(value, form) {
            this.$confirm(this.$t('RestoreDialogMessage'),
              this.$t('RestoreDialogTitle'), {
                confirmButtonText: this.$t('Confirm'),
                cancelButtonText: this.$t('Cancel'),
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
        if (value !== undefined) {
          form.append(key, value)
        }
      }
      updateInterface(form).then(res => {
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      }).catch(error => {
        this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + error))
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
