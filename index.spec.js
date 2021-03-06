'use strict';

const fs = require('fs');
const nock = require('nock');
const sqrap = require('./index');

const selectors = {
  authorName: [
    {
      selector: 'span.author-name',
      text: true
    }
  ],
  authorUrl: [
    {
      selector: 'span.author-name > a',
      attribute: 'href'
    }
  ],
  title: [
    {
      selector: 'h1',
      text: 'true'
    }
  ],
  text: [
    {
      selector: '.content > p',
      text: true
    },
    {
      selector: '.extra-content > p',
      text: true
    }
  ],
  image: [
    {
      selector: 'meta[property="og:image"]',
      attribute: 'content'
    }
  ],
  html: [
    {
      selector: '.main-container > div.content',
      html: true
    },
    {
      selector: '.main-container > div.extra-content',
      html: true
    }
  ]
};

describe('Scrapes the website info based on a selectors object', () => {
  test('Test that the scraper extracted the proper content from the html page', async () => {
    nock('https://example.com')
      .defaultReplyHeaders({
        'Content-Type': 'text/html'
      })
      .get('/')
      .reply(200, () => fs.createReadStream('./mock.html'));

    const content = await sqrap('https://example.com/', { selectors });

    expect(content.authorName).toEqual('John');
    expect(content.authorUrl).toEqual('https://example.com/author/john');
    expect(content.title).toEqual('Title');
    expect(content.text).toEqual('This is a paragraph with a link.This is extra.');
    expect(content.image).toEqual('https://cdn.example.com/someimage');
    expect(content.html).toEqual(
      '\n        <p>This is a paragraph with a <a href="https://example.com/somelink">link</a>.\n      </p>\n          <p>This is extra.\n        </p>'
    );

    nock.cleanAll();
  });

  test('Test that the scraper throws an error when the content type is not "text/html"', async () => {
    nock('https://example.com')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })
      .get('/')
      .reply(200, { status: 'ok' });

    try {
      await sqrap('https://example.com/', { selectors });
    } catch (error) {
      expect(error.message).toEqual('Unsupported content type application/json');
    }

    nock.cleanAll();
  });

  test('Test that the scraper throws an error when the response status code is not 200', async () => {
    nock('https://example.com')
      .get('/')
      .reply(500);

    try {
      await sqrap('https://example.com/', { selectors });
    } catch (error) {
      expect(error.message).toEqual('Http status code 500');
    }

    nock.cleanAll();
  });

  test('Test that the scraper throws an error when the response status code is not 200', async () => {
    nock('https://example.com')
      .get('/')
      .reply(500);

    try {
      await sqrap('https://example.com/', { selectors });
    } catch (error) {
      expect(error.message).toEqual('Http status code 500');
    }

    nock.cleanAll();
  });
});
