// Momentum — pure indicator math. No DOM deps.
// ─── TECHNICAL INDICATORS ──────────────────────────────────────────────
function calcSMA(c,p){const v=[];for(let i=0;i<c.length;i++){if(i<p-1){v.push(null);continue}let s=0;for(let j=i-p+1;j<=i;j++)s+=c[j].c;v.push(s/p)}return v}
function calcRSI(c,p){const v=[null];if(c.length<2)return v;let g=0,l=0;for(let i=1;i<=p&&i<c.length;i++){const d=c[i].c-c[i-1].c;if(d>0)g+=d;else l-=d}v.push(g+l===0?50:100-100/(1+g/(l||0.001)));for(let i=p+1;i<c.length;i++){const d=c[i].c-c[i-1].c;g=(g*(p-1)+(d>0?d:0))/p;l=(l*(p-1)+(d<0?-d:0))/p;v.push(l===0?100:100-100/(1+g/l))}return v}
function calcMACD(c){const e12=[],e26=[];let s12=0,s26=0;for(let i=0;i<c.length;i++){if(i<12)s12+=c[i].c;if(i<26)s26+=c[i].c;if(i===11)e12.push(s12/12);else if(i>11)e12.push(c[i].c*(2/13)+e12[e12.length-1]*(11/13));else e12.push(null);if(i===25)e26.push(s26/26);else if(i>25)e26.push(c[i].c*(2/27)+e26[e26.length-1]*(25/27));else e26.push(null)}const m=[];for(let i=0;i<c.length;i++){m.push(e12[i]!==null&&e26[i]!==null?e12[i]-e26[i]:null)}return m}
function calcADX(c,p){const dx=[];for(let i=p;i<c.length;i++){const up=c[i].h-c[i-1].h,dn=c[i-1].l-c[i].l;const tr=Math.max(c[i].h-c[i].l,Math.abs(c[i].h-c[i-1].c),Math.abs(c[i].l-c[i-1].c));const pDM=up>dn&&up>0?up:0,mDM=dn>up&&dn>0?dn:0;const dP=pDM/(tr||1)*100,dM=mDM/(tr||1)*100;dx.push(Math.abs(dP-dM)/(dP+dM||1)*100)}const adx=[];for(let i=0;i<c.length;i++){if(i<p+p-1)adx.push(null);else{let s=0;for(let j=i-p+1;j<=i;j++)s+=dx[j-p]||0;adx.push(s/p)}}return adx}
function calcBB(c,p,mult){const sma=calcSMA(c,p),u=[],l=[];for(let i=0;i<c.length;i++){if(sma[i]===null){u.push(null);l.push(null);continue}let sq=0,cnt=0;for(let j=i-p+1;j<=i;j++){sq+=(c[j].c-sma[i])**2;cnt++}const std=Math.sqrt(sq/cnt);u.push(sma[i]+mult*std);l.push(sma[i]-mult*std)}return{upper:u,lower:l,mid:sma}}
function calcATR(c,p){const a=[];for(let i=0;i<c.length;i++){if(i<p){a.push(null);continue}let s=0;for(let j=i-p+1;j<=i;j++)s+=Math.max(c[j].h-c[j].l,Math.abs(c[j].h-c[j-1].c),Math.abs(c[j].l-c[j-1].c));a.push(s/p)}return a}

function pickSignal(rsi,macd,adx,above50){
  let s=0;if(rsi>45&&rsi<65)s++;if(macd>0)s++;if(adx>22)s+=0.5;if(above50)s++;if(rsi<35)s+=0.5;if(rsi>70||rsi<25)s-=0.5;
  return s>=2.5?'buy':s>=1?'neutral':'sell';
}

function analyze(ticker, name, sector, candles) {
  const c = candles, price = c[c.length-1].c;
  const s9=calcSMA(c,9), s20=calcSMA(c,20), s50=calcSMA(c,50), s200=calcSMA(c,200);
  const sma9=s9[s9.length-1]||price, sma20=s20[s20.length-1]||price, sma50=s50[s50.length-1]||price, sma200=s200[s200.length-1]||price;
  const rsiA=calcRSI(c,14), rsi=parseFloat(rsiA[rsiA.length-1]?.toFixed(1))||50;
  const macdA=calcMACD(c), macd=parseFloat(macdA[macdA.length-1]?.toFixed(2))||0;
  const adxA=calcADX(c,14), adx=parseFloat(adxA[adxA.length-1]?.toFixed(1))||20;
  const bb=calcBB(c,14,2), bbM=bb.mid[bb.mid.length-1]||price, bbU=bb.upper[bb.upper.length-1]||price, bbL=bb.lower[bb.lower.length-1]||price;
  const atrA=calcATR(c,14), atr=parseFloat(atrA[atrA.length-1]?.toFixed(2))||1;
  const volAvg=c.slice(-20).reduce((s,cc)=>s+cc.v,0)/20, volCur=c[c.length-1].v, volRatio=parseFloat((volCur/(volAvg||1)).toFixed(2));
  const recent=c.slice(-15), sup1=parseFloat((Math.min(...recent.map(x=>x.l))*0.995).toFixed(2)), sup2=parseFloat((sup1*0.97).toFixed(2));
  const res1=parseFloat((Math.max(...recent.map(x=>x.h))*1.005).toFixed(2)), res2=parseFloat((res1*1.03).toFixed(2));
  const rsiD=rsi>55?'bull':rsi<40?'bear':'neutral', macdD=macd>0?'bull':'bear', adxD=adx>25?'bull':'neutral';
  const pA9=price>sma9, pA20=price>sma20, pA50=price>sma50, pA200=price>sma200;
  const signal=pickSignal(rsi,macd,adx,pA50);
  const masAbove=[pA9,pA20,pA50,pA200].filter(Boolean).length;
  const maAlign=masAbove>=3?'BULL ALIGNED':masAbove===0?'BEAR ALIGNED':masAbove>=2?'PARTIAL BULL':'PARTIAL BEAR';
  const tp = parseFloat((price * 1.15).toFixed(2));
  const sl = parseFloat((price * 0.93).toFixed(2));
  return { ticker, name, sector, candles:c, price, sma9,sma20,sma50,sma200,maAlign,masAbove, rsi,macd,adx, bbU,bbM,bbL,atr, volAvg,volCur,volRatio, sup1,sup2,res1,res2, signal, rsiDir:rsiD,macdDir:macdD,adxDir:adxD, tp, sl, pA9,pA20,pA50,pA200 };
}

// ─── CHART DRAWING ──────────────────────────────────────────────────────
