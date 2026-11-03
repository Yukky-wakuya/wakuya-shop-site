import { test } from 'node:test';
import assert from 'node:assert/strict';
import { htmlToMarkdown, decodeEntities } from './html-to-markdown.ts';

const md = (html: string) => htmlToMarkdown(html).markdown;

test('段落は空行で区切り、空の段落と間隔用の要素は捨てる', () => {
  assert.equal(
    md('<p class="wp-block-paragraph">一つ目</p>\n\n\n\n<p class="wp-block-paragraph"></p>\n<div style="height:20px" aria-hidden="true" class="wp-block-spacer"></div>\n<p>二つ目</p>'),
    '一つ目\n\n二つ目\n',
  );
});

test('<br> は強制改行', () => {
  assert.equal(md('<p>上の行<br>下の行</p>'), '上の行\\\n下の行\n');
});

test('<strong> は太字', () => {
  assert.equal(md('<p>来る<strong>令和８年3月30日を</strong>もちまして</p>'), '来る**令和８年3月30日を**もちまして\n');
});

test('文字色を付けた段落は太字にする', () => {
  assert.equal(md('<p class="has-vivid-red-color has-text-color wp-block-paragraph">大事なお知らせ</p>'), '**大事なお知らせ**\n');
});

test('現行サイトの記事へのリンクは新しいサイトの同じ記事へ', () => {
  assert.equal(md('<p><a href="https://waku-8.com/213/">ご挨拶</a></p>'), '[ご挨拶](/213/)\n');
  assert.equal(md('<p><a href="https://waku-8.com/contact/">お問い合わせ</a></p>'), '[お問い合わせ](/contact/)\n');
});

test('外部リンクはそのまま、中身のないリンクは捨てる', () => {
  assert.equal(md('<p>商品は<a href="https://waku-8.shop-pro.jp/?pid=1" target="_blank">こちら</a></p>'), '商品は[こちら](https://waku-8.shop-pro.jp/?pid=1)\n');
  assert.equal(md('<p>本文<a href="https://example.com/"><br></a></p>\n<p><a href="https://example.com/"></a></p>'), '本文\n');
});

test('リスト', () => {
  assert.equal(md('<ul class="wp-block-list">\n<li><strong>お電話：</strong> 024-922-1250</li>\n\n<li>メール</li>\n</ul>'), '- **お電話：** 024-922-1250\n- メール\n');
});

test('本文の画像は保存する画像の一覧に加え、相対パスで参照する', () => {
  const result = htmlToMarkdown(
    '<div class="wp-block-image"><figure class="aligncenter"><img width="683" height="1024" src="https://waku-8.com/wp-content/uploads/2023/12/a-683x1024.jpg" alt="" srcset="https://waku-8.com/wp-content/uploads/2023/12/a-scaled.jpg 1707w" /></figure></div>',
  );
  assert.equal(result.markdown, '![](./photo-1.jpg)\n');
  assert.deepEqual(result.images, [{ file: 'photo-1.jpg', url: 'https://waku-8.com/wp-content/uploads/2023/12/a-scaled.jpg', alt: '' }]);
});

test('YouTube の埋め込みは nocookie 版の HTML と、下にリンク', () => {
  const out = md(
    '<figure class="wp-block-embed is-provider-youtube"><div class="wp-block-embed__wrapper">\n<iframe loading="lazy" title="帰ってきました郡山" width="500" height="281" src="https://www.youtube.com/embed/ETi7UXgAwuI?feature=oembed" frameborder="0" allowfullscreen></iframe>\n</div></figure>',
  );
  assert.equal(
    out,
    '<div class="embed" data-visual-mask><iframe src="https://www.youtube-nocookie.com/embed/ETi7UXgAwuI" title="帰ってきました郡山" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div>\n\n[YouTube で見る：帰ってきました郡山](https://www.youtube.com/watch?v=ETi7UXgAwuI)\n',
  );
});

test('HTML 実体参照を文字に戻し、全角空白は残す', () => {
  assert.equal(decodeEntities('A&amp;B &#8217; &lt;x&gt; &#x3042;'), 'A&B ’ <x> あ');
  assert.equal(md('<p>　　有限会社 和久屋</p>'), '　　有限会社 和久屋\n');
});

test('Markdown として特別な意味を持つ文字は逃がす', () => {
  assert.equal(md('<p>*印は[注]です</p>'), '\\*印は\\[注\\]です\n');
});
