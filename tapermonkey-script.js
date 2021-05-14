// ==UserScript==
// @name     Redirect_FFXI_In_Wings_Era
// @author      Kyruski
// @version     2021.05.13
// @match        https://ffxiclopedia.fandom.com/*
// @description     Auto Redirect the FFXI Wikia to an in era edit for Wings of the Goddess
// @run-at      document-end
// ==/UserScript==
(async function () {
  const historyLinkClass = "mw-changeslist-date";
  const cutOffDate = new Date(2010, 02, 23);

  const months = {
    'January': 00,
    'February': 01,
    'March': 02,
    'April': 03,
    "May,": 04,
    'June': 05,
    'July': 06,
    'August': 07,
    'September': 08,
    'October': 09,
    'November': 10,
    'December': 11,
  }

  const setPage = async (url) => {
    const response = await fetch(url);
    const text = await response.text();
    return await new DOMParser().parseFromString(text, 'text/html');
  }

  const currentURL = window.location.href //define current URL
  if (!currentURL.includes('?oldid=')) {
    const pageDom = await setPage(currentURL + '?offset=&limit=500&action=history')
    const historyList = await pageDom.getElementsByClassName(historyLinkClass);
    for (let el of historyList) {
      let pageDate = el.innerHTML.replace(',', '').replace(':', ' ').split(' ');
      let compareDate = new Date(pageDate[4], months[pageDate[3]], pageDate[2], pageDate[0], pageDate[1]);
      if (cutOffDate > compareDate) {
        window.location.href = el.href;
        break;
      }
    }
  }
 //redirect URL if the current page is the ffxi Wikia and it has an in-era page
})();