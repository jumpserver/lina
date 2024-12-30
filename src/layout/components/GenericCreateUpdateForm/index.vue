<template>
  <AutoDataForm
    v-if="!loading"
    ref="form"
    :form="form"
    :has-reset="iHasReset"
    :has-save-continue="iHasSaveContinue"
    :is-submitting="isSubmitting"
    :method="method"
    :url="iUrl"
    v-bind="$attrs"
    @afterRemoteMeta="handleAfterRemoteMeta"
    @submit="handleSubmit"
    v-on="$listeners"
  />
</template>
<script>
import AutoDataForm from '@/components/Form/AutoDataForm'
import { getUpdateObjURL } from '@/utils/common'
import { encryptPassword } from '@/utils/crypto'
import deepmerge from 'deepmerge'

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
    // 获取 meta
    afterGetRemoteMeta: {
      type: Function,
      default: null
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
        return this.$t('CreateSuccessMsg')
      }
    },
    // 保存成功，继续添加的msg
    saveSuccessContinueMsg: {
      type: String,
      default: function() {
        return this.$t('SaveSuccessContinueMsg')
      }
    },
    // 更新成功的msg
    updateSuccessMsg: {
      type: String,
      default: function() {
        return this.$t('UpdateSuccessMsg')
      }
    },
    // 创建成功的跳转路由
    createSuccessNextRoute: {
      type: Object,
      default: function() {
        const routeName = this.$route.name?.replace('Create', 'List')
        return { name: routeName }
      }
    },
    // 更新成功的跳转路由
    updateSuccessNextRoute: {
      type: Object,
      default: function() {
        const routeName = this.$route.name?.replace('Update', 'List')
        return { name: routeName }
      }
    },
    objectDetailRoute: {
      type: Object,
      default: function() {
        const routeName = this.$route.name?.replace('Update', 'Detail')
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
    cloneNameSuffix: {
      type: [String, Number],
      default: function() {
        return this.$t('Duplicate').toLowerCase()
      }
    },
    // 获取提交的方法
    submitMethod: {
      type: [Function, String],
      default: ''
    },
    // 获取创建和更新的url function
    getUrl: {
      type: Function,
      default: function() {
        const objectId = this.getUpdateId()
        let url = this.url
        if (objectId) {
          url = getUpdateObjURL(url, objectId)
        }

        const clone_from = this.getCloneId()
        const query = clone_from ? `clone_from=${clone_from}` : ''
        if (query) {
          if (url.indexOf('?') === -1) {
            url = `${url}?${query}`
          } else {
            url = `${url}&${query}`
          }
        }
        return url
      }
    },
    extraQueryOrder: {
      type: String,
      default: '-date_updated'
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
        }
        const h = this.$createElement
        const detailRoute = this.objectDetailRoute
        detailRoute.params = { id: res.id }
        if (this.hasDetailInMsg) {
          msg = msg[0].toLowerCase() + msg.slice(1)
          this.$message({
            message: h('p', null, [
              h('el-link', {
                on: {
                  click: () => this.$router.push(detailRoute)
                },
                style: { 'vertical-align': 'top', 'margin-right': '5px' }
              }, msgLinkName),
              h('span', {}, msg)
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
          route['params'] = deepmerge(route['params'] || {}, { 'id': res.id })
        }
        route['query'] = deepmerge(route['query'], { 'order': this.extraQueryOrder, 'updated': new Date().getTime() })

        this.$emit('submitSuccess', res)

        this.emitPerformSuccessMsg(method, res, addContinue)
        if (addContinue) {
          return
        }

        if (!vm.drawer) {
          if (this.$router.currentRoute.name !== route?.name) {
            setTimeout(() => this.$router.push(route), 100)
          }
        } else {
          this.$store.dispatch('common/finishDrawerActionMeta', { action: vm.action, row: res })
        }
      }
    },
    onPerformError: {
      type: Function,
      default(error, method, vm) {
        const response = error.response
        const data = response.data
        if (response.status === 400) {
          for (const key of Object.keys(data)) {
            let err = ''
            let errorTips = data[key]
            if (errorTips instanceof Array) {
              errorTips = _.filter(errorTips, (item) => Object.keys(item).length > 0)
              for (const i of errorTips) {
                if (i instanceof Object) {
                  err += i?.port?.join(',')
                } else {
                  err += i
                }
              }
            } else {
              err = errorTips
            }
            this.$refs.form.setFieldError(key, err)
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
    },
    needGetObjectDetail: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      form: {},
      loading: true,
      isSubmitting: false,
      clone: false,
      drawer: false,
      action: '',
      actionId: '',
      row: {},
      method: ''
    }
  },
  computed: {
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
    this.loading = true
    this.$log.debug('Object init is: ', this.object, this.method)
    await this.setDrawerMeta()
    this.setMethod()
    try {
      const values = await this.getFormValue()
      this.$log.debug('Final object is: ', values)
      const formValue = Object.assign(this.form, values)
      this.form = this.afterGetFormValue(formValue)
      console.log('Form: ', this.form)
    } finally {
      this.loading = false
    }
  },
  methods: {
    async setDrawerMeta() {
      const drawActionMeta = await this.$store.dispatch('common/getDrawerActionMeta')
      if (drawActionMeta) {
        this.drawer = true
        this.action = drawActionMeta.action
        this.row = drawActionMeta.row
        this.actionId = this.row?.id
      }
    },
    setMethod() {
      if (this.submitMethod instanceof Function) {
        this.method = this.submitMethod(this)
      } else {
        this.method = this.submitMethod
      }
      if (this.drawer && !this.submitMethod) {
        if (this.action === 'clone' || this.action === 'create') {
          this.method = 'post'
        } else {
          this.method = 'put'
        }
      }
    },
    getUpdateId() {
      if (this.actionId && this.action === 'update') {
        return this.actionId
      } else {
        return this.$route.params['id']
      }
    },
    getCloneId() {
      if (this.actionId && this.action === 'clone') {
        return this.actionId
      } else {
        return this.$route.query['clone_from']
      }
    },
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
    handleAfterRemoteMeta(meta) {
      if (this.afterGetRemoteMeta) {
        return this.afterGetRemoteMeta(meta)
      }
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
        .finally(() => {
          setTimeout(() => {
            this.isSubmitting = false
            this.$emit('performFinished')
          }, 200)
        })
    },
    async getCloneForm(cloneFrom) {
      const [curUrl, query] = this.url.split('?')
      const url = `${curUrl}${cloneFrom}/${query ? ('?' + query) : ''}`
      const object = await this.getObjectDetail(url)
      let name = ''
      let attr = ''
      if (object['name']) {
        name = object['name']
        attr = 'name'
      } else if (object['hostname']) {
        name = object['hostname']
        attr = 'hostname'
      }
      object[attr] = name + '-' + this.cloneNameSuffix.toString()
      return object
    },
    async getFormValue() {
      if (this.action === 'create' || !this.needGetObjectDetail) {
        return Object.assign(this.form, this.initial)
      }
      let object = this.object

      console.log('Object: ', object)
      if (!object || Object.keys(object).length === 0) {
        if (this.action === 'clone') {
          object = await this.getCloneForm(this.actionId)
        } else {
          object = await this.getObjectDetail(this.iUrl, this.actionId)
        }
      }
      console.log('Object 2: ', object)
      if (object) {
        object = _.cloneDeep(object)
        this.$emit('update:object', object)
        this.$emit('getObjectDone', object)
      }
      return object
    },
    async getObjectDetail(url, id) {
      this.$log.debug('Get object detail: ', url)
      let data = await this.$axios.get(url, { params: { id }})
      console.log('Is array: ', Array.isArray(data))
      if (Array.isArray(data)) {
        data = {}
      }
      return data
    }
  }
}
</script>

<style scoped>
.ibox ::v-deep .el-card__body {
  padding-top: 30px;
}
</style>
