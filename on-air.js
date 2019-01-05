// CSSを変更
function changeStyles(selector, props) {
  for (const styleSheet of document.styleSheets) {
    const styles = styleSheet.cssRules || styleSheet.rules;
    for (const style of styles) {
      if (style.selectorText === selector) {
        for (const prop of Object.keys(props)) {
          style.style[prop] = props[prop];
        }
      }
    }
  }
}

// コメントのスタイルを変更
changeStyles('.pJ_i', {
  padding: '0 0 0 5px',
  'border-top': '1px solid #888',
});
changeStyles('.fR_i', {
  'font-size': '14px',
});

// 番組一覧を取得
async function fetchSlots() {
  try {
    const res = await fetch(`https://api.abema.io/v1/broadcast/slots`, {
      mode: 'cors'
    });
    const json = await res.json();
    return json.slots;
  } catch(e) {
    console.error(e);
    return null;
  }
}

// 番組一覧から現在のチャンネルの番号情報を取得
async function fetchCurrentSlot() {
  try {
    const slots = await fetchSlots();
    const channelId = window.location.toString().match(/\/([^/]+)$/)[1];
    for (const slot of slots) {
      if (slot.channelId === channelId) {
        return slot;
      }
    }
  } catch(e) {
    console.error(e);
    return null;
  }
}

// 番組情報を取得
async function fetchSlot(id) {
  if (!id) return null;

  try {
    const res = await fetch(`https://api.abema.io/v1/broadcast/slots/${id}`, {
      mode: 'cors'
    });
    const json = await res.json();
    if (json.message) {
      // APIエラー
      console.log(json);
      return null;
    }
    return json.slot;
  } catch(e) {
    console.error(e);
    return null;
  }
}

// 視聴数、コメント数をTwitter連携ボタン部分に表示
let currentSlot = null;
let viewCountHistory = [];
let commentCountHistory = [];
async function updateCurrentSlot() {
  currentSlot = await fetchCurrentSlot();
}
async function updateStats() {
  if (!currentSlot) return;
  const slot = await fetchSlot(currentSlot.id);
  if (!slot) return;

  const twitterWrapper = document.querySelector('.com-o-CommentForm__twitter-wrapper');
  if (!twitterWrapper) return;

  const viewCount = slot.stats.view;
  const commentCount = slot.stats.comment;
  if (viewCount == null) return;
  if (commentCount == null) return;

  // 視聴数、コメント数の増分を計算
  // 視聴数、コメント数は一定時間ごとに加算されるため変わらない場合がある
  viewCountHistory.unshift(viewCount);
  commentCountHistory.unshift(commentCount);
  if (10 < viewCountHistory.length) viewCountHistory.pop();
  if (10 < commentCountHistory.length) commentCountHistory.pop();
  let v1 = viewCountHistory[0];
  let v2 = v1;
  for (const v of viewCountHistory) {
    if (v2 !== v) {v2 = v; break}
  }
  let c1 = commentCountHistory[0];
  let c2 = c1;
  for (const c of commentCountHistory) {
    if (c2 !== c) {c2 = c; break}
  }
  const diffViewCount = v1 - v2;
  const diffCommentCount = c1 - c2;

  // K単位で表示
  const viewCountStr = viewCount > 1000 ? ((viewCount / 1000).toFixed(1) + 'K') : viewCount;
  const commentCountStr = commentCount > 1000 ? ((commentCount / 1000).toFixed(1) + 'K') : commentCount;

  twitterWrapper.innerHTML = `視聴数: ${viewCountStr} (+${diffViewCount})`
    + `<br>コメント数: ${commentCountStr} (+${diffCommentCount})`;
}
setInterval(updateCurrentSlot, 10000);
setInterval(updateStats, 5000);
setTimeout(updateCurrentSlot, 0);  // 初回
setTimeout(updateStats, 1000);  // 初回
changeStyles('.com-o-CommentForm__twitter-wrapper', {
  'color': '#fff',
  'width': '140px',
  'font-size': '11px',
  'padding': '0',
  'cursor': 'auto',
});
