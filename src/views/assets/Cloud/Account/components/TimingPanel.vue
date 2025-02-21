<template>
  <GenericCreateUpdateForm
    ref="form"
    class="form"
    v-bind="settings"
    @performFinished="handlePerformFinished"
    @submitSuccess="handleSubmitSuccess"
  />
</template>

<script>

import { GenericCreateUpdateForm } from '@/layout/components'
import { periodicMeta } from '@/components/const'

export default {
  name: 'ResultPanel',
  components: {
    GenericCreateUpdateForm
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      submitType: 'timing',
      settings: {
        url: `/api/v1/xpack/cloud/sync-instance-tasks/`,
        fields: [
          [this.$t('Timer'), ['is_periodic', 'interval', 'crontab']]
        ],
        fieldsMeta: {
          ...periodicMeta
        },
        defaultButton: false,
        submitMethod: 'put',
        getUrl: () => {
          return `${this.settings.url}${this.object.task.id}/`
        },
        moreButtons: [
          {
            title: this.$t('Confirm'),
            type: 'primary',
            loading: false,
            callback: (value, form, btn) => {
              this.submitForm(form, btn)
            }
          },
          {
            title: this.$tc('Cancel'),
            callback: () => {
              this.$emit('update:visible', false)
            }
          }
        ],
        getNextRoute: (res, method) => {
          return { name: 'CloudAccountDetail', params: { id: res.account.id }}
        }
      }
    }
  },
  mounted() {
  },
  methods: {
    submitForm(form, btn) {
      form.validate((valid) => {
        if (valid) {
          btn.loading = true
          this.$refs.form.$refs.form.dataForm.submitForm('form', false)
        }
      })
    },
    handleSubmitSuccess(res) {
      this.$emit('update:visible', false)
    },
    handlePerformFinished() {
      for (const btn of this.settings.moreButtons) {
        btn.loading = false
      }
    }
  }
}
</script>

<style lang='scss' scoped>
::v-deep .el-form-item.form-buttons {
  text-align: right;
}

.form {
  margin-right: 0;
}
</style>
