<template>
  <AutoDataForm
    v-if="!loading"
    ref="form"
    :method="method"
    :form="form"
    :url="iUrl"
    :has-save-continue="iHasSaveContinue"
    :has-reset="iHasReset"
    :is-submitting="isSubmitting"
    v-bind="$attrs"
    v-on="$listeners"
    @submit="handleSubmit"
  />
</template>
<script>
import AutoDataForm from '@/components/AutoDataForm'
import { getUpdateObjURL } from '@/utils/common'
import { encryptPassword } from '@/utils/crypto'

export default {
  name: 'GenericCreateUpdateForm',
  components: {
    AutoDataForm
  },
  props: {
    // 创建对象的地址
    url: {
      type: String,
      default: ''
    },
    // 更新的对象
    object: {
      type: Object,
      default: null
    },
    // form的默认值
    initial: {
      type: Object,
      default: () => ({})
    },
    afterGetFormValue: {
      type: Function,
      default: (value) => value
    },
    // 提交前，清理form的值
    cleanFormValue: {
      type: Function,
      default: (value) => value
    },
    // 当提交的时候，怎么处理
    onSubmit: {
      type: Function,
      default: null
    },
    hasReset: {
      type: Boolean,
      default: null
    },
    // 如何提交数据
    performSubmit: {
      type: Function,
      default(validValues) {
        return this.$axios[this.method](this.iUrl, validValues)
      }
    },
    // 创建成功的msg
    createSuccessMsg: {
      type: String,
      default: function() {
        return this.$t('common.createSuccessMsg')
      }
    },
    // 保存成功，继续添加的msg
    saveSuccessContinueMsg: {
      type: String,
      default: function() {
        return this.$t('common.saveSuccessContinueMsg')
      }
    },
    // 更新成功的msg
    updateSuccessMsg: {
      type: String,
      default: function() {
        return this.$t('common.updateSuccessMsg')
      }
    },
    // 创建成功的跳转路由
    createSuccessNextRoute: {
      type: Object,
      default: function() {
        const routeName = this.$route.name.replace('Create', 'List')
        return { name: routeName }
      }
    },
    // 更新成功的跳转路由
    updateSuccessNextRoute: {
      type: Object,
      default: function() {
        const routeName = this.$route.name.replace('Update', 'List')
        return { name: routeName }
      }
    },
    objectDetailRoute: {
      type: Object,
      default: function() {
        const routeName = this.$route.name
          .replace('Update', 'Detail')
          .replace('Create', 'Detail')
        return { name: routeName }
      }
    },
    // 获取下一个路由
    getNextRoute: {
      type: Function,
      default(res, method) {
        return method === 'post' ? this.createSuccessNextRoute : this.updateSuccessNextRoute
      }
    },
    // 获取提交的方法
    submitMethod: {
      type: Function,
      default: function() {
        const params = this.$route.params
        if (params.id) {
          return 'put'
        } else {
          return 'post'
        }
      }
    },
    // 获取创建和更新的url function
    getUrl: {
      type: Function,
      default: function() {
        const params = this.$route.params
        let url = this.url
        if (params.id) {
          url = getUpdateObjURL(url, params.id)
        }
        return url
      }
    },
    emitPerformSuccessMsg: {
      type: Function,
      default(method, res, addContinue) {
        let msg = method === 'post' ? this.createSuccessMsg : this.updateSuccessMsg
        if (addContinue) {
          msg = this.saveSuccessContinueMsg
        }
        let msgLinkName = ''
        if (res.name) {
          msgLinkName = res.name
        } else if (res.hostname) {
          msgLinkName = res.hostname
        }
        const h = this.$createElement
        const detailRoute = this.objectDetailRoute
        detailRoute.params = { id: res.id }
        if (this.hasDetailInMsg) {
          this.$message({
            message: h('p', null, [
              h('el-link', {
                on: {
                  click: () => this.$router.push(detailRoute)
                },
                style: { 'vertical-align': 'top' }
              }, msgLinkName),
              h('span', { style: {
                'padding-left': '5px',
                'height': '18px',
                'line-height': '18px',
                'font-size': '13.5px',
                'font-weight': ' 400' }}, msg)
            ]),
            type: 'success'
          })
        } else {
          this.$message.success(msg)
        }
      }
    },
    onPerformSuccess: {
      type: Function,
      default(res, method, vm, addContinue) {
        const route = this.getNextRoute(res, method)
        if (!(route.params && route.params.id)) {
          route['params'] = Object.assign(route['params'] || {}, { 'id': res.id })
        }
        this.$emit('submitSuccess', res)

        this.emitPerformSuccessMsg(method, res, addContinue)
        if (!addContinue) {
          setTimeout(() => this.$router.push(route), 100)
        }
      }
    },
    onPerformError: {
      type: Function,
      default(error, method, vm) {
        this.$log.error('error: ', error)
        this.$emit('submitError', error)
        const response = error.response
        const data = response.data
        if (response.status === 400) {
          for (const key of Object.keys(data)) {
            let value = data[key]
            if (value instanceof Array) {
              value = value.join(';')
            }
            this.$refs.form.setFieldError(key, value)
          }
        }
      }
    },
    hasSaveContinue: {
      type: Boolean,
      default: null
    },
    hasDetailInMsg: {
      type: Boolean,
      default: true
    },
    encryptedFields: {
      type: Array,
      default: () => ['password', 'token', 'private_key']
    }
  },
  data() {
    return {
      form: {},
      loading: true,
      isSubmitting: false,
      clone: false
    }
  },
  computed: {
    method() {
      return this.submitMethod(this)
    },
    iUrl() {
      // 更新或创建的url
      return this.getUrl()
    },
    iHasSaveContinue() {
      if (this.hasSaveContinue != null) {
        return this.hasSaveContinue
      }
      return this.method === 'post'
    },
    iHasReset() {
      if (this.hasReset != null) {
        return this.hasReset
      }
      return this.isUpdateMethod()
    }
  },
  async created() {
    this.$log.debug('Object init is: ', this.object)
    this.loading = true
    try {
      const values = await this.getFormValue()
      this.$log.debug('Final object is: ', values)
      const formValue = Object.assign(this.form, values)
      this.form = this.afterGetFormValue(formValue)
    } finally {
      this.loading = false
    }
  },
  methods: {
    isUpdateMethod() {
      return ['put', 'patch'].indexOf(this.method.toLowerCase()) > -1
    },
    encryptFields(values) {
      // 批量提交，clean 后可能是个数组
      if (values instanceof Array) {
        return values.map((item) => this.encryptFields(item))
      }
      values = { ...values }
      for (const field of this.encryptedFields) {
        let value = values[field]
        if (!value || typeof value !== 'string') {
          continue
        }
        value = encryptPassword(value)
        values[field] = value
      }
      return values
    },
    handleSubmit(values, formName, addContinue) {
      let handler = this.onSubmit || this.defaultOnSubmit
      handler = handler.bind(this)
      values = this.cleanFormValue(values)
      values = this.encryptFields(values)
      return handler(values, formName, addContinue)
    },
    defaultOnSubmit(validValues, formName, addContinue) {
      this.isSubmitting = true
      this.performSubmit(validValues)
        .then((res) => this.onPerformSuccess.bind(this)(res, this.method, this, addContinue))
        .catch((error) => this.onPerformError(error, this.method, this))
        .finally(() => { this.isSubmitting = false })
    },
    async getFormValue() {
      const cloneFrom = this.$route.query['clone_from']
      if (!this.isUpdateMethod() && !cloneFrom) {
        return Object.assign(this.form, this.initial)
      }
      let object = this.object
      if (!object || Object.keys(object).length === 0) {
        if (cloneFrom) {
          const [curUrl, query] = this.url.split('?')
          const url = `${curUrl}${cloneFrom}/${query ? ('?' + query) : ''}`
          object = await this.getObjectDetail(url)
          if (object['name']) {
            object.name = this.$t('common.cloneFrom') + ' ' + object.name
          } else if (object['hostname']) {
            object.hostname = this.$t('common.cloneFrom') + ' ' + object.hostname
          }
        } else {
          object = await this.getObjectDetail(this.iUrl)
        }
      }
      if (object) {
        object = _.cloneDeep(object)
        this.$emit('update:object', object)
        this.$emit('getObjectDone', object)
      }
      return object
    },
    async getObjectDetail(url) {
      this.$log.debug('Get object detail: ', url)
      return this.$axios.get(url)
    }
  }
}
</script>

<style scoped>
  .ibox >>> .el-card__body {
    padding-top: 30px;
  }

</style>
