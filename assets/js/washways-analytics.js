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
  }
  function showBanner() {
    if (bar || !document.body) return;
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

  if (!choice) {
    if (document.body) showBanner();
    else document.addEventListener('DOMContentLoaded', showBanner);
  }
})();
