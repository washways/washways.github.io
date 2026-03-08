<!-- TOOLS_MANAGER_BLOCK_START -->
<!-- Managed by GitHubPagesManager. Source: _data/tools.yml -->
{% assign tools_source = site.data.tools %}
{% assign tools_list = tools_source | default: tools_source %}
{% assign sorted_tools = tools_list | sort: "app_name" %}

<section class="tools-registry-managed">
  <style>
    .tools-registry-managed { margin: 2rem 0; }
    .tools-registry-managed .tools-subtitle { margin-top: -0.35rem; opacity: 0.8; }
    .tools-registry-managed .tools-registry-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-top: 1.25rem;
    }
    .tools-registry-managed .tool-card {
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 14px;
      overflow: hidden;
      background: #fff;
      display: flex;
      flex-direction: column;
      min-height: 100%;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
    }
    .tools-registry-managed .tool-thumb {
      width: 100%;
      aspect-ratio: 1200 / 630;
      object-fit: cover;
      background: #f5f7fb;
      border-bottom: 1px solid rgba(0,0,0,0.08);
    }
    .tools-registry-managed .tool-content { padding: 0.95rem 1rem 1rem; }
    .tools-registry-managed .tool-title {
      margin: 0;
      font-size: 1.05rem;
      line-height: 1.3;
    }
    .tools-registry-managed .tool-title a { text-decoration: none; }
    .tools-registry-managed .tool-meta {
      margin: 0.5rem 0 0.65rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .tools-registry-managed .tool-badge {
      display: inline-block;
      padding: 0.16rem 0.55rem;
      border-radius: 999px;
      font-size: 0.73rem;
      border: 1px solid rgba(0,0,0,0.14);
      background: #f8f9fc;
    }
    .tools-registry-managed .tool-desc {
      margin: 0;
      font-size: 0.93rem;
      line-height: 1.45;
      opacity: 0.92;
    }
    .tools-registry-managed .tool-footer { margin-top: 0.9rem; }
    .tools-registry-managed .tool-link {
      display: inline-block;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
    }
  </style>
  <h2>Tools</h2>
  <p class="tools-subtitle">Curated applications generated from site.data.tools.</p>
  <div class="tools-registry-grid">
    {% for tool in sorted_tools %}
      {% if tool.published != false and tool.hide != true and tool.demo != true and tool.is_demo != true and tool.isDemo != true and tool.sample != true and tool.template != true and tool.placeholder != true %}
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
            {% if tool.seo_configured == true %}<span class="tool-badge">SEO Ready</span>{% endif %}
            {% if tool.analytics_installed == true %}<span class="tool-badge">Analytics</span>{% endif %}
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
