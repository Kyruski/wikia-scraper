const jsdom = require("jsdom");
const fetch = require('node-fetch');
const { JSDOM } = jsdom;

const allPages = [];
const navClass = 'mw-allpages-nav';
const navBody = 'mw-allpages-body';
const startingURL = 'https://ffxiclopedia.fandom.com/wiki/Special:AllPages';

const setPage = async (url) => {
  const response = await fetch(url);
  const text = await response.text();
  return await new JSDOM(text);
}

const scrapePages = async (url) => {
  let pageDom = await setPage(url)
  let navContainer = await pageDom.window.document.getElementsByClassName(navClass);
  console.log(await navContainer);
  // console.log(await pageDom.window.document.getElementsByTagName('a')[0].innerHTML)
}

scrapePages(startingURL);