import i18n from '@/i18n/i18n'

export const gcp = 'gcp'
export const aliyun = 'aliyun'
export const baiducloud = 'baiducloud'
export const jdcloud = 'jdcloud'
export const kingsoftcloud = 'kingsoftcloud'
export const aws_international = 'aws_international'
export const aws_china = 'aws_china'
export const huaweicloud = 'huaweicloud'
export const qcloud = 'qcloud'
export const qcloud_lighthouse = 'qcloud_lighthouse'
export const azure = 'azure'
export const azure_international = 'azure_international'
export const ucloud = 'ucloud'

export const qingcloud_private = 'qingcloud_private'
export const huaweicloud_private = 'huaweicloud_private'
export const ctyun_private = 'ctyun_private'
export const openstack = 'openstack'
export const nutanix = 'nutanix'
export const vmware = 'vmware'
export const fc = 'fc'
export const lan = 'lan'

export const ACCOUNT_PROVIDER_ATTRS_MAP = {
  [aliyun]: {
    name: aliyun,
    title: i18n.t('xpack.Cloud.Aliyun'),
    attrs: ['access_key_id', 'access_key_secret']
  },
  [aws_international]: {
    name: aws_international,
    title: i18n.t('xpack.Cloud.AWS_Int'),
    attrs: ['access_key_id', 'access_key_secret']
  },
  [aws_china]: {
    name: aws_china,
    title: i18n.t('xpack.Cloud.AWS_China'),
    attrs: ['access_key_id', 'access_key_secret']
  },
  [huaweicloud]: {
    name: huaweicloud,
    title: i18n.t('xpack.Cloud.HuaweiCloud'),
    attrs: ['access_key_id', 'access_key_secret']
  },
  [baiducloud]: {
    name: baiducloud,
    title: i18n.t('xpack.Cloud.BaiduCloud'),
    attrs: ['access_key_id', 'access_key_secret']
  },
  [jdcloud]: {
    name: jdcloud,
    title: i18n.t('xpack.Cloud.JDCloud'),
    attrs: ['access_key_id', 'access_key_secret']
  },
  [kingsoftcloud]: {
    name: kingsoftcloud,
    title: i18n.t('xpack.Cloud.KingSoftCloud'),
    attrs: ['access_key_id', 'access_key_secret']
  },
  [qcloud]: {
    name: qcloud,
    title: i18n.t('xpack.Cloud.Qcloud'),
    attrs: ['access_key_id', 'access_key_secret']
  },
  [qcloud_lighthouse]: {
    name: qcloud_lighthouse,
    title: i18n.t('xpack.Cloud.QcloudLighthouse'),
    attrs: ['access_key_id', 'access_key_secret']
  },
  [azure]: {
    name: azure,
    title: i18n.t('xpack.Cloud.Azure'),
    attrs: ['client_id', 'client_secret', 'tenant_id', 'subscription_id']
  },
  [azure_international]: {
    name: azure_international,
    title: i18n.t('xpack.Cloud.Azure_Int'),
    attrs: ['client_id', 'client_secret', 'tenant_id', 'subscription_id']
  },
  [gcp]: {
    name: gcp,
    title: i18n.t('xpack.Cloud.GCP'),
    attrs: ['service_account_key']
  },
  [ucloud]: {
    name: ucloud,
    title: i18n.t('xpack.Cloud.UCloud'),
    attrs: ['base_url', 'public_key', 'private_key', 'project']
  },
  [vmware]: {
    name: vmware,
    title: 'VMware',
    attrs: ['host', 'port', 'username', 'password']
  },
  [nutanix]: {
    name: nutanix,
    title: 'Nutanix',
    attrs: ['access_key_id', 'access_key_secret', 'api_endpoint']
  },
  [qingcloud_private]: {
    name: qingcloud_private,
    title: i18n.t('xpack.Cloud.QingyunPrivatecloud'),
    attrs: ['access_key_id', 'access_key_secret', 'api_endpoint']
  },
  [huaweicloud_private]: {
    name: huaweicloud_private,
    title: i18n.t('xpack.Cloud.HuaweiPrivatecloud'),
    attrs: ['sc_username', 'sc_password', 'domain_name', 'oc_username', 'oc_password', 'api_endpoint']
  },
  [openstack]: {
    name: openstack,
    title: i18n.t('xpack.Cloud.OpenStack'),
    attrs: ['auth_url', 'user_domain_name', 'username', 'password']
  },
  [fc]: {
    name: fc,
    title: i18n.t('xpack.Cloud.FC'),
    attrs: ['api_endpoint', 'username', 'password']
  },
  [ctyun_private]: {
    name: ctyun_private,
    title: i18n.t('xpack.Cloud.CTYunPrivate'),
    attrs: ['access_key_id', 'access_key_secret', 'api_endpoint', 'cert_file', 'key_file']
  },
  [lan]: {
    name: lan,
    title: i18n.t('xpack.Cloud.LAN'),
    attrs: ['ip_group', 'test_port', 'test_timeout', 'hostname_prefix']
  }
}
