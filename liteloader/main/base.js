window.onload = (function () {
    window.addEventListener('message', async (e) => {
        if (e.data.message === 'FriendsUIReady') {
            liteloaderDebugInfo("Inject Steam Client start! Loading config");
            const _temp = await fetch('liteloader/config.json');
            const liteloaderConfig = await _temp.json();
            window.Liteloader = liteloaderConfig;
            if (liteloaderConfig.enable === false) {
                liteloaderDebugInfo('Liteloader is disabled');
                return;
            }
            liteloaderDebugInfo('Config Loaded! Loading Plugins:');
            console.log(liteloaderConfig.plugins);

            window.Liteloader.Plugins = new Array();
            for (let x of liteloaderConfig.plugins) {
                await loadPluginInfo(x);
            }


            const handler = {
                get(target, prop, receiver) {
                    const AllCaller = getCaller().slice(-3);

                    //const caller = AllCaller[AllCaller.length - 1];
                    //console.log(AllCaller);

                    if (AllCaller.some(x => x.includes("https://steamloopback.host/"))) {
                        if (AllCaller.some(x => x.includes("/liteloader/plugins"))) {
                            console.log('Some plugin wanna use Steam API, but it was refused.', AllCaller);
                            return null;
                        }
                    } else {
                        if (!liteloaderConfig.debug) {
                            console.log("Some unknow code use Steam API, it's not safety, it was refused.\nIf you are developer, change liteloader/config.json, set 'debug' to true.", AllCaller);
                            return null;
                        }
                    }

                    return Reflect.get(target, prop, receiver);
                }
            };

            function getCaller() {
                const error = new Error();
                const stack = error.stack;
                const line = stack.split('\n');
                return line;
            }

            const SteamClientTemp = SteamClient;
            SteamClient = new Proxy(SteamClientTemp, handler);

            const MainWindowBrowserManagerTemp = MainWindowBrowserManager;
            MainWindowBrowserManager = new Proxy(MainWindowBrowserManagerTemp, handler);

            const SteamUIStoreTemp = SteamUIStore;
            SteamUIStore = new Proxy(SteamUIStoreTemp, handler);

            liteloaderDebugInfo("Protect Steam API done!");

            liteloaderDebugInfo("Start inject plugins to Share");

            for (const x of window.Liteloader.Plugins) {
                const needJs = x.injectors.share?.js;
                if (needJs) {
                    for (const js of needJs) {
                        const jsElement = document.createElement("script");
                        jsElement.src = "liteloader/plugins/" + x.packName + "/js/" + js;
                        jsElement.async = true;
                        document.body.appendChild(jsElement);
                    };
                }
                liteloaderDebugInfo(x.name + " Inject Share done!");
            }

            liteloaderDebugInfo("Start inject plugins to MainWindow");

            for (const x of window.Liteloader.Plugins) {
                const needJs = x.injectors.mainWindow?.js;
                const needCss = x.injectors.mainWindow?.css;

                if (needJs) {
                    for (const js of needJs) {
                        const jsElement = document.createElement("script");
                        jsElement.src = "liteloader/plugins/" + x.packName + "/js/" + js;
                        jsElement.async = true;
                        SteamUIStore.m_WindowStore.SteamUIWindows[0].m_BrowserWindow.document.body.appendChild(jsElement);
                    };
                }
                if (needCss) {
                    for (const css of needCss) {
                        const cssElement = document.createElement("link");
                        cssElement.rel = "stylesheet";
                        cssElement.type = "text/css";
                        cssElement.href = "liteloader/plugins/" + x.packName + "/css/" + css;
                        SteamUIStore.m_WindowStore.SteamUIWindows[0].m_BrowserWindow.document.body.appendChild(cssElement);
                    };
                }
            };
        }
    })
});

async function loadPluginInfo(pluginName) {
    const pluginJson = await fetch("liteloader/plugins/" + pluginName + "/info.json");
    if (pluginJson.status === 404) {
        liteloaderDebugInfo(pluginName + 'not found!');
        return;
    }

    const plugin = await pluginJson.json();
    window.Liteloader.Plugins.push(plugin);
    liteloaderDebugInfo('Plugin ' + plugin.name + " is loaded!");
}

function liteloaderDebugInfo(log) {
    console.log('%c %s ', 'background-color: black; color: white; font-weight: 600;', '[Liteloader]', log);
}