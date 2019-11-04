function DisqusJS(config) {
    /*
     * Object.asign 的 Polyfill
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
     * Array.isArray 的 Polyfill
     */
    if (!Array.isArray) Array.isArray = (arg) => Object.prototype.toString.call(arg) === '[object Array]';

    ((window, document, localStorage, config) => {
        const $$ = (id) => document.getElementById(id);

        /*
         * msg(text)
         * 打印 Tip
         */
        const msg = (str) => {
            const msgEl = $$('dsqjs-msg');
            if (msgEl) msgEl.innerHTML = str;
        }
        /*
         * get(url)
         * 一个 Fetch 的包装
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
         * localStorage 存储
         */
        const setLS = (key, value) => {
            try {
                localStorage.setItem(key, value);
            } catch (e) { }
        };

        /*
         * formatDate(date)
         * 将传入的 UTC 日期格式化为 ${y}-${m}-${d} ${h}:${minute} format
         */
        const formatDate = (date) => {
            // 不足两位补 0
            const x = (input) => (input < 10) ? `0${input}` : input;
            // 将传入的 date 转化为时间戳
            date = Date.parse(new Date(date));

            // Disqus API 返回的是 UTC 时间，所以在时间戳上加 28800000 毫秒补上 8 小时时差
            date = new Date(date + 8 * 60 * 60 * 1000);
            const y = date.getFullYear();
            const m = x(date.getMonth() + 1);
            const d = x(date.getDate());
            const h = x(date.getHours());
            const minute = x(date.getMinutes());
            return `${y}-${m}-${d} ${h}:${minute}`;
        }

        /*
         * loadDisqus() - 加载/重载 Disqus
         */
        function loadDisqus() {
            if (window.DISQUS) {
                window.DISQUS.reset({
                    reload: true,
                    config: () => {
                        this.page.identifier = disqusjs.config.identifier;
                        this.page.url = disqusjs.config.url;
                        this.page.title = disqusjs.config.title;
                    }
                });
            } else {
                msg(`评论完整模式加载中...如果长时间无法加载，请针对 disq.us | disquscdn.com | disqus.com 启用代理，或使用 <a id="dsqjs-btn-force-dsqjs" class="dsqjs-msg-btn">评论基础模式</a>`);
                $$('dsqjs-btn-force-dsqjs').addEventListener('click', useDsqjs);

                const s = document.createElement('script');
                s.src = `https://${disqusjs.config.shortname}.disqus.com/embed.js`;
                s.setAttribute('data-timestamp', +new Date());
                (document.head || document.body).appendChild(s);
            }
        }

        /*
         * loadDisqus() - 加载 DisqusJS
         */
        function loadDsqjs() {
            msg(`评论基础模式加载中。如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并 <a id="dsqjs-btn-reload-disqus" class="dsqjs-msg-btn">尝试完整 Disqus 模式</a> | <a id="dsqjs-btn-force-disqus" class="dsqjs-msg-btn">强制完整 Disqus 模式</a>。`);
            $$('dsqjs-btn-reload-disqus').addEventListener('click', checkDisqus);
            $$('dsqjs-btn-force-disqus').addEventListener('click', useDisqus);
        }

        /*
         * checkDisqus()
         * 检查 Disqus 的可访问性
         */
        function checkDisqus() {
            $$('disqus_thread').innerHTML = `<div id="dsqjs"><div id="dsqjs-msg"></div></div>`;
            msg(`正在检查您是否能够访问 Disqus...`);

            const domain = ['disqus.com', `${disqusjs.config.shortname}.disqus.com`];
            let test = 0, success = 0;

            const checker = () => {
                if (domain.length === test && test === success) {
                    useDisqus();
                } else if (domain.length === test) {
                    useDsqjs();
                }
            }

            const runcheck = (domain) => {
                let img = new Image;
                const timeout = setTimeout(() => {
                    img.onerror = img.onload = null;
                    test++;
                    checker();
                }, 3000);

                img.onerror = () => {
                    clearTimeout(timeout);
                    test++;
                    checker();
                }

                img.onload = () => {
                    clearTimeout(timeout);
                    test++;
                    success++;
                    checker();
                }

                img.src = `https://${domain}/favicon.ico?${+(new Date)}`
            }

            for (let i of domain) {
                runcheck(i);
            }
        }

        /*
         * useDsqjs() - 强制使用 DisqusJS
         * useDisqus() - 强制使用 Disqus
         */
        function useDsqjs() {
            setLS('dsqjs_mode', 'dsqjs')
            loadDsqjs()
        }

        function useDisqus() {
            setLS('dsqjs_mode', 'disqus')
            loadDisqus()
        }

        let disqusjs = {};

        disqusjs.config = _extends({
            api: 'https://disqus.skk.moe/disqus/',
            identifier: document.location.origin + document.location.pathname + document.location.search,
            url: document.location.origin + document.location.pathname + document.location.search,
            title: document.title,
            nesting: parseInt(config.nesting) || 4
        }, config);

        let apikey = () => (Array.isArray(disqusjs.config.apikey)) ? disqusjs.config.apikey[Math.floor(Math.random() * disqusjs.config.apikey.length)] : disqusjs.config.apikey;

        window.disqus_config = function () {
            this.page.url = disqusjs.config.url;
            this.page.identifier = disqusjs.config.identifier;
            this.page.title = disqusjs.config.title;
        };

        disqusjs.mode = localStorage.getItem('dsqjs_mode');
        disqusjs.sortType = localStorage.getItem('dsqjs_sort') || localStorage.getItem('disqus.sort');

        $$('disqus_thread').innerHTML = `<div id="dsqjs"><div id="dsqjs-msg"></div></div>`

        if (!disqusjs.sortType) {
            setLS('dsqjs_sort', 'desc');
            disqusjs.sortType = 'desc';
        }
        if (disqusjs.mode === 'disqus') {
            loadDisqus();
        } else if (disqusjs.mode === 'dsqjs') {
            loadDsqjs();
        } else {
            checkDisqus();
        }

    })(window, document, localStorage, config);
}
// CommonJS
try { module.exports = DisqusJS; } catch (e) { }