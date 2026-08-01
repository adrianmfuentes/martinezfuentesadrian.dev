#!/usr/bin/env node

/**
 * Submits every URL in the live sitemap to the IndexNow API, which fans out
 * to Bing, Yandex, Seznam.cz and Naver in one call.
 * Run with: node scripts/submit-indexnow.js
 */

const SITE_URL = 'https://amf.amfserver.duckdns.org'
const INDEXNOW_KEY = '9afd77a021cceb38aa61b6147a789b0f'

async function main() {
  const sitemapRes = await fetch(`${SITE_URL}/sitemap.xml`)
  if (!sitemapRes.ok) {
    throw new Error(`Failed to fetch sitemap: ${sitemapRes.status}`)
  }
  const sitemapXml = await sitemapRes.text()
  const urlList = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])

  if (urlList.length === 0) {
    throw new Error('No URLs found in sitemap.xml')
  }

  console.log(`Submitting ${urlList.length} URLs to IndexNow...`)

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  })

  if (res.status === 200 || res.status === 202) {
    console.log(`IndexNow accepted the submission (status ${res.status}).`)
  } else {
    const body = await res.text().catch(() => '')
    throw new Error(`IndexNow rejected the submission: ${res.status} ${body}`)
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
