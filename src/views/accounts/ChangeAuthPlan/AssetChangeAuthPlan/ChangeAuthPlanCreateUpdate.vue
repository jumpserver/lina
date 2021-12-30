<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import getFields from '@/views/accounts/ChangeAuthPlan/fields'

export default {
  name: 'AssetChangeAuthPlanCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const fields = getFields.bind(this)()
    return {
      url: '/api/v1/xpack/change-auth-plan/plan/',
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('xpack.Asset'), ['username', 'assets', 'nodes']],
        [this.$t('xpack.ChangeAuthPlan.PasswordStrategy'), ['is_password', 'password_strategy', 'password', 'password_rules']],
        [this.$t('xpack.ChangeAuthPlan.SecretKeyStrategy'), ['is_ssh_key', 'ssh_key_strategy', 'private_key', 'passphrase']],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['recipients', 'comment']]
      ],
      initial: {
        password_strategy: 'custom',
        ssh_key_strategy: 'add',
        is_periodic: true,
        is_password: true,
        is_ssh_key: false,
        password_rules: {
          length: 30
        },
        interval: 24
      },
      fieldsMeta: {
        username: fields.username,
        assets: fields.assets,
        password: fields.password,
        passphrase: fields.passphrase,
        password_rules: fields.asset_password_rules,
        private_key: fields.private_key,
        nodes: fields.nodes,
        is_periodic: fields.is_periodic,
        is_password: fields.is_password,
        is_ssh_key: fields.is_ssh_key,
        password_strategy: fields.password_strategy,
        ssh_key_strategy: fields.ssh_key_strategy,
        crontab: fields.crontab,
        interval: fields.interval,
        recipients: fields.recipients
      },
      createSuccessNextRoute: { name: 'ChangeAuthPlanIndex' },
      updateSuccessNextRoute: { name: 'ChangeAuthPlanIndex' },
      cleanFormValue(data) {
        if (data['password_strategy'] === 'custom') {
          delete data['password_rules']
        } else {
          delete data['password']
        }
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
