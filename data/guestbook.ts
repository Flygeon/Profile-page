// ============================================================
//  留言板配置（giscus —— 基于 GitHub Discussions，纯前端、无后端）
//
//  接入步骤（约 3 分钟）：
//  1. 建一个公开 GitHub 仓库（或用现有仓库），在仓库 Settings → General
//     → Features 勾选 Discussions
//  2. 安装 giscus App：https://github.com/apps/giscus （授权该仓库）
//  3. 打开 https://giscus.app ，填入仓库名，选择映射方式（推荐
//     「Discussion 标题包含页面 pathname」）与分类（推荐 Announcements），
//     页面下方会生成一段 <script>，把其中的 data-repo / data-repo-id /
//     data-category / data-category-id 四个值抄到下面
//  4. 保存后访问 /guestbook 即可
// ============================================================

export const guestbookConfig = {
  repo: 'Flygeon/Profile-page',          // 例如 'Flygeon/blog-comments'
  repoId: 'R_kgDOTNX4VQ',        // 例如 'R_kgDOxxxxxx'
  category: 'Announcements',      // 例如 'Announcements'
  categoryId: 'DIC_kwDOTNX4Vc4DCC-6',    // 例如 'DIC_kwDOxxxxxx'
}

export const guestbookEnabled = Boolean(
  guestbookConfig.repo && guestbookConfig.repoId && guestbookConfig.category && guestbookConfig.categoryId,
)
