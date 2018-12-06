var sleep = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

if (!Object.prototype.watch) {
  Object.defineProperty(Object.prototype, "watch", {
    enumerable: false,
    configurable: true,
    writable: false,
		value: function (prop, handler) {
			var oldval = this[prop],
			newval = oldval,
			getter = function () {
				return newval;
			},
			setter = function (val) {
				oldval = newval;
				return newval = handler.call(this, prop, oldval, val);
			};
			
			if (delete this[prop]) {
				Object.defineProperty(this, prop, {
					get: getter,
					set: setter,
					enumerable: true,
					configurable: true
				});
			}
		}
	});
};

var adc = function(f,c) {return function(){c(arguments);return f.apply(f,arguments);};};

var removematch = function(s,r) {
  var q = r.exec(s);
  if (q == null) {
    return s;
  }
  while (q != null) {
    s = s.slice(0,s.search(r))+s.slice(s.search(r)+q[0].length);
    q = r.exec(s);
  }
  return s;
};

var getAnswer = function() {
  var bob = removematch(vo.answer,/\(([^)]+)\)/);
  bob = removematch(bob,/\[([^\[]+)\]/);
  bob = removematch(bob,/[^a-zA-Z0-9 {}\-]+/);
  var q = (/{([^}]+)}/).exec(bob);
  if (q==null) {
    return bob.toLowerCase();
  }
  var matches = [];
  while (q != null) {
    matches.push(q[1]);
    bob = bob.slice(bob.search(/{([^}]+)}/));
    bob = bob.slice(q[0].length);
    q = (/{([^}]+)}/).exec(bob)
  }
  var best = '';
  for (i in matches) {
    if (matches[i].length > best.length) {
      best = matches[i];
    }
  }
  return best.toLowerCase();
  /*
  while (q != null) {
    var n = bob.search(/{([^}]+)}/);
    bob = bob.slice(0,n)+q[1]+bob.slice(n+q[0].length);
    q = (/{([^}]+)}/).exec(bob);
  }
  return bob.toLowerCase();*/
};

var typeAnswer = async function(a) {
  var z = '';
  var al = 'abcdefghijklmnopqrstuvwxyz';
  for (var i = 0; i < a.length; i++) {
    var bb = Math.floor(Math.random()*3+3);
    if (i < a.length-bb && Math.random() < 0.02) {
      /* typo time */
      await sleep(100+Math.random()*100);
      z += al[Math.floor(Math.random()*26)];
      $('.guess_input')[0].value = z;
      mo.guess({text:z,done:false});
      for (var j = 1; j <= bb; j++) {
        await sleep(100+Math.random()*100);
        z += a[i+j];
        $('.guess_input')[0].value = z;
        mo.guess({text:z,done:false});
      }
      for (var j = 0; j <= bb; j++) {
        await sleep(50);
        z = z.slice(0,z.length-1);
        $('.guess_input')[0].value = z;
        mo.guess({text:z,done:false});
      }
    }
    if (Math.random() > 0.004) {
      await sleep(100+Math.random()*100);
      z += a[i];
      $('.guess_input')[0].value = z;
      mo.guess({text:z,done:false});
    } else if (Math.random() > 0.5) {
      await sleep(100+Math.random()*100);
      z += al[Math.floor(Math.random()*26)];
      $('.guess_input')[0].value = z;
      mo.guess({text:z,done:false});
    }
  }
  mo.guess({text:z,done:true});
};

var cheat = async function() {
  console.log(vo.answer);
  if (At != 'guess') {
    mo.buzz(vo.qid);
  }
  await typeAnswer(getAnswer());
  await sleep(500+Math.random()*200);
  if (At == 'prompt') {
    await typeAnswer(vo.answer.replace(/(\(|\[).*/, "").replace(/\{|\}/g, ""));
  }
  mo.next();
};

var wc = async function() {
  await sleep(Math.random()*1000+3000);
  cheat();
};

vo.watch('answer',function(a,b,c) {
  wc();
  $('.motto')[0].innerText = c.replace(/(\(|\[).*/, "").replace(/\{|\}/g, "");
  return c;
});

var wn = async function() {
  await sleep(500+Math.random()*200);
  if ($('.revealed.active').length) {
    console.log('next');
    mo.next();
  }
};

Et = adc(Et,wn);

var sendkey = function(c,e) {
  if (typeof(e) == 'string') {
    e = $(e)[0];
  }
  e.dispatchEvent(new KeyboardEvent('keydown',{keyCode:c}));
  e.dispatchEvent(new KeyboardEvent('keypress',{keyCode:c}));
  e.dispatchEvent(new KeyboardEvent('keyup',{keyCode:c}));
};