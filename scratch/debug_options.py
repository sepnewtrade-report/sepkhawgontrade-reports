import yfinance as yf
t = yf.Ticker("WULF")
print("Options dates:", t.options)
if t.options:
    for d in t.options[:3]:
        opt = t.option_chain(d)
        calls = opt.calls
        print(f"Date: {d}")
        print("Calls shape:", calls.shape)
        if not calls.empty:
            print(calls[['strike', 'lastPrice', 'volume', 'openInterest']].head())
