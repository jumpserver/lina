<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :fields-meta="fieldsMeta"
      :initial="object"
      :url="url"
      :get-method="getMethod"
      :more-buttons="moreButtons"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'

export default {
  name: 'SSHUpdate',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  props: {
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      url: '/api/v1/users/profile/public-key/',
      fields: [
        ['原来SSH公钥', ['public_key_comment', 'public_key_hash_md5']],
        ['更新SSH公钥', ['public_key']]
      ],
      fieldsMeta: {
        public_key_comment: {
          label: '名称',
          disabled: true
        },
        public_key_hash_md5: {
          label: '指纹',
          disabled: true
        },
        public_key: {
          el: {
            type: 'textarea',
            placeholder: 'ssh-rsa AAAA...'
          },
          helpText: '复制你的公钥到这里'
        }
      },
      moreButtons: [
        {
          title: '重置并下载密钥',
          callback: function() {
            window.open(`/users/profile/pubkey/generate/`, '_blank')
          }
        }
      ]
    }
  },
  methods: {
    getMethod() {
      return 'put'
    }
  }
}
</script>

<style scoped>

</style>
