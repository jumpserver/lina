<template>
  <div style="padding-top: 100px">
    <el-col :md="8" :offset="8" :sm="24">
      <el-card style="padding: 30px 0 30px 40px">
        <div slot="header">
          <h1>{{ iTitle }}</h1>
          <small>{{ iConfig.subTitle }}</small>
          <div style="float: right; padding: 3px 0">
            <keep-alive>
              <component :is="iConfig.subMenu" v-if="iConfig.subMenu" />
            </keep-alive>
          </div>
        </div>
        <AutoDataForm
          ref="form"
          :url="iConfig.url"
          :fields="fields"
          :fields-meta="fieldsMeta"
          v-bind="kwargs"
          v-on="$listeners"
        />
        <el-button
          v-if="iConfig.submitButton"
          :disabled="!iConfig.canSubmit"
          size="medium"
          type="primary"
          style="width: 95%"
          @click="submitForm('form')"
        >
          {{ iConfig.btnTitle }}
        </el-button>
      </el-card>
    </el-col>
  </div>
</template>

<script>
import AutoDataForm from '@/components/AutoDataForm'
import { scrollToError } from '@/utils'

export default {
  name: 'CentralForm',
  components: {
    AutoDataForm
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    fields: {
      type: Array,
      default: () => []
    },
    fieldsMeta: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      kwargs: {
        hasReset: false,
        hasSaveContinue: false,
        defaultButton: false
      },
      defaultConfig: {
        title: '',
        subTitle: '',
        btnTitle: this.$t('common.Submit'),
        canSubmit: true,
        submitButton: true
      }
    }
  },
  computed: {
    iConfig() {
      return Object.assign(this.defaultConfig, this.config)
    },
    iTitle() {
      return this.iConfig.title || this.$route.meta.title
    },
    iForm() {
      return this.$refs['form'].$refs['dataForm'].$refs['form']
    }
  },
  mounted() {
    document.querySelector('body').setAttribute('style', 'background-color:#f3f3f4')
  },
  methods: {
    getFormData() {
      return this.iForm.getFormValue()
    },
    submitForm(formName, addContinue) {
      this.iForm.validate((valid) => {
        if (valid) {
          const data = self.getFormData()
          this.$axios.post(
            this.iConfig.url, data, { disableFlashErrorMsg: true }
          ).then((resp) => {
            if (this.iConfig.btnCallback) {
              this.iConfig.btnCallback(resp)
            }
          }).catch(error => {
            const data = error.response.data
            for (const key of Object.keys(data)) {
              let value = data[key]
              if (value instanceof Array) {
                value = value.join(';')
              }
              this.$refs['form'].setFieldError(key, value)
            }
          })
        } else {
          scrollToError(this.iForm.$el)
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
