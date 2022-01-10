<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import getFields from '@/views/accounts/EscapeRoutePlan/fields'

export default {
  name: 'EscapeRoutePlanreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const fields = getFields.bind(this)()
    return {
      url: '/api/v1/assets/escape/',
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['recipients', 'comment']]
      ],
      initial: {
        is_periodic: true,
        interval: 24
      },
      fieldsMeta: {
        is_periodic: fields.is_periodic,
        crontab: fields.crontab,
        interval: fields.interval,
        recipients: fields.recipients
      },
      createSuccessNextRoute: { name: 'EscapeRoutePlanIndex' },
      updateSuccessNextRoute: { name: 'EscapeRoutePlanIndex' },
      cleanFormValue(data) {
        if (data['interval'] === '') {
          delete data['interval']
        }
        return data
      }
    }
  }
}
</script>

<style scoped>

</style>
