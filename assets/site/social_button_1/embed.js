// social‑embed.js
;(function(window, document) {
  'use strict';

  // 1. User config (override via window.SocialEmbedConfig)
  var cfgSrc = window.SocialEmbedConfig || {};
  var cfg = {
    selector:    cfgSrc.selector    || 'body',
    email:       cfgSrc.email       || 'mailto:sandeep.paidipati@gmail.com',
    github:      cfgSrc.github      || 'https://github.com/sandy-sp',
    linkedin:    cfgSrc.linkedin    || 'https://linkedin.com/in/sandeep-paidipati',
    creatorName: cfgSrc.creatorName || 'Sandeep Paidipati'
  };

  // 2. Load FontAwesome 4.1 if missing
  if (!document.querySelector('link[href*="font-awesome.min.css"]')) {
    var fa = document.createElement('link');
    fa.rel  = 'stylesheet';
    fa.href = '//netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css';
    document.head.appendChild(fa);
  }

  // 3. Inject scoped CSS for .social and .me (from your original styling) :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}
  if (!document.getElementById('social-embed-style')) {
    var style = document.createElement('style');
    style.id = 'social-embed-style';
    style.textContent = [
      '.social {',
      '  position: fixed;',
      '  top: 20px;',
      '  z-index: 9999;',
      '}',
      '.social ul {',
      '  list-style: none;',
      '  margin: 0;',
      '  padding: 0;',
      '  transform: translate(-270px, 0);',
      '  transition: transform 0.5s ease;',
      '}',
      '.social ul li {',
      '  background: rgba(0,0,0,0.36);',
      '  border-radius: 0 30px 30px 0;',
      '  margin: 5px 0;',
      '  padding: 10px;',
      '  text-align: right;',
      '  transition: all 0.5s ease;',
      '}',
      '.social ul li:hover {',
      '  transform: translate(110px, 0);',
      '  background: rgba(255,255,255,0.4);',
      '}',
      '.social ul li a {',
      '  color: #fff;',
      '  text-decoration: none;',
      '  font-family: Raleway, sans-serif;',
      '}',
      '.social ul li:hover a {',
      '  color: #000;',
      '}',
      '.social ul li i {',
      '  margin-left: 10px;',
      '  background: #fff;',
      '  color: #000;',
      '  padding: 10px;',
      '  border-radius: 50%;',
      '  font-size: 20px;',
      '  transition: transform 1s ease, background 1s ease, color 1s ease;',
      '}',
      '.social ul li:hover i {',
      '  transform: rotate(360deg);',
      '  background: rgba(0,0,0,0.36);',
      '  color: #fff;',
      '}',
      '.me {',
      '  width: 400px;',
      '  margin: 90px auto;',
      '  text-align: center;',
      '  font-family: Raleway, sans-serif;',
      '}',
      '.me p, .me h1 {',
      '  letter-spacing: 3px;',
      '}',
      '.me p { font-weight: 200; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  // 4. Build the sidebar (replacing Twitter with Email)
  var nav = document.createElement('nav');
  nav.className = 'social';

  var ul = document.createElement('ul');
  [
    { href: cfg.email,    label: 'Email',    icon: 'fa fa-envelope'  },
    { href: cfg.github,   label: 'Github',   icon: 'fa fa-github'    },
    { href: cfg.linkedin, label: 'Linkedin', icon: 'fa fa-linkedin'  }
  ].forEach(function(item) {
    var li = document.createElement('li');
    var a  = document.createElement('a');
    a.href = item.href;
    a.target = '_blank';
    a.rel    = 'noopener noreferrer';
    a.textContent = item.label + ' ';
    var i      = document.createElement('i');
    i.className = item.icon;
    a.appendChild(i);
    li.appendChild(a);
    ul.appendChild(li);
  });
  nav.appendChild(ul);

  // 5. Build the author credit
  var me = document.createElement('div');
  me.className = 'me';
  var p = document.createElement('p');
  p.textContent = 'Created by:';
  var h1 = document.createElement('h1');
  h1.textContent = cfg.creatorName;
  me.appendChild(p);
  me.appendChild(h1);

  // 6. Mount into page
  var mount = document.querySelector(cfg.selector);
  if (mount) {
    mount.appendChild(nav);
    mount.appendChild(me);
  }
})(window, document);
