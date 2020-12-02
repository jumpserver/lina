// import i18n from '@/i18n/i18n'
// import router from '@/router'

import router from '@/router'

export const LINUX = [
  {
    name: `ssh`,
    title: `ssh`,
    divided: false,
    type: 'primary',
    has: true,
    callback: function() { router.push({ name: 'SSHSystemUserCreate' }) }
  },
  {
    name: `telnet`,
    title: `telnet`,
    divided: false,
    type: 'primary',
    has: true,
    callback: function() { router.push({ name: 'TelnetSystemUserCreate' }) }
  }
]

export const WINDOWS = [
  {
    name: `rdp`,
    title: `rdp`,
    divided: true,
    type: 'primary',
    has: true,
    callback: function() { router.push({ name: 'RDPSystemUserCreate' }) }
  },
  {
    name: `vnc`,
    title: `vnc`,
    divided: false,
    type: 'primary',
    has: true,
    callback: function() { router.push({ name: 'VNCSystemUserCreate' }) }
  }
]

export const SystemUserTypes = [
  ...LINUX, ...WINDOWS
]
