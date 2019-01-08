let intervalHandle = null;

function finalizeNowOnAir() {
  console.log('Finalize now-on-air');
  clearInterval(intervalHandle);
  intervalHandle = null;
}

function initNowOnAir(channelId) {
  console.log(`Initialize now-on-air (${channelId})`);

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
    padding: '2px 0 2px 5px',
    'border-bottom': '1px solid #444',
  });
  changeStyles('.fR_i', {
    'font-size': '13px',
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
  async function fetchSlot(channelId) {
    try {
      const slots = await fetchSlots();
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

  // 番組情報のstatsを取得
  async function fetchStats(id) {
    if (!id) return null;

    try {
      const res = await fetch(`https://api.abema.io/v1/broadcast/slots/${id}/stats`, {
        mode: 'cors'
      });
      const json = await res.json();
      if (json.message) {
        // APIエラー
        console.log(json);
        return null;
      }
      return json.stats;
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
    currentSlot = await fetchSlot(channelId);
  }
  async function updateStats() {
    if (!currentSlot) return;
    const stats = await fetchStats(currentSlot.id);
    if (!stats) return;

    const twitterWrapper = document.querySelector('.com-o-CommentForm__twitter-wrapper');
    if (!twitterWrapper) return;

    const viewCount = stats.view;
    const commentCount = stats.comment;
    if (!isFinite(viewCount)) return;
    if (!isFinite(commentCount)) return;

    // 視聴数、コメント数の増分を計算
    // 視聴数、コメント数は一定時間ごとに加算されるため変わらない場合がある
    viewCountHistory.unshift(viewCount);
    commentCountHistory.unshift(commentCount);
    if (10 < viewCountHistory.length) viewCountHistory.pop();
    if (10 < commentCountHistory.length) commentCountHistory.pop();
    let v1 = viewCountHistory[0];
    let v2 = v1;
    for (const v of viewCountHistory) {
      if (v === 0) continue;
      if (v2 > v) {v2 = v; break}
    }
    let c1 = commentCountHistory[0];
    let c2 = c1;
    for (const c of commentCountHistory) {
      if (c === 0) continue;
      if (c2 > c) {c2 = c; break}
    }
    const diffViewCount = v1 - v2;
    const diffCommentCount = c1 - c2;

    // K単位で表示
    const viewCountStr = viewCount > 1000 ? ((viewCount / 1000).toFixed(1) + 'K') : viewCount;
    const commentCountStr = commentCount > 1000 ? ((commentCount / 1000).toFixed(1) + 'K') : commentCount;

    twitterWrapper.innerHTML = `視聴数 ${viewCountStr} (+${diffViewCount})`
      + `<br>ｺﾒﾝﾄ数 ${commentCountStr} (+${diffCommentCount})`;
  }
  intervalHandle = setInterval(async function() {
    await updateCurrentSlot();
    await updateStats();
  }, 5000);
  (async function() {
    await updateCurrentSlot();// 初回
    await updateStats();// 初回
  })();
  changeStyles('.com-o-CommentForm__twitter-wrapper', {
    'color': '#fff',
    'width': '140px',
    'font-size': '11px',
    'padding': '0',
    'cursor': 'auto',
  });
}
