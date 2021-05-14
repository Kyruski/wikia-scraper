const jsdom = require("jsdom");
const fetch = require('node-fetch');
const fs = require('fs');
const { JSDOM } = jsdom;

const allPages = [];
const navClass = 'mw-allpages-nav';
const bodyClass = 'mw-allpages-body';
const baseURL = 'https://ffxiclopedia.fandom.com';
const startingURL = 'https://ffxiclopedia.fandom.com/wiki/Special:AllPages';
const nextPageRegExp = /^[Nn]ext [Pp]age/;

const setPage = async (url) => {
  const response = await fetch(url);
  const text = await response.text();
  return await new JSDOM(text);
}

const scrapePages = async (url) => {
  url = url;
  let count = 5;
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
      let output = {
        title: el.innerHTML,
        url: el.href
      }
      allPages.push(output);
      // fs.appendFile('./output/allPages.csv')
    }
    console.log(nextPage);
    if (nextPage) {
      url = baseURL + nextPage;
    } else url = null;
  }
  fs.appendFile('./output/allPages.json', JSON.stringify({
    "allPages": allPages
  }), (err) => {
    if (err) {
      throw err;
    };
    console.log('done');
  })
  
}

scrapePages(startingURL);