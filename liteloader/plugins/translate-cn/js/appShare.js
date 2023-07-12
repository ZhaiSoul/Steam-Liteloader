const dataBase = {
    "730": "反恐精英：全球攻势",
    "232090": "杀戮地带2",
    "274940": "深海惊魂",
    "108710": "心灵杀手",
    "1172470": "Apex：英雄"
}

const gameList = appStore.allApps;
console.log(gameList);

for(let game of gameList) {
    const cnName = dataBase[game.appid];
    if(cnName) {
        game.display_name = cnName;
    }
}

// 根据中文名称进行排序
appStore.allApps.sort(function(a,b) {
    return a['display_name'].localeCompare(b['display_name']);
});

