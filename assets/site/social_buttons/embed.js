// embed.js
;(function(window, document) {
    'use strict';
  
    // 1. Get user config (with sensible defaults)
    var conf = window.ShareButtonsConfig || {};
    var cfg = {
      selector: conf.selector || 'body',
      linkedin: conf.linkedin || 'https://linkedin.com/in/sandeep-paidipati',
      github:   conf.github   || 'https://github.com/sandy-sp',
      email:    conf.email    || 'mailto:sandeep.paidipati@gmail.com'
    };
  
    // 2. Inject FontAwesome if it's not already present
    if (!document.querySelector('link[href*="use.fontawesome.com/releases/v5.6.1/css/all.css"]')) {
      var faLink = document.createElement('link');
      faLink.rel  = 'stylesheet';
      faLink.href = 'https://use.fontawesome.com/releases/v5.6.1/css/all.css';
      document.head.appendChild(faLink);
    }
  
    // 3. Inject the necessary CSS (once)
    if (!document.getElementById('share-buttons-embed-style')) {
      var style = document.createElement('style');
      style.id = 'share-buttons-embed-style';
      style.textContent = [
        '.frame {',
        '  display: flex;',
        '  gap: 12px;',
        '  align-items: center;',
        '  padding: 8px;',
        '  box-shadow:',
        '    -7px -7px 20px #993333,',
        '    -4px -4px 5px #993333,',
        '     7px  7px 20px #0002,',
        '     4px  4px  5px #0001;',
        '  border-radius: 10px;',
        '  background: inherit;',
        '}',
        '.frame .btn {',
        '  width: 35px;',
        '  height: 35px;',
        '  border-radius: 3px;',
        '  background: inherit;',
        '  display: flex;',
        '  justify-content: center;',
        '  align-items: center;',
        '  box-shadow:',
        '    -7px -7px 20px #993333,',
        '    -4px -4px  5px #993333,',
        '     7px  7px 20px #0002,',
        '     4px  4px  5px #0001;',
        '  transition: box-shadow .6s cubic-bezier(.79,.21,.06,.81);',
        '  color: #fff;',
        '  text-decoration: none;',
        '  font-size: 16px;',
        '}',
        '.frame .btn:active {',
        '  box-shadow:',
        '    4px  4px  6px rgba(153,51,51,0.5),',
        '   -4px -4px  6px rgba(116,125,136,0.2),',
        '    inset -4px -4px  6px rgba(153,51,51,0.5),',
        '    inset  4px  4px  6px rgba(116,125,136,0.3);',
        '}'
      ].join('\n');
      document.head.appendChild(style);
    }
  
    // 4. Build the button container
    var container = document.createElement('div');
    container.className = 'frame';
  
    [
      { url: cfg.linkedin, icon: 'fab fa-linkedin-in', name: 'LinkedIn' },
      { url: cfg.github,   icon: 'fab fa-github',     name: 'GitHub'   },
      { url: cfg.email,    icon: 'fas fa-envelope',   name: 'Email'    }
    ].forEach(function(item) {
      var a = document.createElement('a');
      a.href = item.url;
      a.className = 'btn';
      a.setAttribute('aria-label', item.name);
      a.target = '_blank';
      a.rel    = 'noopener noreferrer';
  
      var i = document.createElement('i');
      i.className = item.icon;
      a.appendChild(i);
  
      container.appendChild(a);
    });
  
    // 5. Insert into the page
    var mount = document.querySelector(cfg.selector);
    if (mount) {
      mount.appendChild(container);
    }
  })(window, document);
  