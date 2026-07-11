<script>
  import config from '../data/config.js'

  const levelConfig = {
    'beginner':     { label: '入门',   barWidth: '30%',  color: '#888888', bg: 'rgba(136,136,136,0.12)' },
    'intermediate': { label: '熟练',   barWidth: '55%',  color: '#bbbbbb', bg: 'rgba(187,187,187,0.12)' },
    'advanced':     { label: '精通',   barWidth: '85%',  color: '#ffffff', bg: 'rgba(255,255,255,0.12)' }
  }
</script>

<section class="skills-section">
  <div class="section-header">
    <i class="fa-solid fa-code"></i>
    <span>我的能力</span>
  </div>

  <div class="skills-grid">
    {#each config.skills.categories as category}
      <div class="skill-category-card">
        <div class="category-header">
          <i class={category.icon}></i>
          <span>{category.name}</span>
          <span class="skill-count">{category.skills.length}</span>
        </div>
        <div class="skill-list">
          {#each category.skills as skill}
            <div class="skill-item">
              <div class="skill-info">
                <span class="skill-name">{skill.name}</span>
                <span
                  class="level-badge"
                  style="--color: {levelConfig[skill.level].color}"
                >
                  {levelConfig[skill.level].label}
                </span>
              </div>
              <div class="skill-bar-bg" style="background: {levelConfig[skill.level].bg}">
                <div
                  class="skill-bar-fill"
                  style="width: {levelConfig[skill.level].barWidth}; background: {levelConfig[skill.level].color}"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  .skills-section {
    width: 100%;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 14px;
    padding-left: 2px;
  }

  .section-header i {
    font-size: 14px;
    color: #888888;
  }

  .skills-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skill-category-card {
    background-color: rgba(26, 26, 26, 0.55);
    border: 1px solid #2a2a2a;
    border-radius: 14px;
    padding: 18px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid #2a2a2a;
  }

  .category-header i {
    font-size: 13px;
    color: #888888;
  }

  .skill-count {
    margin-left: auto;
    font-size: 11px;
    color: #555555;
    background: #1a1a1a;
    padding: 2px 8px;
    border-radius: 10px;
  }

  .skill-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .skill-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .skill-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .skill-name {
    font-size: 13px;
    color: #cccccc;
  }

  .level-badge {
    font-size: 10px;
    padding: 2px 10px;
    border-radius: 10px;
    border: 1px solid var(--color);
    background: transparent;
    color: var(--color);
    cursor: default;
  }

  .skill-bar-bg {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    overflow: hidden;
  }

  .skill-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (max-width: 768px) {
    .skill-category-card {
      padding: 14px;
    }

    .skill-name {
      font-size: 12px;
    }
  }
</style>
