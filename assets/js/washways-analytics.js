/*
 * WASHways Analytics: one script for washways.org, the apps at washways.org/<app>
 * and the apps at apps.washways.org (added there by the server).
 *
 * - Google Analytics 4 (G-64GCB9QDB5) with Consent Mode v2. Until a visitor chooses,
 *   Google gets cookieless pings only; "Accept" turns on analytics cookies.
 * - Ads/personalisation storage is always denied.
 * - The choice is kept in a cookie on .washways.org, so it is asked once for the
 *   whole site and every app.
 * - Links with data-ww-tool="Name" send an `open_tool` event (used on the tools page);
 *   links with data-ww-register="Name" send `register_click`.
 * - Any element with data-ww-consent opens the choice again (e.g. a footer link).
 * - On tool pages (not washways.org's own pages) it adds a small bottom-left dock:
 *   an "All WASHways tools" link back to https://washways.org/ (`back_to_home` event)
 *   and a "Feedback" button that sends a note to Formspree from inside the tool
 *   (`feedback_submit`). If the tool's security policy blocks that, it offers
 *   washways.org/feedback.html instead.
 * - On the sign-in screen of a tool that needs an account (REGISTRATION below) it shows
 *   a "Request access" note linking to washways.org/register.html.
 *
 * Edit the copy in the washways.github.io repo (assets/js/washways-analytics.js).
 */
