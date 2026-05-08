with open('stock-dashboard.html', 'r') as f:
    html = f.read()

# 1. Add SMA9 to chart MA styles (between Bollinger and candle drawing)
old_ma_styles = """  [
    {k:'sma20',c:'#4caf50',d:[]},
    {k:'sma50',c:'#e8a846',d:[4,4]},
    {k:'sma200',c:'#ff6a00',d:[6,3,2,3]}
  ].forEach(ma=>{"""

new_ma_styles = """  [
    {k:'sma9',c:'#22d3ee',d:[2,2]},
    {k:'sma20',c:'#4caf50',d:[]},
    {k:'sma50',c:'#e8a846',d:[4,4]},
    {k:'sma200',c:'#ff6a00',d:[6,3,2,3]}
  ].forEach(ma=>{"""

if old_ma_styles in html:
    html = html.replace(old_ma_styles, new_ma_styles, 1)
    print('SMA9 added to chart MA styles')
else:
    print('WARN: MA styles not found')

# 2. Update chart label to include SMA9
old_label = "SMA20 SMA50 SMA200"
new_label = "SMA9 SMA20 SMA50 SMA200"
if old_label in html:
    html = html.replace(old_label, new_label)
    print('Label updated')
else:
    print('WARN: label not found')

# 3. Add SMA9 to the tech-summary pills (before SMA20)
old_pills_sma = "<span class=\"tech-pill \"+(d.priceAbove20?'bull':'bear')+\">SMA20 $"
new_pills_sma = "<span class=\"tech-pill \"+(d.priceAbove9?'bull':'bear')+\">SMA9 $"+'+d.sma9.toFixed(2)+\'</span><span class="tech-pill "+(d.priceAbove20?\'bull\':\'bear\')+"\">SMA20 $'
if old_pills_sma in html:
    html = html.replace(old_pills_sma, new_pills_sma, 1)
    print('SMA9 pill added')
else:
    print('WARN: SMA20 pill anchor not found')

# 4. Add SMA9 to metrics grid (before SMA20)
old_sma20_metric = "'<div class=\"metric-item\"><div class=\"metric-label\">SMA20</div><div class=\"metric-value \"+(d.priceAbove20?'bull':'bear')+\"\">$"+'+d.sma20.toFixed(2)+"</div></div>'+"
new_sma9_metric = "'<div class=\"metric-item\"><div class=\"metric-label\">SMA9</div><div class=\"metric-value \"+(d.priceAbove9?'bull':'bear')+\"\">$"+'+d.sma9.toFixed(2)+"</div></div>'+'<div class=\"metric-item\"><div class=\"metric-label\">SMA20</div><div class=\"metric-value \"+(d.priceAbove20?'bull':'bear')+\"\">$"+'+d.sma20.toFixed(2)+"</div></div>'+"
if old_sma20_metric in html:
    html = html.replace(old_sma20_metric, new_sma9_metric, 1)
    print('SMA9 metric added')
else:
    print('WARN: SMA20 metric not found')

# 5. Add sma9 to analyze return (before sma20)
old_analyze_sma = "sma20,sma50,sma200,maAlignment:maAlign,masAbove,"
new_analyze_sma = "sma9,sma20,sma50,sma200,maAlignment:maAlign,masAbove,"
if old_analyze_sma in html:
    html = html.replace(old_analyze_sma, new_analyze_sma, 1)
    print('SMA9 added to analyze return')
else:
    print('WARN: analyze sma not found')

# 6. Add sma9 calculation in analyze function (after sma200 line)
old_sma_calc = "  const s20=calcSMA(c,20), s50=calcSMA(c,50), s200=calcSMA(c,200);\n  const sma20=s20[s20.length-1]||price, sma50=s50[s50.length-1]||price, sma200=s200[s200.length-1]||price;"
new_sma_calc = "  const s9=calcSMA(c,9), s20=calcSMA(c,20), s50=calcSMA(c,50), s200=calcSMA(c,200);\n  const sma9=s9[s9.length-1]||price, sma20=s20[s20.length-1]||price, sma50=s50[s50.length-1]||price, sma200=s200[s200.length-1]||price;"
if old_sma_calc in html:
    html = html.replace(old_sma_calc, new_sma_calc, 1)
    print('SMA9 calc added to analyze')
