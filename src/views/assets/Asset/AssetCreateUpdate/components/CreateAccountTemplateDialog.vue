<template>
  <div>
    <Dialog
      v-if="isVisible"
      :title="$tc('route.TemplateCreate')"
      :visible.sync="isVisible"
      :show-cancel="false"
      :show-confirm="false"
      width="70%"
    >
      <GenericCreateUpdateForm v-bind="formConfig" />
    </Dialog>
  </div>

</template>

<script>
import { Dialog } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { templateFields, templateFieldsMeta } from '@/views/accounts/AccountTemplate/const.js'

export default {
  name: 'EmailContent',
  components: {
    GenericCreateUpdateForm,
    Dialog
  },
  props: {
    createVisible: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      default: 'all'
    }
  },
  data() {
    return {
      formConfig: {
        initial: { secret_type: 'password' },
        url: '/api/v1/accounts/account-templates/',
        getUrl: function() {
          return '/api/v1/accounts/account-templates/'
        },
        needGetObjectDetail: false,
        hasDetailInMsg: false,
        fields: [
          ...templateFields(this)
        ],
        fieldsMeta: {
          ...templateFieldsMeta(this)
        },
        hasSaveContinue: false,
        cleanFormValue(value) {
          Object.keys(value).forEach((item, index, arr) => {
            if (['ssh_key', 'token', 'access_key'].includes(item)) {
              value['secret'] = value[item]
              delete value[item]
            }
          })
          return value
        },
        createSuccessNextRoute: { name: '' },
        onPerformSuccess: (res) => {
          this.isVisible = false
          this.$emit('onPerform')
        }
      }
    }
  },
  computed: {
    isVisible: {
      set(val) {
        this.$emit('update:create-visible', val)
      },
      get() {
        return this.createVisible
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
