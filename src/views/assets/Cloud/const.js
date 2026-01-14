import i18n from '@/i18n/i18n'
import { encryptPassword } from '@/utils/secure'

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

export const volcengine = 'volcengine'

export const ctyun = 'ctyun'

export const qingcloud_private = 'qingcloud_private'
export const huaweicloud_private = 'huaweicloud_private'
export const ctyun_private = 'ctyun_private'
export const openstack = 'openstack'
export const zstack = 'zstack'
export const nutanix = 'nutanix'
export const vmware = 'vmware'
export const fc = 'fc'
export const scp = 'scp'
export const apsara_stack = 'apsara_stack'
export const proxmox = 'proxmox'
export const lan = 'lan'
export const smartx = 'smartx'

export const publicHostProviders = [
  aliyun,
  qcloud,
  qcloud_lighthouse,
  huaweicloud,
  baiducloud,
  jdcloud,
  kingsoftcloud,
  aws_china,
  aws_international,
  azure,
  azure_international,
  gcp,
  ucloud,
  volcengine,
  smartx,
  ctyun
]

export const publicDBProviders = [aliyun]

export const privateCloudProviders = [
  vmware, qingcloud_private, huaweicloud_private, ctyun_private,
  openstack, zstack, nutanix, fc, scp, apsara_stack, smartx, proxmox
]

