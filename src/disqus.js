function DisqusJS(config) {
    /*
     * A polyfill of Object.asign
     */
    function _extends() {
        _extends = Object.assign || function (target) {
            for (const source of arguments) {
                for (const key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        }
        return _extends.apply(this, arguments);
    }

    /*
     * A polyfill of Array.isArray
     */
    if (!Array.isArray) Array.isArray = (arg) => Object.prototype.toString.call(arg) === '[object Array]';


    ((window, document, localStorage, config) => {
        /*
         * get(url)
         * A wrapper of fetch GET method.
         */
        const get = (url) => fetch(url, { method: 'GET' })
            .then((resp) => Promise.all([resp.ok, resp.status, resp.json(), resp.headers]))
            .then(([ok, status, data, headers]) => {
                if (ok) {
                    let json = {
                        ok,
                        status,
                        data,
                        headers
                    }
                    return json;
                } else {
                    throw new Error(JSON.stringify(json.error));
                }
            }).catch(error => {
                throw error;
            });

        /*
         * setLS(key, value)
         * store value inside localStorage
         */
        const setLS = (key, value) => {
            try {
                localStorage.setItem(key, value);
            } catch (e) { }
        };

        /*
         * formatDate(date)
         * Format a input date to ${y}-${m}-${d} ${h}:${minute} format
         */
        const formatDate = (date) => {
            // 不足两位补 0
            let x = (input) => (input < 10) ? `0${input}` : input;
            // 将传入的 date 转化为时间戳
            date = Date.parse(new Date(date));

            // Disqus API 返回的是 UTC 时间，所以在时间戳上加 28800000 毫秒补上 8 小时时差
            date = new Date(date + 8 * 60 * 60 * 1000);
            let y = date.getFullYear();
            let m = x(date.getMonth() + 1);
            let d = x(date.getDate());
            let h = x(date.getHours());
            let minute = x(date.getMinutes());
            return `${y}-${m}-${d} ${h}:${minute}`;
        }

        let disqusjs = {};

        disqusjs.config = _extends({
            api: 'https://disqus.skk.moe/disqus/',
            identifier: document.location.origin + document.location.pathname + document.location.search,
            url: document.location.origin + document.location.pathname + document.location.search,
            title: document.title,
            nesting: parseInt(config.nesting) || 4
        }, config);

        const apikey = () => (Array.isArray(disqusjs.config.apikey)) ? disqusjs.config.apikey[Math.floor(Math.random() * disqusjs.config.apikey.length)] : disqusjs.config.apikey;

        window.disqus_config = function () {
            this.page.url = disqusjs.config.url;
            this.page.identifier = disqusjs.config.identifier;
            this.page.title = disqusjs.config.title;
        };

        if (!disqusjs.sortType) {
            setLS('disqus.sort', 'desc');
            disqusjs.sortType = 'desc';
        }

        disqusjs.mode = localStorage.getItem('dsqjs_mode');
        disqusjs.sortType = localStorage.getItem('dsqjs_sort') || localStorage.getItem('disqus.sort');

    })(window, document, localStorage, config);
}
// attempt to export for CommonJS
try { module.exports = DisqusJS; } catch (e) { }