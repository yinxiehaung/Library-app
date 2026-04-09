import requests
from bs4 import BeautifulSoup
import urllib.parse
import time # 導入時間模組，翻頁時稍作停頓以免被封鎖
from flask import request
from flask_restx import Resource, Namespace

scraper_ns = Namespace('scraper', description='東華圖書館翻頁爬蟲 API')

@scraper_ns.route('/scrape')
class ScrapeNDHU(Resource):
    @scraper_ns.doc('scrape_ndhu_multi_page')
    def get(self):
        """爬取多頁東華大學圖書館館藏"""
        # 1. 取得搜尋關鍵字與要抓取的總頁數
        keyword = request.args.get('q', 'C語言')
        total_pages_to_fetch = int(request.args.get('pages', 3)) # 預設抓 3 頁
        encoded_keyword = urllib.parse.quote(keyword)
        
        all_books = []
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        try:
            # 2. 開始翻頁迴圈
            for page in range(total_pages_to_fetch):
                start_index = page * 10 # 每一頁跳 10 筆
                
                # 構造帶有 start 參數的 URL
                url = f"https://books-lib.ndhu.edu.tw/toread/opac/search?q={encoded_keyword}&max=&view=CONTENT&level=all&material_type=all&location=&start={start_index}"
                
                print(f"正在爬取第 {page + 1} 頁: {url}")
                
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                items = soup.find_all('li', class_='is_img')
                
                # 如果這一頁沒資料了，就提早跳出迴圈
                if not items:
                    break

                for item in items:
                    # --- 萃取邏輯 (維持不變) ---
                    title_container = item.find('li', class_='reslt_item_head')
                    title = title_container.find('a').text.strip() if title_container and title_container.find('a') else "未知書名"
                    
                    author_tag = item.find('span', class_='crs_author')
                    author = author_tag.text.strip() if author_tag else "未知作者"
                
                    img_container = item.find('div', class_='img_reslt')
                    img_tag = img_container.find('img') if img_container else None
                    if img_tag and img_tag.has_attr('src'):
                        raw_url = img_tag['src']
                        # 如果是相對路徑，補上東華大學的網域
                        if raw_url.startswith('/'):
                            image_url = f"https://books-lib.ndhu.edu.tw{raw_url}"
                        else:
                            image_url = raw_url
                    else:
                        image_url = ""                    # ISBN 處理
                    
                    isbn = "無 ISBN"
                    isbn_span = item.find('span', class_='crs_isbn')
                    if isbn_span and isbn_span.parent:
                        isbn = isbn_span.parent.text.replace(isbn_span.text, '').strip()

                    # 館藏狀態處理
                    avail_container = item.find('li', class_='avail_inf')
                    availability = " | ".join([a.text.strip() for a in avail_container.find_all('a')]) if avail_container else "未知狀態"
                
                    all_books.append({
                        "title": title,
                        "author": author,
                        "image_url": image_url,
                        "isbn": isbn,
                        "availability": availability,
                        "source_page": page + 1 # 標記這是第幾頁抓到的
                    })
                
                # 💡 重要：翻頁之間停頓 0.5 秒，避免學校伺服器覺得你在攻擊它
                time.sleep(0.5)

            return {
                "status": "success", 
                "count": len(all_books), 
                "data": all_books
            }, 200        
            
        except Exception as e:
            return {"status": "error", "message": f"爬蟲翻頁失敗: {str(e)}"}, 500
