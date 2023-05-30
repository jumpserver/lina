<template>
  <div class="content">
    <div v-if="iConfig.rightImageUrl" class="right-box">
      <el-image :src="iConfig.rightImageUrl" />
    </div>
    <div :class="iConfig.rightImageUrl ? 'left-box' : 'one-box'">
      <el-card style="height: 100%" shadow="never">
        <div class="header">
          <div style="text-align: left; display: inline-block">
            <h2 style="font-weight: 400; font-size: 24px;">{{ iTitle }}</h2>
            <small>{{ iConfig.subTitle }}</small>
          </div>
          <div v-if="iConfig.subMenu" style="float: right; padding: 20px 0; width: 30%">
            <keep-alive>
              <component :is="iConfig.subMenu" />
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
          style="width: 90%; margin-left: 5%"
          @click="submitForm('form')"
        >
          {{ iConfig.btnTitle }}
        </el-button>
        <div v-if="iConfig.extraMenu" style="margin-top: 10%">
          <keep-alive>
            <component :is="iConfig.extraMenu" />
          </keep-alive>
        </div>
      </el-card>
    </div>
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
          const data = this.getFormData()
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

<style lang='scss' scoped>
 .el-form ::v-deep .el-form-item__content {
    margin-left: 5% !important;
    width: 90%;
  }
  .content {
    height: 500px;
    width: 1000px;
    margin-right: auto;
    margin-left: auto;
    margin-top: calc((100vh - 470px) / 3);
  }

  .header {
    padding: 25px 5%;
  }

  .one-box {
    width: 500px;
    margin-right: auto;
    margin-left: auto;
    margin-top: calc((100vh - 470px) / 3);
  }

  .right-box {
    height: 100%;
    width: 50%;
    float: right;
  }

  .left-box {
    text-align: left;
    background-color: white;
    height: 100%;
    width: 50%;
    border-right: 1px solid #EFF0F1;
  }
</style>
