<!-- TOOLS_MANAGER_BLOCK_START -->
<!-- Managed by GitHubPagesManager. Source: _data/tools.yml -->
{% assign tools_source = site.data.tools %}
{% assign tools_list = tools_source | default: tools_source %}
{% assign sorted_tools = tools_list | sort: "app_name" %}

<section class="tools-registry-managed">
  <h2>Tools</h2>
  <p>This list is generated from site.data.tools.</p>
  <div class="tools-registry-grid">
    {% for tool in sorted_tools %}
      {% if tool.published != false and tool.hide != true and tool.demo != true and tool.is_demo != true and tool.isDemo != true and tool.sample != true and tool.template != true and tool.placeholder != true %}
      <article class="tool-card">
        <h3><a href="{{ tool.app_url | default: '/' }}">{{ tool.app_name | default: tool.repo_name }}</a></h3>
        {% assign tool_category = tool.categories | first | default: tool.category | default: 'general' %}
        <p><strong>Category:</strong> {{ tool_category }}</p>
        <p>{{ tool.short_description | default: '' }}</p>
      </article>
      {% endif %}
    {% endfor %}
  </div>
</section>
<!-- TOOLS_MANAGER_BLOCK_END -->
