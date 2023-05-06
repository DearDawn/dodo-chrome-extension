chrome.action.onClicked.addListener(tab => {
  console.log('[dodo] ', 'tab', tab)
  chrome.tabs.sendMessage(tab.id, { action: 'click' }, res => {
    // console.log('[dodo] ', 'res', res)
  });
});