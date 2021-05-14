const jsdom = require("jsdom");
const fetch = require('node-fetch');
const fs = require('fs');
const { JSDOM } = jsdom;

const allPages = {};
const navClass = 'mw-allpages-nav';
const bodyClass = 'mw-allpages-body';
const historyID = "ca-history"
const historyLinkClass = "mw-changeslist-date";
const baseURL = 'https://ffxiclopedia.fandom.com';
const startingURL = 'https://ffxiclopedia.fandom.com/wiki/Special:AllPages';
const nextPageRegExp = /^[Nn]ext [Pp]age/;
const cutOffDate = new Date(2010, 02, 23);
let failedFetches = [];

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
  'December': 11
}

const setPage = async (url) => {
  const response = await fetch(url);
  const text = await response.text();
  return await new JSDOM(text);
}

const scrapePages = async (url) => {
  url = url;
  while (url) {
    let pageDom = await setPage(url)
    let navContainer = await pageDom.window.document.getElementsByClassName(navClass);
    let bodyContainer = await pageDom.window.document.getElementsByClassName(bodyClass);
    let navLinks = navContainer[0].getElementsByTagName('a');
    let bodyLinks = bodyContainer[0].getElementsByTagName('a')
    let nextPage = null;
    for (let el of navLinks) {
      if (el.innerHTML.match(nextPageRegExp)) {
        nextPage = el.href;
        break;
      }
    }
    for  (let el of bodyLinks) {
      try {
        const checkOldLink = await grabOldPageLink(el.href);
        console.log(checkOldLink);
        if (checkOldLink) {
          allPages[el.href] = checkOldLink;
        }
      } catch (err) {
        console.log(err);
        failedFetches.push(el.href);
      }
    }
    console.log('NEW PAGE!!!! ', nextPage);
    if (nextPage) {
      url = baseURL + nextPage;
    } else url = null;
  }
  while (failedFetches.length) {
    let newFailedFetches = []
    for  (let el of failedFetches) {
      try {
        const checkOldLink = await grabOldPageLink(el.href);
        if (checkOldLink) {
          allPages[el.href] = checkOldLink;
        }
        
      } catch (err) {
        console.log(err);
        newFailedFetches.push(el.href);
      }
    }
    failedFetches = newFailedFetches;
  }
  fs.appendFile('./output/allPages.json', JSON.stringify(allPages), (err) => {
    if (err) {
      throw err;
    };
    console.log('done');
  })
  
}

const grabOldPageLink = async(url) => {
  const pageDom = await setPage(baseURL + url + '?offset=&limit=500&action=history')
  const historyList = await pageDom.window.document.getElementsByClassName(historyLinkClass);
  for (let el of historyList) {
    let pageDate = el.innerHTML.replace(',', '').replace(':', ' ').split(' ');
    let compareDate = new Date(pageDate[4], months[pageDate[3]], pageDate[2], pageDate[0], pageDate[1]);
    if (cutOffDate > compareDate) {
      return el.href;
    }
  }
  return null;
}

scrapePages(startingURL);