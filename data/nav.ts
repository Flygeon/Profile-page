// ============================================================
//  个人导航站配置 —— 编辑本文件即可打造属于你自己的导航站
//  页面地址：/nav
//
//  用法：
//  1. 修改 navConfig.title / subtitle 为你的站点标题与简介
//  2. 在 groups 里增删分组；每个分组有 id（锚点，用英文）、name、可选 icon
//  3. 每个分组的 links 里增删链接：name（名称）、url（地址）、desc（简介，可选）、icon（可选）
//  4. 图标从 lucide-react 里挑一个导入并填入；不填则自动用名称首字生成徽标
//  5. 保存后访问 /nav 即可看到效果，分享该链接给他人
// ============================================================

import {
  Star, Globe, Code2, Palette, BookOpen, Film, Music2, Cloud,
  Newspaper, GraduationCap, Gamepad2, MessageCircle, Search, Box,
  type LucideIcon,
} from 'lucide-react'

export interface NavLink {
  name: string
  url: string
  desc?: string
  icon?: LucideIcon
}

export interface NavGroup {
  id: string          // 英文锚点，用于分类跳转，需唯一
  name: string
  icon?: LucideIcon
  links: NavLink[]
}

export interface NavConfig {
  title: string
  subtitle: string
  groups: NavGroup[]
}

export const navConfig: NavConfig = {
  title: '我的导航',
  subtitle: '一个用配置文件生成的个人导航站，收藏常用站点，随时分享。',
  groups: [
    {
      id: 'daily',
      name: '常用',
      icon: Star,
      links: [
        { name: 'Google', url: 'https://www.google.com', desc: '搜索引擎', icon: Search },
        { name: 'GitHub', url: 'https://github.com', desc: '代码托管与开源社区', icon: Globe },
        { name: 'flygeon', url: 'https://flygeon.top', desc: '我的博客', icon: BookOpen },
      ],
    },
    {
      id: 'dev',
      name: '开发',
      icon: Code2,
      links: [
        { name: 'MDN', url: 'https://developer.mozilla.org', desc: 'Web 开发文档', icon: BookOpen },
        { name: 'Stack Overflow', url: 'https://stackoverflow.com', desc: '技术问答', icon: MessageCircle },
        { name: 'npm', url: 'https://www.npmjs.com', desc: 'JavaScript 包仓库', icon: Box },
        { name: 'Can I use', url: 'https://caniuse.com', desc: '浏览器兼容性查询', icon: Code2 },
      ],
    },
    {
      id: 'design',
      name: '设计',
      icon: Palette,
      links: [
        { name: 'Dribbble', url: 'https://dribbble.com', desc: '设计灵感', icon: Palette },
        { name: 'Lucide', url: 'https://lucide.dev', desc: '开源图标库', icon: Star },
      ],
    },
    {
      id: 'media',
      name: '影音',
      icon: Film,
      links: [
        { name: 'YouTube', url: 'https://www.youtube.com', desc: '视频', icon: Film },
        { name: 'Bilibili', url: 'https://www.bilibili.com', desc: '弹幕视频', icon: Film },
        { name: '网易云音乐', url: 'https://music.163.com', desc: '在线音乐', icon: Music2 },
      ],
    },
    {
      id: 'learn',
      name: '学习',
      icon: GraduationCap,
      links: [
        { name: 'Coursera', url: 'https://www.coursera.org', desc: '在线课程', icon: GraduationCap },
        { name: '少数派', url: 'https://sspai.com', desc: '数字生活与效率', icon: Newspaper },
      ],
    },
    {
      id: 'fun',
      name: '娱乐',
      icon: Gamepad2,
      links: [
        { name: 'Steam', url: 'https://store.steampowered.com', desc: '游戏平台', icon: Gamepad2 },
        { name: 'Cloudflare', url: 'https://www.cloudflare.com', desc: 'CDN 与网络服务', icon: Cloud },
      ],
    },
  ],
}
