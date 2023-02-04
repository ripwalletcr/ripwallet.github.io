
(function($){
  $(document).on('contextmenu', 'img', function() {
      return false;
  })
})(jQuery);

(function (C, A, L) {
  let p = function (a, ar) {
    a.q.push(ar);
  };
  let d = C.document;
  C.Cal =
    C.Cal ||
    function () {
      let cal = C.Cal;
      let ar = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        d.head.appendChild(d.createElement("script")).src = A;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api = function () {
          p(api, arguments);
        };
        const namespace = ar[1];
        api.q = api.q || [];
        typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar);
        return;
      }
      p(cal, ar);
    };
  })(window, "https://cal.com/embed.js", "init");
  Cal("init")

  object.onclick = function(){
    if (/Android|Windows|iPhonewebOS|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
        Console.log("Mobile Device Found, Open Links in a new Tab");
        function openInNewTab(url) {
            var win = window.open(url, '_blank');
            win.focus();
        }
    }
    else{
        Console.log("Mobile Device Not Found, Open Links in lightBox");
        window.open(url,"_self");
    }
};