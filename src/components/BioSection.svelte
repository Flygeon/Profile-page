<section class="bio-section">
  <div class="card">
    <div class="bio-content">
      <p class="bio-text">
        你好，我是 Flygeon，一名热爱技术与设计的开发者。
      </p>
      <p class="bio-text">
        喜欢折腾各种有趣的项目，专注于前端开发、UI 设计与全栈工程。
        在这里你可以找到我的作品、工具和服务入口。
      </p>
      <div class="bio-tags">
        <span class="tag">前端开发</span>
        <span class="tag">UI 设计</span>
        <span class="tag">全栈工程</span>
        <span class="tag">开源爱好者</span>
      </div>
    </div>
  </div>
</section>

<style>
  .bio-section {
    width: 100%;
  }

  .card {
    background-color: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    padding: 24px;
  }

  .bio-content {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .bio-text {
    font-size: 14px;
    line-height: 1.8;
    color: #cccccc;
    margin: 0;
  }

  .bio-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
  }

  .tag {
    display: inline-block;
    padding: 5px 14px;
    background-color: #111111;
    border: 1px solid #333333;
    border-radius: 999px;
    color: #aaaaaa;
    font-size: 12px;
    transition: all 0.25s ease-in-out;
  }

  .tag:hover {
    background-color: #222222;
    border-color: #555555;
    color: #ffffff;
  }

  @media (max-width: 768px) {
    .card {
      padding: 18px;
    }

    .bio-text {
      font-size: 13px;
    }

    .tag {
      padding: 4px 12px;
      font-size: 11px;
    }
  }
</style>