export const ACCOUNT_PROVIDER_ATTRS_MAP = {
  [aliyun]: {
    name: aliyun,
    title: i18n.t('Aliyun'),
    attrs: ['access_key_id', 'access_key_secret'],
    image: require('@/assets/img/cloud/ali.svg')
  },
  [aws_international]: {
    name: aws_international,
    title: i18n.t('AWS_Int'),
    attrs: ['access_key_id', 'access_key_secret'],
    image: require('@/assets/img/cloud/aws_international.svg')
  },
  [aws_china]: {
    name: aws_china,
    title: i18n.t('AWS_China'),
    attrs: ['access_key_id', 'access_key_secret'],
    image: require('@/assets/img/cloud/aws_china.svg')
  },
  [huaweicloud]: {
    name: huaweicloud,
    title: i18n.t('HuaweiCloud'),
    attrs: ['access_key_id', 'access_key_secret'],
    image: require('@/assets/img/cloud/huawei.svg')
  },
  [baiducloud]: {
    name: baiducloud,
    title: i18n.t('BaiduCloud'),
    attrs: ['access_key_id', 'access_key_secret'],
    image: require('@/assets/img/cloud/baidu.svg')
  },
  [jdcloud]: {
    name: jdcloud,
    title: i18n.t('JDCloud'),
    attrs: ['access_key_id', 'access_key_secret'],
    image: require('@/assets/img/cloud/jd.svg')
  },
  [kingsoftcloud]: {
    name: kingsoftcloud,
    title: i18n.t('KingSoftCloud'),
    attrs: ['access_key_id', 'access_key_secret'],
    image: require('@/assets/img/cloud/kingsoft.svg')
  },
  [qcloud]: {
    name: qcloud,
    title: i18n.t('Qcloud'),
    attrs: ['access_key_id', 'access_key_secret'],
    image: require('@/assets/img/cloud/qcloud.svg')
  },
  [qcloud_lighthouse]: {
    name: qcloud_lighthouse,
    title: i18n.t('QcloudLighthouse'),
    attrs: ['access_key_id', 'access_key_secret'],
    image: require('@/assets/img/cloud/qcloud_lighthouse.svg')
  },
  [azure]: {
    name: azure,
    title: i18n.t('Azure'),
    attrs: ['client_id', 'client_secret', 'tenant_id', 'subscription_id'],
    image: require('@/assets/img/cloud/azure_china.svg')
  },
  [azure_international]: {
    name: azure_international,
    title: i18n.t('Azure_Int'),
    attrs: ['client_id', 'client_secret', 'tenant_id', 'subscription_id'],
    image: require('@/assets/img/cloud/azure_international.svg')
  },
  [gcp]: {
    name: gcp,
    title: i18n.t('GCP'),
    attrs: ['service_account_key'],
    image: require('@/assets/img/cloud/gcp.svg')
  },
  [ucloud]: {
    name: ucloud,
    title: i18n.t('UCloud'),
    attrs: ['base_url', 'public_key', 'private_key', 'project'],
    image: require('@/assets/img/cloud/ucloud.svg')
  },
  [volcengine]: {
    name: volcengine,
    title: i18n.t('Volcengine'),
    attrs: ['access_key_id', 'access_key_secret'],
    image: require('@/assets/img/cloud/volcengine.svg')
  },
  [ctyun]: {
    name: ctyun,
    title: i18n.t('CTYun'),
    attrs: ['access_key_id', 'access_key_secret', 'project_id'],
    image: require('@/assets/img/cloud/state.svg')
  },
  [vmware]: {
    name: vmware,
    title: 'VMware',
    attrs: ['host', 'port', 'username', 'password', 'auto_sync_node'],
    image: require('@/assets/img/cloud/vmware.svg')
  },
  [nutanix]: {
    name: nutanix,
    title: 'Nutanix',
    attrs: ['access_key_id', 'access_key_secret', 'api_endpoint'],
    image: require('@/assets/img/cloud/nutanix.svg')
  },
  [qingcloud_private]: {
    name: qingcloud_private,
    title: i18n.t('QingYunPrivateCloud'),
    attrs: ['access_key_id', 'access_key_secret', 'api_endpoint'],
    image: require('@/assets/img/cloud/qing.svg')
  },
  [huaweicloud_private]: {
    name: huaweicloud_private,
    title: i18n.t('HuaweiPrivateCloud'),
    attrs: [
      'sc_username',
      'sc_password',
      'domain_name',
      'oc_username',
      'oc_password',
      'api_endpoint'
    ],
    image: require('@/assets/img/cloud/huawei.svg')
  },
  [openstack]: {
    name: openstack,
    title: i18n.t('OpenStack'),
    attrs: ['auth_url', 'user_domain_name', 'username', 'password'],
    image: require('@/assets/img/cloud/openstack.svg')
  },
  [zstack]: {
    name: zstack,
    title: i18n.t('ZStack'),
    attrs: ['access_key_id', 'access_key_secret', 'api_endpoint'],
    image: require('@/assets/img/cloud/zstack.svg')
  },
  [smartx]: {
    name: smartx,
    title: i18n.t('SmartX CloudTower'),
    attrs: ['username', 'password', 'api_endpoint'],
    image: require('@/assets/img/cloud/smartx.svg')
  },
  [fc]: {
    name: fc,
    title: i18n.t('FC'),
    attrs: ['api_endpoint', 'username', 'password'],
    image: require('@/assets/img/cloud/huawei.svg')
  },
  [ctyun_private]: {
    name: ctyun_private,
    title: i18n.t('CTYunPrivate'),
    attrs: ['access_key_id', 'access_key_secret', 'api_endpoint', 'cert_file', 'key_file'],
    image: require('@/assets/img/cloud/state.svg')
  },
  [scp]: {
    name: scp,
    title: i18n.t('SCP'),
    attrs: ['access_key_id', 'access_key_secret', 'api_endpoint'],
    image: require('@/assets/img/cloud/scp.svg')
  },
  [apsara_stack]: {
    name: apsara_stack,
    title: i18n.t('ApsaraStack'),
    attrs: ['access_key_id', 'access_key_secret', 'api_endpoint'],
    image: require('@/assets/img/cloud/ali.svg')
  },
  [proxmox]: {
    name: proxmox,
    title: i18n.t('Proxmox'),
    attrs: ['username', 'password', 'api_endpoint'],
    image: require('@/assets/img/cloud/proxmox.svg')
  },
  [lan]: {
    name: lan,
    title: i18n.t('LAN'),
    attrs: ['ip_group', 'test_port', 'test_timeout', 'hostname_prefix'],
    image: require('@/assets/img/cloud/lan.svg'),
    imageCSS: {}
  }
}

export function encryptAttrsField(attrs) {
  const encryptedFields = [
    'access_key_secret',
    'password',
    'client_secret',
    'oc_password',
    'sc_password'
  ]
  for (const item of encryptedFields) {
    const value = attrs[item]
    if (!value) {
      continue
    }
    attrs[item] = encryptPassword(value)
  }
  return attrs
}