else:
    print('WARN: analyze sma calc not found')

# 7. Add priceAbove9 in analyze function
old_above = "  const bbPos=price>bbM?'upper':'lower', pA20=price>sma20, pA50=price>sma50, pA200=price>sma200;"
new_above = "  const bbPos=price>bbM?'upper':'lower', pA9=price>sma9, pA20=price>sma20, pA50=price>sma50, pA200=price>sma200;"
if old_above in html:
    html = html.replace(old_above, new_above, 1)
    print('priceAbove9 added')
else:
    print('WARN: priceAbove not found')

# 8. Update masAbove to include sma9
old_mas = "const masAbove=[pA20,pA50,pA200].filter(Boolean).length;"
new_mas = "const masAbove=[pA9,pA20,pA50,pA200].filter(Boolean).length;"
if old_mas in html:
    html = html.replace(old_mas, new_mas, 1)
    print('masAbove updated')
else:
    print('WARN: masAbove not found')

# 9. Update return to include priceAbove9 and sma9
old_ret = "bbPos,priceAbove20:pA20,priceAbove50:pA50,priceAbove200:pA200,"
new_ret = "bbPos,priceAbove9:pA9,priceAbove20:pA20,priceAbove50:pA50,priceAbove200:pA200,sma9,"
if old_ret in html:
    html = html.replace(old_ret, new_ret, 1)
    print('Return values updated')
else:
    print('WARN: return values not found')

# 10. Update redrawCardChart to include sma9
old_redraw_sma = "var sma20 = calcSMA(d.candles, 20).slice(-n);\n    var sma50 = calcSMA(d.candles, 50).slice(-n);\n    var sma200 = calcSMA(d.candles, 200).slice(-n);"
new_redraw_sma = "var sma9 = calcSMA(d.candles, 9).slice(-n);\n    var sma20 = calcSMA(d.candles, 20).slice(-n);\n    var sma50 = calcSMA(d.candles, 50).slice(-n);\n    var sma200 = calcSMA(d.candles, 200).slice(-n);"
if old_redraw_sma in html:
    html = html.replace(old_redraw_sma, new_redraw_sma, 1)
    print('Redraw SMA9 added')
else:
    print('WARN: redraw sma not found')

# 11. Update drawChart call in redraw
old_redraw_call = "drawChart(cv, candles, { sma20: sma20, sma50: sma50, sma200: sma200, bbUpper: bbU, bbLower: bbL, bbMid: bbM, pattern: pat });"
new_redraw_call = "drawChart(cv, candles, { sma9: sma9, sma20: sma20, sma50: sma50, sma200: sma200, bbUpper: bbU, bbLower: bbL, bbMid: bbM, pattern: pat });"
if old_redraw_call in html:
    html = html.replace(old_redraw_call, new_redraw_call, 1)
    print('Redraw call updated')
else:
    print('WARN: redraw call not found')

# 12. Update initial drawChart call
old_init_call = "drawChart(cv,d.chartCandles,{sma20,sma50,sma200,bbUpper:bbU,bbLower:bbL,bbMid:bbM,pattern:d.pattern});"
new_init_call = "drawChart(cv,d.chartCandles,{sma9:calcSMA(d.candles,9).slice(-55),sma20,sma50,sma200,bbUpper:bbU,bbLower:bbL,bbMid:bbM,pattern:d.pattern});"
# Actually let me find the exact line first
print('--- checking init drawChart call ---')
idx = html.find('drawChart(cv,d.chartCandles,{sma20,sma50,sma200')
if idx >= 0:
    segment = html[idx:idx+150]
    print(repr(segment))
    # Replace it
    old_init = html[idx:html.find(');', idx)+2]
    new_init = old_init.replace('{sma20,sma50,sma200', '{sma9:calcSMA(d.candles,9).slice(-55),sma20,sma50,sma200')
    html = html.replace(old_init, new_init, 1)
    print('Initial drawChart call updated')
else:
    print('WARN: init drawChart call not found')

with open('stock-dashboard.html', 'w') as f:
    f.write(html)
print('All SMA9 patches applied!')
