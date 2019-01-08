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
}
