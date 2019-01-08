// ページ遷移時、以下の要素の属性が変化する
const targetNode = document.querySelector('#announcer');

function finalize() {
  finalizeNowOnAir();
}

const observer = new MutationObserver(function(/*mutationsList*/) {
  const path = window.location.toString().match(/^https:\/\/abema.tv\/(.+)$/)[1]
  const pathList = path.split('/');

  finalize();
  switch(pathList[0]) {
  case 'now-on-air':
    const channelId = pathList[1];
    initNowOnAir(channelId);
    break;
  case 'timetable':
    initTimetable(channelId);
    break;
  }
});
observer.observe(targetNode, {
  attributes: true
});
