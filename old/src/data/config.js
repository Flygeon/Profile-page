// 下面按功能分组：内容数据、交互配置、展示板块。

const config = {
  // 音乐播放器歌单
  music: [
    {
      id: 471795,
      title: 'My Soul, Your Beats!',
      artist: 'Lia',
      cover: 'https://p1.music.126.net/2xc1ZXSTxNkW8u-c9Emdgw==/109951170245717432.jpg?param=130y130'
    },
    {
      id: 22826401,
      title: 'God knows...',
      artist: '平野綾',
      cover: 'https://p2.music.126.net/H8G-oFG_4z34t_qikgFvkQ==/109951172808538419.jpg?param=130y130'
    },
    {
      id: 22636730,
      title: '上海紅茶館 ～ Chinese Tea',
      artist: '上海アリス幻樂団',
      cover: 'https://p1.music.126.net/wH4AOqo0JfNL8tWaB1gdog==/109951166292308265.jpg?param=130y130'
    },
    {
      id: 3342981041,
      title: '铁花飞',
      artist: 'Mili / 塞壬唱片-MSR',
      cover: 'https://p1.music.126.net/rs9Ym-GZsrLXh1WgPpMPDw==/109951172642955222.jpg?param=130y130'
    },
    {
      id: 2053707223,
      title: '星座になれたら-Anime Ver.-',
      artist: '結束バンド',
      cover: 'https://p1.music.126.net/HrlPEWMvu0-KJGUx6U39Mw==/109951168663637537.jpg?param=130y130'
    }
  ],

  // 站内时间线（与 RSS 合并）
  timeline: [
    {
      id: 1,
      date: '2026-07-04',
      title: '个人导航页上线',
      desc: '使用 Svelte 的暗黑风格个人导航首页'
    }
  ],

  // 公告栏内容
  notices: [
      {
      id: 1,
      date: '2026-07-06',
      title: '新增公告栏功能',
      content: '在界面左侧新增公告栏组件，支持多条公告展示和查看全部功能。'
    },
    {
      id: 2,
      date: '2026-07-04',
      title: '个人导航页已上线',
      content: '欢迎体验全新设计的个人导航页面，集成了时间、日历、待办等实用小工具。'
    }
  ],

  // 待办事项
  todos: [
    { id: 1, text: '完成导航页开发', done: true },
    { id: 2, text: '时间线显示博客更新', done: true },
    { id: 3, text: '更新导航页介绍视频', done: false }
  ],

  // 外链跳转过渡动画
  linkTransition: {
    enabled: true,
    delayMs: 1000,
    particleCount: 24
  },

  // 设备展示区
  devices: {
    categories: [
      {
        devices: [
          {
            brand: 'Microsoft',
            model: 'Surface Pro 5',
            features: '微软亲儿子，触屏和2K很爽，喜欢，即使它并不好用',
            specs: {
              '处理器': 'Intel Core i5-7300U',
              '内存': '8GB LPDDR3',
              '存储': '128GB SSD',
              '显卡': 'Intel HD Graphics 620',
              '显示器': 'LG'
            },
            usage: '日常开发主力机，由于本人穷b只能凑合用这个'
          }
        ]
      },
      {
        devices: [
          {
            brand: 'Apple',
            model: 'iPhone XR',
            features: '传奇钉子户，传家宝凑活能用',
            specs: {
              '处理器': 'A12 Pro',
              '屏幕': '6.1寸 Liquid Retina LCD 1792×828',
              '存储': '128GB',
              '系统': 'iOS 18.3'
            },
            usage: '日用需要'
          }
        ]
      },
      {
        devices: [
          {
            brand: 'CUKTECH',
            model: 'CP25',
            features: '酷态科真好用吧，贵是贵了点',
            specs: {
              '容量': '20000mAh',
              '功率': '55W MAX',
              '接口': '2C1A + 自带USB-C线',
              '协议': 'PD3.1/QC5/PPS/UFCS'
            },
            usage: '给我的电脑和散热器供电，外出也可以应急，就是重了点只能塞包里'
          }
        ]
      }
    ]
  },

  // 技能展示区
  skills: {
    categories: [
      {
        name: '前端技术',
        icon: 'fa-solid fa-code',
        skills: [
          { name: 'HTML / CSS', level: 'advanced' },
          { name: 'Astro', level: 'intermediate' },
          { name: 'Svelte', level: 'intermediate' },
          { name: 'JavaScript', level: 'beginner' },
          { name: 'Vue', level: 'beginner' }
        ]
      },
      {
        name: '后端 & 工具',
        icon: 'fa-solid fa-server',
        skills: [
          { name: 'Git', level: 'advanced' },
          { name: 'Node.js', level: 'intermediate' },
          { name: 'Python', level: 'intermediate' },
          { name: 'Docker', level: 'intermediate' },
          { name: 'Linux', level: 'intermediate' }
        ]
      },
      {
        name: '创意工具',
        icon: 'fa-solid fa-palette',
        skills: [
          { name: 'Vocaloid 调教', level: 'advanced' },
          { name: '视频剪辑', level: 'intermediate' },
          { name: 'MMD / 3D 动画', level: 'beginner' },
          { name: '音频混音', level: 'beginner' }
        ]
      },
      {
        name: '语言能力',
        icon: 'fa-solid fa-language',
        skills: [
          { name: '中文', level: 'advanced' },
          { name: 'English', level: 'intermediate' },
          { name: '日本語', level: 'beginner' }
        ]
      }
    ]
  }
}

export default config
