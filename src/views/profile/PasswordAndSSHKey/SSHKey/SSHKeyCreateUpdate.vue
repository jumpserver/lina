<template>
  <GenericCreateUpdatePage v-if="!loading" v-bind="$data" :after-get-form-value="afterGetFormValue" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage/index.vue'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      loading: true,
      url: '/api/v1/authentication/ssh-key/',
      fields: [
        'name',
        'current_public_key',
        'public_key',
        'is_active'
      ],
      fieldsMeta: {
        name: {},
        public_key: {
          label: this.$t('NewPublicKey'),
          el: {
            type: 'textarea',
            placeholder: 'ssh-rsa AAAA...',
            autosize: { minRows: 3 }
          }
        },
        current_public_key: {
          hidden: () => {
            return this.$route?.meta.action === 'create'
          },
          disabled: true,
          label: this.$t('OldPublicKey')
        }
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.loading = false
    })
  },
  methods: {
    afterGetFormValue(value) {
      const publicKey = value['public_key_hash_md5'] ? `${value['public_key_comment']} (${value['public_key_hash_md5']})` : ' '
      value['current_public_key'] = publicKey
      return value
    }
  }
}
</script>

<style>

</style>
