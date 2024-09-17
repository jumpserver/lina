<template>
  <GenericCreateUpdateForm
    ref="form"
    class="form"
    v-bind="settings"
    @submitSuccess="handleSubmitSuccess"
    @performFinished="handlePerformFinished"
  />
</template>

<script>

import { GenericCreateUpdateForm } from '@/layout/components'
import { crontab, interval, is_periodic } from '@/views/accounts/const'

export default {
  name: 'ResultPanel',
  components: {
    GenericCreateUpdateForm
  },
  props: {
    object: {
      type: Object,
      default: () => {}
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
          is_periodic,
          interval,
          crontab
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
        }
      })

      if (form.value.interval && typeof form.value.interval === 'number') {
        form.value.interval = parseInt(form.value.interval, 10)
      } else {
        form.value.interval = 24
      }

      this.$refs.form.$refs.form.dataForm.submitForm('form', false)
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
