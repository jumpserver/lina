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

<script>
import { Page } from '@/layout/components'
import { IBox, UploadField } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { getInterfaceInfo, previewThemes, restoreInterface } from '@/api/interface'
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
      imagePreviews: {},
      imageValidationToken: {},
      remoteExtMeta: {},
      imageFieldConfig: {
        logo_index: { width: 185, height: 55 },
        logo_logout: { width: 82, height: 82 },
        favicon: { width: 16, height: 16 },
        login_image: { width: 492, height: 472 }
      },
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
          rules: [
            {
              validator: (rule, value, callback) => {
                if (!String(value || '').trim()) {
                  callback(new Error(this.$t('FieldRequiredError')))
                  return
                }
                callback()
              },
              trigger: ['blur', 'change']
            }
          ]
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
            input: ([value]) => {
              this.syncImagePreview('login_image', value)
            },
            fileChange: ([value], updateForm) => {
              this.handleImageChange('login_image', value, updateForm)
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
            input: ([value]) => {
              this.syncImagePreview('favicon', value)
            },
            fileChange: ([value], updateForm) => {
              this.handleImageChange('favicon', value, updateForm)
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
            input: ([value]) => {
              this.syncImagePreview('logo_index', value)
            },
            fileChange: ([value], updateForm) => {
              this.handleImageChange('logo_index', value, updateForm)
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
            input: ([value]) => {
              this.syncImagePreview('logo_logout', value)
            },
            fileChange: ([value], updateForm) => {
              this.handleImageChange('logo_logout', value, updateForm)
            }
          }
        },
        footer_content: {
          component: MarkDown,
          el: {
            preview: true,
            rows: 5
          },
          rules: [
            {
              validator: (rule, value, callback) => {
                if (String(value || '').length > 200) {
                  callback(new Error(this.$t('FooterContentTooLong200')))
                  return
                }
                callback()
              },
              trigger: ['blur', 'change']
            }
          ]
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
  async mounted() {
    try {
      this.loading = true
      await Promise.all([
        this.loadUrlMeta(),
        this.loadInterfaceInfo()
      ])
    } finally {
      this.loading = false
    }
    this.getPreviewThemes()
  },
  methods: {
    getPreviewThemes() {
      return previewThemes().then(res => {
        this.themeConfigs = res
      })
    },
    async loadUrlMeta() {
      const data = await this.$store.dispatch('common/getUrlMeta', { url: this.url })
      const actions = data.actions || {}
      const putMeta = actions.PUT || {}

      this.remoteExtMeta = putMeta.ext || {}
      console.log('-------------------------------', this.remoteExtMeta)
      this.setExtFormConfig()
    },
    async loadInterfaceInfo() {
      this.interfaceInfo = await getInterfaceInfo()
    },
    setExtFormConfig() {
      const extChildren = this.remoteExtMeta.children || {}
      const extFields = Object.keys(extChildren)

      if (extFields.length === 0) {
        return
      }

      const extGroupLabel = this.remoteExtMeta.label || 'Ext'
      const hasExtGroup = this.fields.some(([, groupFields]) => {
        return Array.isArray(groupFields) && groupFields.length === 1 && groupFields[0] === 'ext'
      })
      const extFieldsMeta = {}

      extFields.forEach((name) => {
        if (this.isUploadFieldMeta(extChildren[name])) {
          extFieldsMeta[name] = this.getExtImageFieldMeta(name)
        }
      })

      if (!hasExtGroup) {
        this.fields = [...this.fields, [extGroupLabel, ['ext']]]
      }
      this.fieldsMeta = this.mergeObjects({}, this.fieldsMeta, {
        ext: {
          fields: extFields,
          fieldsMeta: extFieldsMeta
        }
      })
    },
    getExtFieldKey(name) {
      return `ext.${name}`
    },
    getExtImageFieldMeta(name) {
      const field = this.getExtFieldKey(name)

      return {
        component: UploadField,
        el: {
          width: '10%',
          height: '10%',
          accept: 'image/jpg, image/png, image/jpeg'
        },
        on: {
          input: ([value]) => {
            this.syncImagePreview(field, value)
          },
          fileChange: ([file], updateForm) => {
            this.handleExtImageChange(name, file, updateForm)
          }
        }
      }
    },
    isUploadFieldMeta(meta = {}) {
      return ['file upload'].includes(meta.type)
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
      const { hasFiles, form, payload } = this.buildSubmitPayload(values)
      const requestData = hasFiles ? form : payload
      const request = this.$axios.put(this.url, requestData)

      return request.then(() => {
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      }).catch(error => {
        this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + error))
      })
    },
    buildSubmitPayload(values) {
      const form = new FormData()
      const payload = {}
      const imageKeys = ['favicon', 'login_image', 'logo_logout', 'logo_index']
      const extChildren = this.remoteExtMeta.children || {}
      const extValues = { ...(values.ext || {}) }
      const payloadExtValues = {}
      const multipartExtValues = {}
      let hasFiles = false

      for (const key in values) {
        if (key === 'ext') {
          continue
        }

        if (imageKeys.includes(key)) {
          if (this.files[key] !== undefined) {
            form.append(key, this.files[key])
            hasFiles = true
          }
          continue
        }

        payload[key] = values[key]
        form.append(key, values[key])
      }

      Object.keys(extChildren).forEach((name) => {
        const meta = extChildren[name] || {}
        if (!this.isUploadFieldMeta(meta)) {
          if (extValues[name] !== undefined) {
            payloadExtValues[name] = extValues[name]
            multipartExtValues[name] = extValues[name]
          }
          return
        }

        const field = this.getExtFieldKey(name)
        if (this.files[field] !== undefined) {
          form.append(field, this.files[field])
          hasFiles = true
        }
      })

      if (Object.keys(extChildren).length > 0 || values.ext !== undefined) {
        payload.ext = payloadExtValues
      }

      if (hasFiles) {
        Object.keys(multipartExtValues).forEach((name) => {
          form.append(this.getExtFieldKey(name), multipartExtValues[name])
        })
      }

      return { hasFiles, form, payload }
    },
    async handleImageChange(field, file, updateForm) {
      const token = (this.imageValidationToken[field] || 0) + 1
      this.imageValidationToken[field] = token

      if (!file) {
        this.$delete(this.files, field)
        this.$delete(this.imagePreviews, field)
        return
      }

      const previousFile = this.files[field]
      const previousPreview = this.imagePreviews[field]
      const nextFile = await this.validateImage(field, file)

      if (this.imageValidationToken[field] !== token) {
        return
      }

      if (!nextFile) {
        if (previousFile) {
          this.files[field] = previousFile
        } else {
          this.$delete(this.files, field)
        }
        if (previousPreview) {
          this.imagePreviews[field] = previousPreview
        } else {
          this.$delete(this.imagePreviews, field)
        }
        updateForm({ [field]: previousPreview || this.interfaceInfo[field] || '' })
        return
      }

      this.files[field] = nextFile
      if (nextFile !== file) {
        const previewUrl = this.getObjectURL(nextFile)
        this.imagePreviews[field] = previewUrl
        updateForm({ [field]: previewUrl })
      }
    },
    async handleExtImageChange(name, file, updateForm) {
      const field = this.getExtFieldKey(name)
      const token = (this.imageValidationToken[field] || 0) + 1
      this.imageValidationToken[field] = token

      if (!file) {
        this.$delete(this.files, field)
        this.$delete(this.imagePreviews, field)
        return
      }

      const previousFile = this.files[field]
      const previousPreview = this.imagePreviews[field]
      const nextFile = await this.validateImage(field, file)

      if (this.imageValidationToken[field] !== token) {
        return
      }

      if (!nextFile) {
        if (previousFile) {
          this.files[field] = previousFile
        } else {
          this.$delete(this.files, field)
        }
        if (previousPreview) {
          this.imagePreviews[field] = previousPreview
        } else {
          this.$delete(this.imagePreviews, field)
        }
        updateForm({ [name]: previousPreview || _.get(this.interfaceInfo, field) || '' })
        return
      }

      this.files[field] = nextFile
      if (nextFile !== file) {
        const previewUrl = this.getObjectURL(nextFile)
        this.imagePreviews[field] = previewUrl
        updateForm({ [name]: previewUrl })
      }
    },
    syncImagePreview(field, value) {
      this.imagePreviews[field] = value
    },
    validateImage(field, file) {
      return new Promise((resolve) => {
        const url = URL.createObjectURL(file)
        const img = new Image()

        img.onload = async () => {
          URL.revokeObjectURL(url)
          if (file.size <= 10 * 1024 * 1024) {
            const fieldConfig = this.imageFieldConfig[field]
            const isMatchedSize = !fieldConfig ||
              (
                img.naturalWidth === fieldConfig.width &&
                img.naturalHeight === fieldConfig.height
              )

            if (isMatchedSize) {
              resolve(file)
              return
            }

            const resizedFile = await this.compressImageToLimit(field, file, img)
            if (!resizedFile) {
              resolve(null)
              return
            }
            resolve(resizedFile)
            return
          }

          this.$message.error(this.$t('UploadFileLthHelpText', { limit: 10 }))
          resolve(null)
        }

        img.onerror = () => {
          URL.revokeObjectURL(url)
          this.$message.error(this.$t('ImageFileCorruptedOrUnreadable'))
          resolve(null)
        }

        img.src = url
      })
    },
    async compressImageToLimit(field, file, image) {
      const limitSize = 10 * 1024 * 1024
      const { width: targetWidth, height: targetHeight } = this.imageFieldConfig[field] || {
        width: image.naturalWidth,
        height: image.naturalHeight
      }
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return null
      }

      const drawRect = this.getContainRect(
        image.naturalWidth,
        image.naturalHeight,
        targetWidth,
        targetHeight
      )

      if (file.type !== 'image/png') {
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, targetWidth, targetHeight)
      } else {
        ctx.clearRect(0, 0, targetWidth, targetHeight)
      }

      ctx.drawImage(
        image,
        drawRect.offsetX,
        drawRect.offsetY,
        drawRect.width,
        drawRect.height
      )

      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const blob = await this.canvasToBlob(canvas, mimeType, mimeType === 'image/png' ? 1 : 0.92)
      if (!blob || blob.size > limitSize) {
        return null
      }
      return new File(
        [blob],
        this.renameImage(file.name, mimeType),
        {
          type: mimeType,
          lastModified: Date.now()
        }
      )
    },
    getContainRect(sourceWidth, sourceHeight, targetWidth, targetHeight) {
      const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight, 1)
      const width = Math.max(1, Math.round(sourceWidth * scale))
      const height = Math.max(1, Math.round(sourceHeight * scale))

      return {
        width,
        height,
        offsetX: Math.floor((targetWidth - width) / 2),
        offsetY: Math.floor((targetHeight - height) / 2)
      }
    },
    canvasToBlob(canvas, type, quality) {
      return new Promise((resolve) => {
        canvas.toBlob(blob => {
          resolve(blob)
        }, type, quality)
      })
    },
    renameImage(fileName, mimeType) {
      const ext = mimeType === 'image/png' ? '.png' : '.jpg'
      if (/\.[^.]+$/.test(fileName)) {
        return fileName.replace(/\.[^.]+$/, ext)
      }
      return fileName + ext
    },
    getObjectURL(file) {
      let url = null
      if (window.createObjectURL !== undefined) {
        url = window.createObjectURL(file)
      } else if (window.URL !== undefined) {
        url = window.URL.createObjectURL(file)
      } else if (window.webkitURL !== undefined) {
        url = window.webkitURL.createObjectURL(file)
      }
      return url
    },
    mergeObjects(target, ...sources) {
      for (const source of sources) {
        for (const key in source) {
          if (typeof source[key] === 'object' && typeof target[key] === 'object') {
            this.mergeObjects(target[key], source[key])
          } else {
            target[key] = source[key]
          }
        }
      }
      return target
    }
  }
}
</script>

<style scoped>
.dz {
  padding: 10px 0
}
</style>
