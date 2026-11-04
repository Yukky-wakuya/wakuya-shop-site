// おすすめ商品（specs/002-top-blog/data-model.md §3）。入れ替えはこのファイルと src/assets/recommend/ の画像だけで行う（FR-003、docs/updating.md）
// 価格・在庫はカラーミーショップを正とし、ここには書かない（開発原則III）
import type { ImageMetadata } from 'astro';
import akabeko from '../assets/recommend/recommend01.png';
import usagi from '../assets/recommend/recommend02.png';
import koma from '../assets/recommend/recommend03.png';
import pochi from '../assets/recommend/recommend04.png';

export interface RecommendedProduct {
  name: string;
  image: ImageMetadata;
  alt: string;
  /** カラーミーショップの商品ページ（?pid=）または商品グループのページ（?mode=grp&gid=） */
  url: string;
}

/** 「もっと見る」のリンク先（現行と同じ、おすすめ商品のグループ） */
export const recommendedMoreUrl = 'https://waku-8.shop-pro.jp/?mode=grp&gid=2935801';

export const recommended: RecommendedProduct[] = [
  { name: '会津張り子 赤べこ', image: akabeko, alt: '大きさ違いの赤べこを4つ重ねた張り子', url: 'https://waku-8.shop-pro.jp/?mode=grp&gid=2935798' },
  { name: '会津張り子 招福玉うさぎ', image: usagi, alt: '赤い耳と花の模様の白いうさぎの張り子', url: 'https://waku-8.shop-pro.jp/?mode=grp&gid=2935799' },
  // 現行のリンク先（?pid=177769279）は 2026-11-03 時点で 404（販売終了とみられる）。差し替える商品を店に確認するまで、おすすめのグループページへ
  { name: '蔵王木地玩具 野菜こま5種セット', image: koma, alt: 'なすやにんじんの形をした小さな木のこま5つ', url: recommendedMoreUrl },
  { name: '江戸千代紙 ぽち袋', image: pochi, alt: '鮮やかな色の模様のぽち袋4枚', url: 'https://waku-8.shop-pro.jp/?pid=177769621' },
];
