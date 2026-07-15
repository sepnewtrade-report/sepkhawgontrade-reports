import requests
from bs4 import BeautifulSoup
import json

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def parse_yahoo_table(url):
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, 'html.parser')
    
    rows = []
    
    # Try to find all table rows
    table = soup.find('table')
    if table:
        headers_list = [th.text.strip() for th in table.find_all('th')]
        for tr in table.find_all('tr')[1:]:
            cells = [td.text.strip() for td in tr.find_all('td')]
            if cells:
                rows.append(dict(zip(headers_list, cells)))
    else:
        # Fallback parsing
        for tr in soup.find_all('tr'):
            cells = [td.text.strip() for td in tr.find_all('td')]
            if cells:
                rows.append(cells)
                
    return rows

print("GAINERS:")
gainers = parse_yahoo_table("https://finance.yahoo.com/markets/stocks/premarket-gainers")
print(json.dumps(gainers[:15], indent=2))

print("LOSERS:")
losers = parse_yahoo_table("https://finance.yahoo.com/markets/stocks/premarket-losers")
print(json.dumps(losers[:15], indent=2))
