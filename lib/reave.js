var http = require('http'),
    https = require('https'),
    cheerio = require('cheerio'),
    url = require('url');

function fetch (http, URL, pageCallback, base64) {
  http.get(URL, function(r) {
    var body;
    if (base64) {
      body = [];
    }
    else {
      body = '';
    }

    var type = r.headers['content-type'];

    r.on('data', function (chunk) {
      if (base64) {
        body.push(chunk);
      }
      else {
        body += chunk;
      }
    });

    r.on('end', function () {
      pageCallback(base64 ? Buffer.concat(body).toString('base64') : body, type);
    });
  });
}

function replace ($, URL, pageCallback) {
  var n = $('img[src^="https:"]').first(),
      u = n.attr('src');
  if (u) {
    fetch(https, u, function(data, type) {
      n.attr('src', 'data:' + type + ';base64,' + data);
      return replace($, URL, pageCallback);
    }, true);
  }
  else {
    pageCallback(URL, $.xml());
  }
}

function medium (URL, pageCallback) {
  fetch(https, URL, function(text) {
    var $ = cheerio.load(text);

    $('html').attr('xmlns','http://www.w3.org/1999/xhtml');
    $('[property="article:published_time"]').attr('name','date');
    $('[property="article:published_time"]').attr('property',null);
    $('[rel=apple-touch-icon-precomposed], [rel=publisher], [rel=stylesheet], .avatar').remove();
    $('script').remove();
    $('[name=viewport], [http-equiv]').remove();
    $('title').text($('[name=title]').attr('content'));
    $('[name=title]').remove();
    $('[property^="og:"]').remove();
    $('[property^="article:"]').remove();
    $('[property^="al:"]').remove();
    $('[property^="fb:"]').remove();
    $('[name^="twitter:"]').remove();
    $('button, .button, label, nav').remove();
    $('[target]').attr('target', null);
    $('a[rel]').attr('rel', null);
    $('html[name], section[name], blockquote[name], p[name], h1[name], h2[name], h3[name], h4[name], h5[name], h6[name]').attr('name', null);
    $('a[id]').remove();
    $('[id]').attr('id', null);
    $('[data-align]').attr('data-align', null);
    $('[itemscope]').attr('itemscope', null);
    $('[itemtype]').attr('itemtype', null);
    $('[data-href]').attr('data-href', null);
    $('.supplementalPostContent').remove();
    $('.loadingBar, .u-hide, .u-hideOnMobile').remove();
    $('br, hr').remove();
    $('body, a, p, blockquote, em, section, div, article, hr, h1, h2, h3, h4, h5, h6').attr('class', null);
    $('head').children().replaceWith($('head *'));
    $('body').children().replaceWith($('article'));
    $('div[style]').each(function(_, e) {
      var e = $(this).css('background-image');
      if (e) {
        $(this).replaceWith('<img src="' + e.replace(/url\((.+)\)/, '$1').replace(/\/max\/\/[0-9+]/,'/max/1280/') + '" alt="background image"/>');
      }
    });
    $('div').each(function(_, e) {
      $(this).replaceWith($(this).children());
    });
    $('article, section').each(function(_, e) {
      $(this).replaceWith($(this).children());
    });

    replace($, URL, pageCallback);
  });
}

function mediumUser (URL, pageCallback) {
  fetch(https, URL, function(text) {
    var out = cheerio.load('<feed xmlns="http://www.w3.org/2005/Atom"><id>'+URL+'</id></feed>');

    var $ = cheerio.load(text);
    var user = $('meta[property="profile:username"]').attr('content');

    $('h3 a[href^="/@'+user+'"]').each(function(_, e) {
      medium(url.resolve(URL,$(this).attr('href')), pageCallback);
    });
  });
}

module.exports = {
  'medium': medium,
  'mediumUser': mediumUser
};
