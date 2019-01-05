// ページ遷移時、以下の要素の属性が変化する
const targetNode = document.querySelector('#announcer');

const observer = new MutationObserver(function(/*mutationsList*/) {
  const path = window.location.toString().match(/^https:\/\/abema.tv\/(.+)$/)[1]
  const pathList = path.split('/');
  switch(pathList[0]) {
  case 'now-on-air':
    const channelId = pathList[1];
    finalizeNowOnAir();
    initNowOnAir(channelId);
    break;
  }
});
observer.observe(targetNode, {
  attributes: true
});
