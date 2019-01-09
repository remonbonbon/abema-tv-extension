function finalizeTimetable() {
  console.log('Finalize timetable');
}

function initTimetable() {
  console.log('Initialize timetable');

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

  // 番組表を縮小
  changeStyles('.c-tv-TimeTableContainer__body-timetable', {
    zoom: '0.8',  // CSS標準ではないので注意
  });
  changeStyles('.c-tv-TimeTableContainer__container-wrapper', {
    height: '125vh',
    width: '125vw',
  });
  // 左右矢印ボタンを消す
  changeStyles('.c-tv-TimeTableContainer__arrow-button-wrapper', {
    display: 'none',
  });
  // 現在時刻の線を常に表示
  changeStyles('.c-tv-TimeTableContainer__date-bar', {
    visibility: 'visible',
    opacity: '100',
  });
  changeStyles('.ew_b::before', {
    'border-top': '1px dashed #f0163a',
    width: '125%',
  });
}
