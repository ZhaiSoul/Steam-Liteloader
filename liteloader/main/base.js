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
                console.log(x);
                await loadPluginInfo(x);
            }


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