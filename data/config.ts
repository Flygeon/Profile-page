import { Code2, Server, Palette, Languages, type LucideIcon } from 'lucide-react'

export interface MusicItem {
  id: number
  title: string
  artist: string
  cover: string
}

export interface TimelineItem {
  id: number
  date: string
  title: string
  desc: string
}

export interface NoticeItem {
  id: number
  date: string
  title: string
  content: string
}

export interface TodoItem {
  id: number
  text: string
  done: boolean
}

export interface Device {
  brand: string
  model: string
  features: string
  specs: Record<string, string>
  usage: string
}

export interface DeviceCategory {
  devices: Device[]
}

export interface Skill {
  name: string
  level: 'advanced' | 'intermediate' | 'beginner'
}

export interface SkillCategory {
  name: string
  icon: LucideIcon
  skills: Skill[]
}

export interface LinkTransitionConfig {
  enabled: boolean
  delayMs: number
  particleCount: number
}

export interface FortuneLevel {
  /** 运势等级名称，如「大吉」 */
  label: string
  /** 权重，数值越大越容易抽到 */
  weight: number
  /** 白色文字的亮度（0-1），越高表示越吉利 */
  tone: number
}

export interface FortuneConfig {
  levels: FortuneLevel[]
  /** 幸运色候选（纯文字内容，不影响界面配色） */
  colors: string[]
  /** 「宜」候选事项 */
  good: string[]
  /** 「忌」候选事项 */
  bad: string[]
  /** 签语候选 */
  blessings: string[]
}

export const config = {
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
  ] as MusicItem[],

  timeline: [
    {
      id: 1,
      date: '2026-07-04',
      title: '个人导航页上线',
      desc: '使用 Svelte 的暗黑风格个人导航首页'
    }
  ] as TimelineItem[],

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
  ] as NoticeItem[],

  todos: [
    { id: 1, text: '完成导航页开发', done: true },
    { id: 2, text: '时间线显示博客更新', done: true },
    { id: 3, text: '更新导航页介绍视频', done: false }
  ] as TodoItem[],

  linkTransition: {
    enabled: true,
    delayMs: 1000,
    particleCount: 24
  } as LinkTransitionConfig,

  fortune: {
    // 权重之和决定概率分布，越靠前越吉；tone 控制文字亮度（越亮越吉）
    levels: [
      { label: '大吉', weight: 3, tone: 1 },
      { label: '中吉', weight: 6, tone: 0.9 },
      { label: '小吉', weight: 8, tone: 0.8 },
      { label: '吉', weight: 8, tone: 0.72 },
      { label: '末吉', weight: 6, tone: 0.6 },
      { label: '凶', weight: 3, tone: 0.42 }
    ],
    colors: ['月白', '黛蓝', '霜灰', '墨黑', '缃色', '藕荷', '绯红', '竹青', '鸦青', '素银'],
    good: [
      '写代码', '读书', '听歌', '早睡', '出门走走', '整理房间',
      '联系老友', '尝试新事物', '喝奶茶', '追番', '备份数据', '重构旧项目'
    ],
    bad: [
      '熬夜', '拖延', '冲动消费', '硬刚 Bug', '空腹敲代码', '过度刷手机',
      '和产品经理争论', '强行上线', '省略测试', '深夜 emo', '乱删文件', '不写注释'
    ],
    blessings: [
      '所求皆如愿，所行皆坦途。',
      '今日宜静心，编译一次即过。',
      '风起于青萍之末，好运正在路上。',
      '慢一点没关系，方向对就好。',
      '未提交的代码，终会遇到它的 commit。',
      '愿你今日的报错都有清晰的堆栈。',
      '星光不问赶路人，时光不负有心人。',
      '心之所向，素履以往。'
    ]
  } as FortuneConfig,

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
    ] as DeviceCategory[]
  },

  skills: {
    categories: [
      {
        name: '前端技术',
        icon: Code2,
        skills: [
          { name: 'HTML / CSS', level: 'advanced' as const },
          { name: 'Astro', level: 'intermediate' as const },
          { name: 'Svelte', level: 'intermediate' as const },
          { name: 'JavaScript', level: 'beginner' as const },
          { name: 'Vue', level: 'beginner' as const }
        ]
      },
      {
        name: '后端 & 工具',
        icon: Server,
        skills: [
          { name: 'Git', level: 'advanced' as const },
          { name: 'Node.js', level: 'intermediate' as const },
          { name: 'Python', level: 'intermediate' as const },
          { name: 'Docker', level: 'intermediate' as const },
          { name: 'Linux', level: 'intermediate' as const }
        ]
      },
      {
        name: '创意工具',
        icon: Palette,
        skills: [
          { name: 'Vocaloid 调教', level: 'advanced' as const },
          { name: '视频剪辑', level: 'intermediate' as const },
          { name: 'MMD / 3D 动画', level: 'beginner' as const },
          { name: '音频混音', level: 'beginner' as const }
        ]
      },
      {
        name: '语言能力',
        icon: Languages,
        skills: [
          { name: '中文', level: 'advanced' as const },
          { name: 'English', level: 'intermediate' as const },
          { name: '日本語', level: 'beginner' as const }
        ]
      }
    ] as SkillCategory[]
  }
}

export const SITE_START = new Date(2026, 6, 4)
