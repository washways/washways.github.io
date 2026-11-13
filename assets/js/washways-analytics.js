/*
 * WASHways Analytics: one script for washways.org, the apps at washways.org/<app>
 * and the apps at apps.washways.org (added there by the server).
 *
 * - Google Analytics 4 (G-64GCB9QDB5) with Consent Mode v2. Until a visitor chooses,
 *   Google gets cookieless pings only; "Accept" turns on analytics cookies.
 * - Ads/personalisation storage is always denied.
 * - The choice is kept in a cookie on .washways.org, so it is asked once for the
 *   whole site and every app.
 * - Links with data-ww-tool="Name" send an `open_tool` event (used on the tools page).
 * - Any element with data-ww-consent opens the choice again (e.g. a footer link).
 * - On tool pages (not washways.org's own pages) it adds a small "All WASHways tools"
 *   link back to https://washways.org/ (click = `back_to_home` event).
 *
 * Edit the copy in the washways.github.io repo (assets/js/washways-analytics.js).
 */
(function () {
  if (window.__wwAnalytics) return;
  window.__wwAnalytics = true;

  var GA_ID = 'G-64GCB9QDB5';
  var COOKIE = 'ww_consent';
  var PRIVACY_URL = 'https://washways.org/privacy.html';

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

  // Which tool a visitor opened from the tools page.
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[data-ww-tool]') : null;
    if (a) {
      gtag('event', 'open_tool', {
        tool_name: a.getAttribute('data-ww-tool'),
        link_url: a.href,
        transport_type: 'beacon'
      });
    }
    var reopen = ev.target && ev.target.closest ? ev.target.closest('[data-ww-consent]') : null;
    if (reopen) { ev.preventDefault(); showBanner(); }
  }, true);

  // ── consent bar (styled through element.style so app CSP and CSS can't break it) ──
  var bar = null;
  function css(node, styles) { for (var k in styles) node.style[k] = styles[k]; return node; }
  function button(label, primary, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    css(b, {
      font: 'inherit', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
      padding: '7px 14px', borderRadius: '8px', margin: '0',
      border: primary ? '1px solid #E8505B' : '1px solid #3a4152',
      background: primary ? '#E8505B' : 'transparent', color: '#fff'
    });
    b.addEventListener('click', onClick);
    return b;
  }
  function decide(value) {
    saveChoice(value);
    gtag('consent', 'update', { analytics_storage: value });
    if (bar) { bar.remove(); bar = null; }
    if (home) home.style.display = 'flex';
  }
  function showBanner() {
    if (bar || !document.body) return;
    if (home) home.style.display = 'none';
    bar = document.createElement('div');
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie choice');
    css(bar, {
      position: 'fixed', left: '12px', right: '12px', bottom: '12px', zIndex: '2147483647',
      maxWidth: '560px', margin: '0 auto', boxSizing: 'border-box',
      background: '#161922', color: '#e8eaf0', border: '1px solid #2b3142', borderRadius: '12px',
      boxShadow: '0 8px 30px rgba(0,0,0,.35)', padding: '12px 14px',
      font: '13px/1.45 Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px'
    });
    var text = document.createElement('span');
    css(text, { flex: '1 1 260px' });
    text.appendChild(document.createTextNode('WASHways uses Google Analytics cookies to learn which tools are useful. '));
    var more = document.createElement('a');
    more.href = PRIVACY_URL;
    more.textContent = 'Privacy';
    css(more, { color: '#9AC4F8' });
    text.appendChild(more);
    var actions = document.createElement('span');
    css(actions, { display: 'flex', gap: '8px' });
    actions.appendChild(button('Decline', false, function () { decide('denied'); }));
    actions.appendChild(button('Accept', true, function () { decide('granted'); }));
    bar.appendChild(text);
    bar.appendChild(actions);
    document.body.appendChild(bar);
  }

  // ── "All WASHways tools" link on every tool page ──
  // Not on washways.org's own pages (they carry <meta name="ww-site">). Default corner is
  // bottom-left; HOME_SPOTS moves it for tools whose own controls sit there.
  var HOME_URL = 'https://washways.org/';
  var HOME_SPOTS = {
    // path prefix: { side: 'left' | 'right', bottom: px }
  };
  var home = null;
  function homeSpot() {
    var path = location.pathname;
    for (var prefix in HOME_SPOTS) if (path.indexOf(prefix) === 0) return HOME_SPOTS[prefix];
    return { side: 'left', bottom: 12 };
  }
  function showHomeLink() {
    if (home || !document.body || document.querySelector('meta[name="ww-site"]')) return;
    var spot = homeSpot();
    home = document.createElement('a');
    home.href = HOME_URL;
    home.title = 'More free water, sanitation and hygiene tools at washways.org';
    home.setAttribute('aria-label', 'All WASHways tools (washways.org)');
    css(home, {
      position: 'fixed', bottom: spot.bottom + 'px', zIndex: '2147483646',
      display: bar ? 'none' : 'flex', alignItems: 'center', gap: '7px',
      padding: '6px 11px 6px 8px', borderRadius: '999px',
      background: 'rgba(22,25,34,.88)', color: '#fff', textDecoration: 'none',
      font: '600 12px/1 Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      boxShadow: '0 2px 10px rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.12)',
      opacity: '.92', transition: 'opacity .15s'
    });
    home.style[spot.side] = '12px';
    var dots = document.createElement('span');
    css(dots, { display: 'inline-flex', gap: '2px' });
    ['#2e9e44', '#f58220', '#1f78b4'].forEach(function (c) {
      var d = document.createElement('span');
      css(d, { width: '7px', height: '7px', borderRadius: '50%', background: c, display: 'inline-block' });
      dots.appendChild(d);
    });
    var label = document.createElement('span');
    label.textContent = 'All WASHways tools';
    css(label, { whiteSpace: 'nowrap' });
    home.appendChild(dots);
    home.appendChild(label);

    // Shrinks to just the three dots so it covers as little of the tool as possible:
    // straight away on phones, otherwise after a few seconds or the first scroll.
    var pinned = false;
    function setOpen(open) {
      label.style.display = open ? '' : 'none';
      home.style.padding = open ? '6px 11px 6px 8px' : '8px 7px';
    }
    function collapse() { if (!pinned) setOpen(false); }
    setOpen(window.innerWidth >= 600);
    setTimeout(collapse, 6000);
    window.addEventListener('scroll', collapse, { passive: true, once: true });
    home.addEventListener('mouseenter', function () { pinned = true; setOpen(true); home.style.opacity = '1'; });
    home.addEventListener('mouseleave', function () { pinned = false; setOpen(false); home.style.opacity = '.92'; });
    home.addEventListener('focus', function () { setOpen(true); });
    home.addEventListener('blur', collapse);
    home.addEventListener('click', function () {
      gtag('event', 'back_to_home', { from_path: location.pathname, transport_type: 'beacon' });
    });
    document.body.appendChild(home);

    // Sit above a tool's own fixed bar at the bottom of the screen (e.g. a mobile tab bar).
    function lift() {
      var x = spot.side === 'left' ? 30 : window.innerWidth - 30;
      var y = window.innerHeight - spot.bottom - 10;
      var bottom = spot.bottom;
      home.style.visibility = 'hidden';
      var stack = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [];
      home.style.visibility = '';
      for (var i = 0; i < stack.length; i++) {
        for (var el = stack[i]; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
          if (el === bar || el === home) break;
          var pos = getComputedStyle(el).position;
          if (pos === 'fixed' || pos === 'sticky') {
            var r = el.getBoundingClientRect();
            if (r.height < window.innerHeight / 3) bottom = Math.max(bottom, window.innerHeight - r.top + 8);
            break;
          }
        }
      }
      home.style.bottom = bottom + 'px';
    }
    lift();
    setTimeout(lift, 1500);
    window.addEventListener('resize', lift);
  }

  function start() {
    if (!choice) showBanner();
    showHomeLink();
  }
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
