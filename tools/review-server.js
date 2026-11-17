/* Local review server for the built site.

   Serves the repository root exactly as GitHub Pages would, but injects the
   review-notes panel into every HTML page. Nothing here is part of the build,
   so the published site never contains the panel.

   The panel is OFF by default now: it is a scratchpad for whoever is
   reviewing, and it was overlapping page content in screenshots. Turn it on
   only when you actually want to leave notes:

   Usage:  node tools/review-server.js [port]            # plain site
           REVIEW_PANEL=1 node tools/review-server.js    # panel injected
*/

'use strict';

var http = require('http');
var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var PANEL_DIR = path.join(__dirname, 'review-panel');
var PORT = Number(process.argv[2] || process.env.PORT || 3000);

var TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf'
};

var PANEL_ON = /^(1|true|yes)$/i.test(String(process.env.REVIEW_PANEL || '')) ||
  process.argv.indexOf('--panel') !== -1;

var INJECT_CSS = '<link rel="stylesheet" href="/__review/review.css">';
var INJECT_JS = '<script src="/__review/review.js" defer></script>';

function send(res, status, body, type) {
  res.writeHead(status, {
    'Content-Type': type || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function inject(html) {
  if (!PANEL_ON) return html;
  var withCss = html.indexOf('</head>') !== -1
    ? html.replace('</head>', '  ' + INJECT_CSS + '\n</head>')
    : INJECT_CSS + html;
  return withCss.indexOf('</body>') !== -1
    ? withCss.replace('</body>', '  ' + INJECT_JS + '\n</body>')
    : withCss + INJECT_JS;
}

function servePanel(res, name) {
  if (!/^[a-z-]+\.(css|js)$/.test(name)) {
    send(res, 404, 'Not found');
    return;
  }
  var file = path.join(PANEL_DIR, name);
  fs.readFile(file, function (error, data) {
    if (error) {
      send(res, 404, 'Not found');
      return;
    }
    send(res, 200, data, TYPES[path.extname(file)] || 'text/plain; charset=utf-8');
  });
}

function serveFile(res, file) {
  fs.readFile(file, function (error, data) {
    if (error) {
      send(res, 404, 'Not found');
      return;
    }
    if (path.extname(file) === '.html') {
      send(res, 200, inject(data.toString('utf8')), TYPES['.html']);
      return;
    }
    send(res, 200, data, TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
  });
}

var server = http.createServer(function (req, res) {
  var pathname;
  try {
    pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch (error) {
    send(res, 400, 'Bad request');
    return;
  }

  if (pathname.indexOf('/__review/') === 0) {
    if (!PANEL_ON) {
      send(res, 404, 'Not found');
      return;
    }
    servePanel(res, pathname.slice('/__review/'.length));
    return;
  }

  var target = path.normalize(path.join(ROOT, pathname));
  if (target !== ROOT && target.indexOf(ROOT + path.sep) !== 0) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.stat(target, function (error, stat) {
    if (!error && stat.isDirectory()) {
      if (!/\/$/.test(pathname)) {
        res.writeHead(301, { Location: pathname + '/' });
        res.end();
        return;
      }
      serveFile(res, path.join(target, 'index.html'));
      return;
    }

    if (!error && stat.isFile()) {
      serveFile(res, target);
      return;
    }

    var notFound = path.join(ROOT, '404.html');
    fs.readFile(notFound, function (readError, data) {
      if (readError) {
        send(res, 404, 'Not found');
        return;
      }
      res.writeHead(404, {
        'Content-Type': TYPES['.html'],
        'Cache-Control': 'no-store'
      });
      res.end(inject(data.toString('utf8')));
    });
  });
});

server.listen(PORT, '0.0.0.0', function () {
  console.log('Review server on http://0.0.0.0:' + PORT + ' ' +
    (PANEL_ON ? '(review panel ON — never published)' : '(plain site, no review panel)'));
});
