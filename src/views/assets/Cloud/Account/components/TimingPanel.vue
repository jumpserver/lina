<template>
  <GenericCreateUpdateForm
    v-bind="settings"
    ref="form"
    class="form"
    :object="object"
    @perform-finished="handlePerformFinished"
    @submit-success="handleSubmitSuccess"
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
      default: () => {}
    }
  },
  data() {
    const intervalMeta = { ...periodicMeta.interval }
    const isPeriodicMeta = {
      ...periodicMeta.is_periodic,
      label: this.$t('Timer')
    }
    delete intervalMeta.component
    delete intervalMeta.el
    return {
      submitType: 'timing',
      settings: {
        url: `/api/v1/xpack/cloud/sync-instance-tasks/`,
        fields: [[this.$t('Timer'), ['is_periodic', 'interval', 'interval_unit', 'crontab']]],
        fieldsMeta: {
          ...periodicMeta,
          is_periodic: isPeriodicMeta,
          interval: intervalMeta,
          interval_unit: {
            type: 'select',
            label: this.$t('Unit'),
            hidden: (formValue) => formValue.is_periodic === false,
            options: [
              { label: this.$t('Minute'), value: 'minute' },
              { label: this.$t('Hour'), value: 'hour' }
            ]
          }
        },
        defaultButton: false,
        submitMethod: 'put',
        getUrl: () => {
          return `${this.settings.url}${this.object.id}/`
        },
        moreButtons: [
          {
            title: this.$t('Confirm'),
            type: 'primary',
            loading: false,
            callback: (value, form, btn) => {
              this.submitForm(value, form, btn)
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
          return { name: 'CloudAccountDetail', params: { id: res.account.id } }
        }
      }
    }
  },
  mounted() {},
  methods: {
    submitForm(value, form, btn) {
      const hasInterval = Number(value.interval) > 0
      const hasCrontab = Boolean(value.crontab?.trim())
      if (value.is_periodic && !hasInterval && !hasCrontab) {
        this.$message.error(this.$t('CloudScheduleRequired'))
        return
      }
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

<style lang="scss" scoped>
:deep(.el-form-item.form-buttons) {
  text-align: right;
}

.form {
  margin-right: 0;
}
</style>
