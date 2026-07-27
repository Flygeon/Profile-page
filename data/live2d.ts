// ============================================================
//  Live2D 看板娘配置（框架已就绪，默认关闭）
//
//  接入步骤：
//  1. 准备模型：找一个 Live2D 模型的 model3.json / model.json 直链。
//     常用免费模型仓库（任选）：
//     - https://github.com/oh-my-live2d/live2d-models
//     - https://github.com/Eikanya/Live2d-model
//     可将模型文件放到本项目 public/live2d/ 下用相对路径（推荐，
//     不依赖第三方 CDN），例如 '/live2d/hiyori/hiyori.model3.json'
//  2. runtimeUrl 保持默认（unpkg 的 oh-my-live2d ESM 构建）即可；
//     内网/自部署可改为自托管地址
//  3. 把 enabled 改为 true，models 里填一个或多个模型路径
//     （多个时看板娘菜单的「换一个」按钮可循环切换）
//  4. 按需调整 greetings（点「打招呼」时随机弹出的话）与尺寸/位置
//  5. 保存后刷新首页；右下菜单「收起」会记住状态（localStorage），
//     收起后左下角有幽灵按钮可重新召唤
//
//  说明：运行时脚本在浏览器端从 runtimeUrl 动态加载，不参与打包，
//  enabled=false 时零开销。
// ============================================================

export const live2dConfig = {
  enabled: true,

  // 模型 model3.json / model.json 地址列表，支持多个（菜单可切换）
  models: ['/live2d/AnAn/AnAn-model.model3.json'] as string[],

  // 舞台位置与尺寸
  position: 'left' as 'left' | 'right',
  width: 320,
  height: 320,

  // 移动端隐藏（小屏遮挡内容且性能差）
  hideOnMobile: true,

  // 点击「打招呼」随机弹出的台词
  greetings: [
    '你好呀，欢迎来到 flygeon 的小站！',
    '今天也要元气满满哦～',
    '要不要听听现在播放的音乐？',
    '试试输入 ↑↑↓↓←→←→BA 会发生什么？',
  ],
}
