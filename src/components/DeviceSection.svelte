<script>
  import devices from '../data/devices.json'
</script>

<section class="device-section">
  <div class="devices-grid">
    {#each devices.categories as category}
      {#each category.devices as device}
        <div class="device-card">
          <div class="device-name">
            <span class="device-brand">{device.brand}</span>
            <span class="device-model">{device.model}</span>
          </div>
          <p class="device-features">{device.features}</p>
          <div class="spec-tags">
            {#each Object.entries(device.specs) as [key, value]}
              <span class="spec-tag" title="{key}: {value}">{value}</span>
            {/each}
          </div>
          <p class="device-usage">{device.usage}</p>
        </div>
      {/each}
    {/each}
  </div>
</section>

<style>
  .device-section {
    width: 100%;
  }

  .devices-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .device-card {
    background-color: rgba(26, 26, 26, 0.55);
    border: 1px solid #2a2a2a;
    border-radius: 14px;
    padding: 16px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: border-color 0.25s ease;
  }

  .device-card:hover {
    border-color: #444444;
  }

  .device-name {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .device-brand {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  .device-model {
    font-size: 11px;
    color: #777777;
  }

  .device-features {
    font-size: 12px;
    color: #999999;
    line-height: 1.5;
    margin: 0;
  }

  .spec-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .spec-tag {
    display: inline-block;
    padding: 3px 10px;
    background-color: #111111;
    border: 1px solid #2a2a2a;
    border-radius: 6px;
    color: #aaaaaa;
    font-size: 11px;
    white-space: nowrap;
  }

  .device-usage {
    font-size: 12px;
    color: #777777;
    line-height: 1.5;
    margin: 0;
    border-top: 1px solid #222222;
    padding-top: 8px;
  }

  @media (max-width: 768px) {
    .devices-grid {
      grid-template-columns: 1fr;
    }

    .device-card {
      padding: 14px;
    }

    .spec-tag {
      font-size: 10px;
      padding: 2px 8px;
    }
  }
</style>