(function () {
  if (window.__wwAnalytics) return;
  window.__wwAnalytics = true;

  var GA_ID = 'G-64GCB9QDB5';
  var COOKIE = 'ww_consent';
  var PRIVACY_URL = 'https://washways.org/privacy.html';
  var HOME_URL = 'https://washways.org/';
  var FEEDBACK_URL = 'https://washways.org/feedback.html';
  var REGISTER_URL = 'https://washways.org/register.html';
  // Formspree form shared with the Contact page (_data/parameters.yml contact_form_action).
  var FORM_URL = 'https://formspree.io/f/xzerzokq';

  // Tools that need an account (registry `registration: true`), by host + path prefix.
  var REGISTRATION = {
    'apps.washways.org/sitemonitor/': 'SiteMonitor',
    'apps.washways.org/institutionalwashcosting/': 'Institutional WASH Costing'
  };

  function readChoice() {
    var m = document.cookie.match(/(?:^|;\s*)ww_consent=(granted|denied)/);
    return m ? m[1] : '';
  }
  function saveChoice(value) {
    var host = location.hostname;
    var domain = /(^|\.)washways\.org$/.test(host) ? '; domain=washways.org' : '';
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = COOKIE + '=' + value + '; path=/; max-age=31536000; SameSite=Lax' + domain + secure;
  }

  window.dataLayer = window.dataLayer || [];
  var gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  if (!window.gtag) window.gtag = gtag;

  // Pages that already load gtag.js themselves keep their own setup; we only add the
  // consent choice so we never count a page view twice.
  var alreadyTagged = !!document.querySelector('script[src*="googletagmanager.com/gtag/js"]');

  var choice = readChoice();
  gtag('consent', 'default', {
    analytics_storage: choice === 'granted' ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  if (!alreadyTagged) {
    gtag('js', new Date());
    gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    (document.head || document.documentElement).appendChild(s);
  }

  // Which tool a visitor opened (or asked to register for) from the tools page.
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[data-ww-tool]') : null;
    if (a) {
      gtag('event', 'open_tool', {
        tool_name: a.getAttribute('data-ww-tool'),
        link_url: a.href,
        transport_type: 'beacon'
      });
    }
    var reg = ev.target && ev.target.closest ? ev.target.closest('a[data-ww-register]') : null;
    if (reg) {
      gtag('event', 'register_click', { tool_name: reg.getAttribute('data-ww-register'), transport_type: 'beacon' });
    }
    var reopen = ev.target && ev.target.closest ? ev.target.closest('[data-ww-consent]') : null;
    if (reopen) { ev.preventDefault(); showBanner(); }
  }, true);

  // ── shared look (styled through element.style so app CSP and CSS can't break it) ──
  var FONT = '13px/1.45 Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  var PANEL = {
    background: '#161922', color: '#e8eaf0', border: '1px solid #2b3142', borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,.35)', boxSizing: 'border-box', font: FONT, textAlign: 'left'
  };
  function css(node, styles) { for (var k in styles) node.style[k] = styles[k]; return node; }
  function el(tag, styles, text) {
    var n = document.createElement(tag);
    if (styles) css(n, styles);
    if (text) n.textContent = text;
    return n;
  }
  function button(label, primary, onClick) {
    var b = el('button', {
      font: 'inherit', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
      padding: '7px 14px', borderRadius: '8px', margin: '0',
      border: primary ? '1px solid #E8505B' : '1px solid #3a4152',
      background: primary ? '#E8505B' : 'transparent', color: '#fff'
    }, label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }

  // ── consent bar ──
  var bar = null;
  function decide(value) {
    saveChoice(value);
    gtag('consent', 'update', { analytics_storage: value });
    if (bar) { bar.remove(); bar = null; }
    if (dock) dock.style.display = 'flex';
  }
  function showBanner() {
    if (bar || !document.body) return;
    if (dock) dock.style.display = 'none';
    closePanel();
    bar = el('div', PANEL);
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie choice');
    css(bar, {
      position: 'fixed', left: '12px', right: '12px', bottom: '12px', zIndex: '2147483647',
      maxWidth: '560px', margin: '0 auto', padding: '12px 14px',
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px'
    });
    var text = el('span', { flex: '1 1 260px' });
    text.appendChild(document.createTextNode('WASHways uses Google Analytics cookies to learn which tools are useful. '));
    var more = el('a', { color: '#9AC4F8' }, 'Privacy');
    more.href = PRIVACY_URL;
    text.appendChild(more);
    var actions = el('span', { display: 'flex', gap: '8px' });
    actions.appendChild(button('Decline', false, function () { decide('denied'); }));
    actions.appendChild(button('Accept', true, function () { decide('granted'); }));
    bar.appendChild(text);
    bar.appendChild(actions);
    document.body.appendChild(bar);
  }

  // ── which tool is this? ──
  function pageKey() { return (location.hostname + location.pathname).toLowerCase(); }
  function registrationTool() {
    var key = pageKey();
    for (var prefix in REGISTRATION) if (key.indexOf(prefix) === 0) return REGISTRATION[prefix];
    return '';
  }
  function toolName() {
    var reg = registrationTool();
    if (reg) return reg;
    var title = (document.title || '').split(/\s+[|–—-]\s+/)[0].trim();
    if (title && !/^\d{3}\b/.test(title)) return title;
    return location.pathname.split('/')[1] || location.hostname;
  }

  // ── bottom-left dock on every tool page: "All WASHways tools" + "Feedback" ──
  // Not on washways.org's own pages (they carry <meta name="ww-site">). Default corner is
  // bottom-left; HOME_SPOTS moves it for tools whose own controls sit there.
  var HOME_SPOTS = {
    // path prefix: { side: 'left' | 'right', bottom: px }
  };
  var dock = null;
  var spot = null;
  function homeSpot() {
    var path = location.pathname;
    for (var prefix in HOME_SPOTS) if (path.indexOf(prefix) === 0) return HOME_SPOTS[prefix];
    return { side: 'left', bottom: 12 };
  }
  function pill(tag) {
    return el(tag, {
      display: 'flex', alignItems: 'center', gap: '7px', boxSizing: 'border-box',
      padding: '6px 11px 6px 8px', borderRadius: '999px', margin: '0', cursor: 'pointer',
      background: 'rgba(22,25,34,.88)', color: '#fff', textDecoration: 'none',
      font: '600 12px/1 Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      boxShadow: '0 2px 10px rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.12)',
      opacity: '.92', transition: 'opacity .15s'
    });
  }
  function bubbleIcon() {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '13');
    svg.setAttribute('height', '13');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('fill', '#9AC4F8');
    p.setAttribute('d', 'M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z');
    svg.appendChild(p);
    return svg;
  }
  function showDock() {
    if (dock || !document.body || document.querySelector('meta[name="ww-site"]')) return;
    spot = homeSpot();
    dock = el('div', {
      position: 'fixed', bottom: spot.bottom + 'px', zIndex: '2147483646',
      display: bar ? 'none' : 'flex', alignItems: 'center', gap: '6px',
      flexDirection: spot.side === 'left' ? 'row' : 'row-reverse'
    });
    dock.style[spot.side] = '12px';

    var home = pill('a');
    home.href = HOME_URL;
    home.title = 'More free water, sanitation and hygiene tools at washways.org';
    home.setAttribute('aria-label', 'All WASHways tools (washways.org)');
    var dots = el('span', { display: 'inline-flex', gap: '2px' });
    ['#2e9e44', '#f58220', '#1f78b4'].forEach(function (c) {
      dots.appendChild(el('span', { width: '7px', height: '7px', borderRadius: '50%', background: c, display: 'inline-block' }));
    });
    var homeLabel = el('span', { whiteSpace: 'nowrap' }, 'All WASHways tools');
    home.appendChild(dots);
    home.appendChild(homeLabel);
    home.addEventListener('click', function () {
      gtag('event', 'back_to_home', { from_path: location.pathname, transport_type: 'beacon' });
    });

    var fb = pill('button');
    fb.type = 'button';
    fb.title = 'Send feedback or a suggestion about this tool';
    fb.setAttribute('aria-label', 'Feedback on this tool');
    fb.setAttribute('aria-haspopup', 'dialog');
    var fbLabel = el('span', { whiteSpace: 'nowrap' }, 'Feedback');
    fb.appendChild(bubbleIcon());
    fb.appendChild(fbLabel);
    fb.addEventListener('click', function () { if (panel) closePanel(); else openPanel(); });

    dock.appendChild(home);
    dock.appendChild(fb);

    // Shrinks to just the icons so it covers as little of the tool as possible:
    // straight away on phones, otherwise after a few seconds or the first scroll.
    var pinned = false;
    function setOpen(open) {
      homeLabel.style.display = open ? '' : 'none';
      fbLabel.style.display = open ? '' : 'none';
      home.style.padding = open ? '6px 11px 6px 8px' : '8px 7px';
      fb.style.padding = open ? '6px 11px 6px 9px' : '7px 8px';
      dock.style.opacity = '1';
    }
    function collapse() { if (!pinned && !panel) setOpen(false); }
    setOpen(window.innerWidth >= 600);
    setTimeout(collapse, 6000);
    window.addEventListener('scroll', collapse, { passive: true, once: true });
    dock.addEventListener('mouseenter', function () { pinned = true; setOpen(true); });
    dock.addEventListener('mouseleave', function () { pinned = false; collapse(); });
    dock.addEventListener('focusin', function () { setOpen(true); });
    dock.addEventListener('focusout', collapse);
    dock.collapse = collapse;
    document.body.appendChild(dock);

    // Sit above a tool's own fixed bar at the bottom of the screen (e.g. a mobile tab bar).
    function lift() {
      var x = spot.side === 'left' ? 30 : window.innerWidth - 30;
      var y = window.innerHeight - spot.bottom - 10;
      var bottom = spot.bottom;
      dock.style.visibility = 'hidden';
      var stack = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [];
      dock.style.visibility = '';
      for (var i = 0; i < stack.length; i++) {
        for (var n = stack[i]; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
          if (n === bar || n === dock || n === panel || n === regNote) break;
          var pos = getComputedStyle(n).position;
          if (pos === 'fixed' || pos === 'sticky') {
            var r = n.getBoundingClientRect();
            if (r.height < window.innerHeight / 3) bottom = Math.max(bottom, window.innerHeight - r.top + 8);
            break;
          }
        }
      }
      dock.style.bottom = bottom + 'px';
      if (panel) panel.style.bottom = (bottom + 44) + 'px';
    }
    lift();
    setTimeout(lift, 1500);
    window.addEventListener('resize', lift);
  }

  // ── feedback panel ──
  var panel = null;
  var directBlocked = null; // null = not checked yet; true = CSP blocks formspree.io here
  function field(node) {
    return css(node, {
      display: 'block', width: '100%', boxSizing: 'border-box', margin: '0 0 8px',
      font: 'inherit', fontSize: '13px', color: '#e8eaf0', background: '#0f1219',
      border: '1px solid #2b3142', borderRadius: '8px', padding: '8px 10px'
    });
  }
  function closePanel() {
    if (!panel) return;
    panel.remove();
    panel = null;
    document.removeEventListener('keydown', onPanelKey, true);
    if (dock && dock.collapse) dock.collapse();
  }
  function onPanelKey(ev) { if (ev.key === 'Escape') closePanel(); }
  function openPanel() {
    if (panel || !document.body) return;
    var tool = toolName();
    panel = el('div', PANEL);
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Feedback on ' + tool);
    css(panel, {
      position: 'fixed', bottom: ((parseInt(dock && dock.style.bottom, 10) || 12) + 44) + 'px',
      zIndex: '2147483647', width: '320px', maxWidth: 'calc(100vw - 24px)', padding: '12px 14px 14px'
    });
    panel.style[(spot && spot.side) || 'left'] = '12px';

    var head = el('div', { display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px' });
    var h = el('strong', { flex: '1', fontSize: '14px' }, 'Feedback on ' + tool);
    var x = el('button', {
      font: 'inherit', fontSize: '18px', lineHeight: '1', background: 'transparent', color: '#a3acbe',
      border: '0', cursor: 'pointer', padding: '2px 4px', margin: '0'
    }, '×');
    x.type = 'button';
    x.setAttribute('aria-label', 'Close');
    x.addEventListener('click', closePanel);
    head.appendChild(h);
    head.appendChild(x);

    var intro = el('p', { margin: '0 0 10px', color: '#a3acbe', fontSize: '12.5px' },
      'What works, what does not, what would help? Every message is read.');

    var kind = field(document.createElement('select'));
    ['Suggestion', 'Problem or bug', 'Data question', 'Praise'].forEach(function (k) {
      var o = document.createElement('option');
      o.textContent = k;
      kind.appendChild(o);
    });
    kind.setAttribute('aria-label', 'Type of feedback');
    var msg = field(document.createElement('textarea'));
    msg.rows = 4;
    msg.placeholder = 'Your feedback';
    msg.setAttribute('aria-label', 'Your feedback');
    css(msg, { resize: 'vertical', minHeight: '80px' });
    var email = field(document.createElement('input'));
    email.type = 'email';
    email.placeholder = 'Email (optional, for a reply)';
    email.setAttribute('aria-label', 'Email (optional)');
    email.autocomplete = 'email';
    var org = field(document.createElement('input'));
    org.type = 'text';
    org.placeholder = 'Organisation (optional)';
    org.setAttribute('aria-label', 'Organisation (optional)');
    org.autocomplete = 'organization';

    var status = el('p', { margin: '2px 0 8px', fontSize: '12.5px', color: '#fbbf24', display: 'none' });
    status.setAttribute('role', 'status');
    var send = button('Send feedback', true, submit);

    // Some tools' Content-Security-Policy blocks formspree.io. Then the button sends the
    // message on to washways.org/feedback.html (a click, so the new tab is not blocked).
    function useFallback(note) {
      directBlocked = true;
      send.textContent = 'Continue on washways.org';
      status.textContent = note || 'This tool cannot send messages itself, so your message opens on washways.org to send.';
      css(status, { display: 'block', color: '#a3acbe' });
    }
    function openFallback() {
      var url = FEEDBACK_URL + '?tool=' + encodeURIComponent(tool) +
        '&page=' + encodeURIComponent(location.href) + '&message=' + encodeURIComponent(msg.value);
      gtag('event', 'feedback_fallback', { tool_name: tool });
      window.open(url, '_blank', 'noopener');
      closePanel();
    }
    if (directBlocked) useFallback();
    else if (directBlocked === null) {
      // A no-cors GET only checks that the page may connect; it submits nothing.
      fetch(FORM_URL, { method: 'GET', mode: 'no-cors', cache: 'no-store' })
        .then(function () { directBlocked = false; })
        .catch(function () { if (panel) useFallback(); else directBlocked = true; });
    }
    function submit() {
      if (!msg.value.trim()) { msg.focus(); return; }
      if (directBlocked) { openFallback(); return; }
      send.disabled = true;
      send.textContent = 'Sending...';
      status.style.display = 'none';
      var data = new FormData();
      data.append('form_type', 'feedback');
      data.append('_subject', 'Feedback: ' + tool + (org.value ? ' (' + org.value + ')' : ''));
      data.append('tool', tool);
      data.append('kind', kind.value);
      data.append('message', msg.value);
      if (email.value) data.append('email', email.value);
      if (org.value) data.append('organisation', org.value);
      data.append('page', location.href);
      fetch(FORM_URL, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          gtag('event', 'feedback_submit', { tool_name: tool, feedback_kind: kind.value });
          if (!panel) return;
          while (panel.childNodes.length > 1) panel.removeChild(panel.lastChild);
          panel.appendChild(el('p', { margin: '4px 0 2px', color: '#e8eaf0' }, 'Thank you, your feedback has been sent.'));
          setTimeout(closePanel, 2500);
        })
        .catch(function (err) {
          send.disabled = false;
          send.textContent = 'Send feedback';
          // A TypeError means the request never left the page (e.g. the tool's
          // Content-Security-Policy blocks formspree.io): offer the washways.org form.
          if (err instanceof TypeError) {
            useFallback('This tool cannot send messages itself. Click again to send it on washways.org.');
            return;
          }
          status.textContent = 'Sorry, this could not be sent. Please try again in a moment.';
          status.style.display = 'block';
        });
    }

    panel.appendChild(head);
    panel.appendChild(intro);
    panel.appendChild(kind);
    panel.appendChild(msg);
    panel.appendChild(email);
    panel.appendChild(org);
    panel.appendChild(status);
    panel.appendChild(send);
    document.body.appendChild(panel);
    document.addEventListener('keydown', onPanelKey, true);
    msg.focus();
    gtag('event', 'feedback_open', { tool_name: tool });
  }

  // ── "Request access" note on the sign-in screen of tools that need an account ──
  var regNote = null;
  function looksLikeSignIn() {
    if (/^\s*401\b/.test(document.title)) return true; // nginx page after a cancelled password prompt
    var pw = document.querySelector('input[type="password"]');
    return !!(pw && pw.offsetParent !== null);
  }
  function checkRegistration() {
    var tool = registrationTool();
    if (!tool || !document.body) return;
    var show = looksLikeSignIn();
    if (show && !regNote) {
      regNote = el('div', PANEL);
      regNote.setAttribute('role', 'note');
      css(regNote, {
        position: 'fixed', top: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: '2147483646',
        width: '420px', maxWidth: 'calc(100vw - 24px)', padding: '12px 14px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 12px'
      });
      var text = el('span', { flex: '1 1 220px' });
      text.appendChild(el('strong', { display: 'block', fontSize: '14px' }, 'New to ' + tool + '?'));
      text.appendChild(document.createTextNode('This tool needs an account. Tell us who you are and we will email your sign-in details.'));
      var go = el('a', {
        background: '#E8505B', color: '#fff', textDecoration: 'none', fontWeight: '600',
        padding: '8px 14px', borderRadius: '8px', whiteSpace: 'nowrap'
      }, 'Request access');
      go.href = REGISTER_URL + '?tool=' + encodeURIComponent(tool);
      go.setAttribute('data-ww-register', tool);
      regNote.appendChild(text);
      regNote.appendChild(go);
      document.body.appendChild(regNote);
    } else if (!show && regNote) {
      regNote.remove();
      regNote = null;
    }
  }

  function start() {
    if (!choice) showBanner();
    showDock();
    checkRegistration();
    if (registrationTool()) setInterval(checkRegistration, 1500); // single-page apps swap screens
  }
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
