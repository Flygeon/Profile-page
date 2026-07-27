import { BookOpen, Code2, Compass, Dice5, FileText, Image, Link2, Lock, MessagesSquare, Palette, Sparkles, Tv, type LucideIcon } from 'lucide-react'

export interface HomeNavItem {
  name: string
  href: string
  icon: LucideIcon
  isNew?: boolean
  external?: boolean
}

export interface HomeToolItem {
  name: string
  description: string
  href: string
  icon: LucideIcon
}

export interface HomeExploreItem {
  name: string
  description: string
  href: string
  icon: LucideIcon
  external: boolean
}

export const navItems: HomeNavItem[] = [
  { name: '博客', href: '/posts', icon: BookOpen },
  { name: '导航', href: '/nav', icon: Compass, isNew: true },
  { name: '留言', href: '/guestbook', icon: MessagesSquare, isNew: true },
  { name: '追番', href: 'https://flygeon.top/bangumi/', icon: Tv, external: true },
  { name: '友链', href: 'https://flygeon.top/friends/', icon: Link2, external: true },
]

export const toolItems: HomeToolItem[] = [
  { name: '图片转换', description: '粘贴或上传图片，在 PNG、JPG 与 WebP 之间快速转换。', icon: Image, href: '/convert' },
  { name: 'Markdown预览', description: '使用示例文档、分屏编辑与实时预览完成内容排版。', icon: FileText, href: '/md' },
  { name: '随机抽签', description: '从预设场景或自定义选项中随机抽取一个结果。', icon: Dice5, href: '/lottery' },
  { name: '今日运势', description: '每日一签，查看今日运势、幸运数字、幸运色与宜忌。', icon: Sparkles, href: '/fortune' },
  { name: '文本加解密', description: '提供口令加密、Base64 与兽音译者三种处理方式。', icon: Lock, href: '/cipher' },
  { name: '颜色工具', description: 'HEX、RGB、HSL 互转，并检测文字对比度是否达标。', icon: Palette, href: '/color' },
]

export const exploreItems: HomeExploreItem[] = [
  { name: '技术博客', description: '阅读技术记录、开发笔记和近期文章', href: '/posts', icon: BookOpen, external: false },
  { name: '我的导航', description: '配置化个人导航站，收藏常用站点', href: '/nav', icon: Compass, external: false },
  { name: '留言板', description: '留下你的想法、建议或一句问候', href: '/guestbook', icon: MessagesSquare, external: false },
  { name: '追番记录', description: '查看正在追看与已经完成的动画作品', href: 'https://flygeon.top/bangumi/', icon: Tv, external: true },
  { name: '友情链接', description: '发现更多有趣的个人站点与创作者', href: 'https://flygeon.top/friends/', icon: Link2, external: true },
  { name: 'GitHub', description: '查看开源项目、代码仓库与开发动态', href: 'https://github.com/Flygeon', icon: Code2, external: true },
]

export const homeTags = ['技术博客', '实用在线工具集']
