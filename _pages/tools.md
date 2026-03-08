<!-- TOOLS_MANAGER_BLOCK_START -->
<!-- Managed by GitHubPagesManager. Source: _data/tools.yml -->
{% assign tools_source = site.data.tools %}
{% assign tools_list = tools_source | default: tools_source %}
{% assign sorted_tools = tools_list | sort: "app_name" %}

<section class="tools-registry-managed">
  <style>
    .tools-registry-managed {
      margin: 2.2rem auto;
      max-width: 1240px;
      padding-inline: clamp(0.95rem, 2.8vw, 2.4rem);
      box-sizing: border-box;
    }
    .tools-registry-managed .tools-subtitle {
      margin-top: -0.2rem;
      margin-bottom: 1.2rem;
      color: var(--text-muted, #666);
      max-width: 760px;
      line-height: 1.5;
    }
    .tools-registry-managed .tools-registry-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.4rem;
    }
    .tools-registry-managed .tool-card {
      border: 1px solid var(--border-color, rgba(0,0,0,0.12));
      border-radius: 12px;
      overflow: hidden;
      background: var(--bg-primary, #fff);
      color: var(--text-primary, inherit);
      display: flex;
      flex-direction: column;
      min-height: 100%;
      box-shadow: 0 4px 14px rgba(0,0,0,0.05);
    }
    .tools-registry-managed .tool-thumb {
      width: 100%;
      aspect-ratio: 1200 / 630;
      object-fit: cover;
      background: var(--bg-secondary, #f5f7fb);
      border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.08));
    }
    .tools-registry-managed .tool-content { padding: 1rem 1.05rem 1.1rem; }
    .tools-registry-managed .tool-title {
      margin: 0 0 0.45rem;
      font-size: 1.07rem;
      line-height: 1.3;
    }
    .tools-registry-managed .tool-title a {
      text-decoration: none;
      color: var(--text-primary, inherit);
    }
    .tools-registry-managed .tool-meta {
      margin: 0.2rem 0 0.75rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .tools-registry-managed .tool-badge {
      display: inline-block;
      padding: 0.18rem 0.58rem;
      border-radius: 999px;
      font-size: 0.72rem;
      border: 1px solid var(--border-color, rgba(0,0,0,0.14));
      background: var(--bg-secondary, #f8f9fc);
      color: var(--text-secondary, #4b5563);
    }
    .tools-registry-managed .tool-desc {
      margin: 0;
      font-size: 0.94rem;
      line-height: 1.52;
      color: var(--text-secondary, #4b5563);
    }
    .tools-registry-managed .tool-footer { margin-top: 1rem; }
    .tools-registry-managed .tool-link {
      display: inline-block;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--accent-primary, #2563eb);
    }
    @media (max-width: 760px) {
      .tools-registry-managed {
        margin: 1.5rem auto;
        padding-inline: 0.85rem;
      }
      .tools-registry-managed .tools-subtitle {
        margin-bottom: 0.95rem;
        font-size: 0.95rem;
      }
      .tools-registry-managed .tools-registry-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      .tools-registry-managed .tool-content {
        padding: 0.9rem 0.9rem 1rem;
      }
    }
  </style>
  <h2>Tools</h2>
  <p class="tools-subtitle">Selected Washways tools, maintained from the central tools registry and optimized for discoverability.</p>
  <div class="tools-registry-grid">
    {% for tool in sorted_tools %}
      {% if tool.listed_on_tools == true and tool.published != false and tool.hide != true and tool.demo != true and tool.is_demo != true and tool.isDemo != true and tool.sample != true and tool.template != true and tool.placeholder != true %}
      <article class="tool-card">
        <a href="{{ tool.app_url | default: '/' }}">
          <img class="tool-thumb" src="{{ tool.image | default: '/assets/images/tool-preview.jpg' }}" alt="{{ tool.app_name | default: tool.repo_name | escape }} preview image" loading="lazy" />
        </a>
        <div class="tool-content">
          <h3 class="tool-title"><a href="{{ tool.app_url | default: '/' }}">{{ tool.app_name | default: tool.repo_name }}</a></h3>
          {% assign primary_category = tool.category %}
          {% if primary_category == nil or primary_category == '' %}
            {% if tool.categories and tool.categories.first %}
              {% assign primary_category = tool.categories.first %}
            {% else %}
              {% assign primary_category = tool.categories %}
            {% endif %}
          {% endif %}
          <div class="tool-meta">
            <span class="tool-badge">{{ primary_category | default: 'General' }}</span>
          </div>
          <p class="tool-desc">{{ tool.short_description | default: '' }}</p>
          <div class="tool-footer">
            <a class="tool-link" href="{{ tool.app_url | default: '/' }}">Open tool</a>
          </div>
        </div>
      </article>
      {% endif %}
    {% endfor %}
  </div>
</section>
<!-- TOOLS_MANAGER_BLOCK_END -->
