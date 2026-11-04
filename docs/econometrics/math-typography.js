/* Journal-style mathematical typesetting for the econometrics courses. */
(()=>{'use strict';
if(window.__econAcademicMathInitialized)return;
window.__econAcademicMathInitialized=true;
const formulas=new Map([
['ATE=E[Y(1)−Y(0)]；ATT=E[Y(1)−Y(0)|D=1]',"\\mathrm{ATE}=\\mathbb E[Y(1)-Y(0)],\\qquad\\mathrm{ATT}=\\mathbb E[Y(1)-Y(0)\\mid D=1]"],
['观测均值差 = ATT + 未处理潜在结果的选择偏差',"\\mathbb E[Y\\mid D=1]-\\mathbb E[Y\\mid D=0]=\\mathrm{ATT}+\\bigl(\\mathbb E[Y(0)\\mid D=1]-\\mathbb E[Y(0)\\mid D=0]\\bigr)"],
['b₁=Σ(xᵢ−x̄)(yᵢ−ȳ)/Σ(xᵢ−x̄)²；R²=1−SSE/SST',"\\widehat b_1=\\frac{\\sum_i(x_i-\\bar x)(y_i-\\bar y)}{\\sum_i(x_i-\\bar x)^2},\\qquad R^2=1-\\frac{\\mathrm{SSE}}{\\mathrm{SST}}"],
['bₓ=(x′M_Zx)⁻¹x′M_Zy；M_Z=I−Z(Z′Z)⁻¹Z′',"\\widehat b_x=(x^\\top M_Zx)^{-1}x^\\top M_Zy,\\qquad M_Z=I-Z(Z^\\top Z)^{-1}Z^\\top"],
['P=X(X′X)⁻¹X′；P²=P；P′=P；M=I−P',"P=X(X^\\top X)^{-1}X^\\top,\\quad P^2=P,\\quad P^\\top=P,\\quad M=I-P"],
['∂E[y|x,z]/∂x=β₁+β₃z；x*=−β₁/(2β₂)',"\\frac{\\partial\\mathbb E[y\\mid x,z]}{\\partial x}=\\beta_1+\\beta_3z,\\qquad x^*=-\\frac{\\beta_1}{2\\beta_2}"],
['W=(Rb−r)′[R V̂(b) R′]⁻¹(Rb−r)',"W=(R\\widehat b-r)^\\top[R\\widehat V(b)R^\\top]^{-1}(R\\widehat b-r)"],
['b−β=(X′X/n)⁻¹(X′u/n) →p Q⁻¹E[xu]',"\\widehat b-\\beta=(X^\\top X/n)^{-1}(X^\\top u/n)\\xrightarrow{p}Q^{-1}\\mathbb E[xu]"],
['√n(b−β) →d N(0,V)；(bⱼ−βⱼ)/SÊ(bⱼ) →d N(0,1)',"\\sqrt n(\\widehat b-\\beta)\\xrightarrow{d}\\mathcal N(0,V),\\qquad \\frac{\\widehat b_j-\\beta_j}{\\widehat{\\mathrm{SE}}(\\widehat b_j)}\\xrightarrow{d}\\mathcal N(0,1)"],
['V̂_HC1=n/(n−k)·(X′X)⁻¹[Σxᵢxᵢ′eᵢ²](X′X)⁻¹',"\\widehat V_{\\mathrm{HC1}}=\\frac{n}{n-k}(X^\\top X)^{-1}\\left[\\sum_i x_ix_i^\\top\\widehat u_i^2\\right](X^\\top X)^{-1}"],
['Ŝ_cluster=n⁻¹Σ_g(Σ_i∈g xᵢeᵢ)(Σ_i∈g xᵢeᵢ)′',"\\widehat S_{\\mathrm{cluster}}=\\frac1n\\sum_g\\left(\\sum_{i\\in g}x_i\\widehat u_i\\right)\\left(\\sum_{i\\in g}x_i\\widehat u_i\\right)^\\top"],
['Var̂[g(b)]=G(b)′V̂(b)G(b)',"\\widehat{\\operatorname{Var}}[g(b)]=G(b)^\\top\\widehat V(b)G(b)"],
['VIFⱼ=1/(1−Rⱼ²)；hᵢᵢ=xᵢ′(X′X)⁻¹xᵢ',"\\mathrm{VIF}_j=\\frac{1}{1-R_j^2},\\qquad h_{ii}=x_i^\\top(X^\\top X)^{-1}x_i"],
['plim b_遗漏=β+γCov(x,a)/Var(x)',"\\operatorname{plim}\\widehat b_{\\mathrm{short}}=\\beta+\\gamma\\frac{\\operatorname{Cov}(x,a)}{\\operatorname{Var}(x)}"],
['β_IV=Cov(z,y)/Cov(z,x)；Wald=Δ_Z E(Y)/Δ_Z E(D)',"\\beta_{\\mathrm{IV}}=\\frac{\\operatorname{Cov}(z,y)}{\\operatorname{Cov}(z,x)},\\qquad \\mathrm{Wald}=\\frac{\\Delta_Z\\mathbb E(Y)}{\\Delta_Z\\mathbb E(D)}"],
['θ̂=argmin ḡ(θ)′Wḡ(θ)；J=n ḡ′Ŝ⁻¹ḡ →d χ²(L−K)',"\\widehat\\theta=\\underset{\\theta}{\\arg\\min}\\,\\bar g(\\theta)^\\top W\\bar g(\\theta),\\qquad J=n\\bar g^\\top\\widehat S^{-1}\\bar g\\xrightarrow{d}\\chi^2_{L-K}"],
['b_2SLS=(X′P_ZX)⁻¹X′P_Zy',"\\widehat b_{\\mathrm{2SLS}}=(X^\\top P_ZX)^{-1}X^\\top P_Zy"],
['H₀:β=β₀ ⇒ E[Z(Y−β₀X−α)]=0',"H_0:\\beta=\\beta_0\\quad\\Longrightarrow\\quad\\mathbb E[Z(Y-\\beta_0X-\\alpha)]=0"],
['ℓ(β)=Σ[yᵢxᵢ′β−log(1+exp(xᵢ′β))]；V̂=Â⁻¹B̂Â⁻¹/n',"\\ell(\\beta)=\\sum_i[y_ix_i^\\top\\beta-\\log(1+\\exp(x_i^\\top\\beta))],\\qquad\\widehat V=\\widehat A^{-1}\\widehat B\\widehat A^{-1}/n"],
['AMEⱼ=n⁻¹Σβⱼpᵢ(1−pᵢ)',"\\mathrm{AME}_j=\\frac1n\\sum_i\\beta_jp_i(1-p_i)"],
['E[Y|X]=exp(X′β)；sᵢ=xᵢ[Yᵢ−exp(xᵢ′β)]',"\\mathbb E[Y\\mid X]=\\exp(X^\\top\\beta),\\qquad s_i=x_i[Y_i-\\exp(x_i^\\top\\beta)]"],
['ρτ(u)=u[τ−1(u<0)]；bτ=argminΣρτ(yᵢ−xᵢ′b)',"\\rho_\\tau(u)=u[\\tau-\\mathbf1\\{u<0\\}],\\qquad\\widehat b_\\tau=\\underset b{\\arg\\min}\\sum_i\\rho_\\tau(y_i-x_i^\\top b)"],
['(Y(0),Y(1)) ⟂ D | X；0<e(X)<1',"(Y(0),Y(1))\\perp D\\mid X,\\qquad0<e(X)<1"],
['ψ=m₁−m₀+D(Y−m₁)/e−(1−D)(Y−m₀)/(1−e)',"\\psi=m_1-m_0+\\frac{D(Y-m_1)}e-\\frac{(1-D)(Y-m_0)}{1-e}"],
['y_it−ȳ_i=β′(x_it−x̄_i)+(u_it−ū_i)',"y_{it}-\\bar y_i=\\beta^\\top(x_{it}-\\bar x_i)+(u_{it}-\\bar u_i)"],
['Δy_it=ρΔy_i,t−1+Δu_it；E[y_i,t−sΔu_it]=0，s≥2',"\\Delta y_{it}=\\rho\\Delta y_{i,t-1}+\\Delta u_{it},\\qquad\\mathbb E[y_{i,t-s}\\Delta u_{it}]=0,\\quad s\\ge2"],
['ATT=(Ȳ_T,post−Ȳ_T,pre)−(Ȳ_C,post−Ȳ_C,pre)',"\\mathrm{ATT}=(\\bar Y_{T,\\mathrm{post}}-\\bar Y_{T,\\mathrm{pre}})-(\\bar Y_{C,\\mathrm{post}}-\\bar Y_{C,\\mathrm{pre}})"],
['y_it=α_i+λ_t+Σ_{k≠−1}β_k·1(t−G_i=k)+u_it',"y_{it}=\\alpha_i+\\lambda_t+\\sum_{k\\ne-1}\\beta_k\\mathbf1\\{t-G_i=k\\}+u_{it}"],
['ATT(g,t)=E[Y_t−Y_g−1|G=g]−E[Y_t−Y_g−1|G=∞]',"\\mathrm{ATT}(g,t)=\\mathbb E[Y_t-Y_{g-1}\\mid G=g]-\\mathbb E[Y_t-Y_{g-1}\\mid G=\\infty]"],
['min_w (X₁−X₀w)′V(X₁−X₀w)，w≥0，Σw=1',"\\underset w{\\min}\\ (X_1-X_0w)^\\top V(X_1-X_0w),\\quad w\\ge0,\\quad\\sum_jw_j=1"],
['τ_FRD=Δ_c E(Y|R)/Δ_c E(D|R)',"\\tau_{\\mathrm{FRD}}=\\frac{\\Delta_c\\mathbb E(Y\\mid R)}{\\Delta_c\\mathbb E(D\\mid R)}"],
['τ̂_bc=τ̂−Biaŝ(τ̂)；区间需计入偏差估计变异',"\\widehat\\tau_{\\mathrm{bc}}=\\widehat\\tau-\\widehat{\\operatorname{Bias}}(\\widehat\\tau)"],
['Δy_t=α(y_t−1−θx_t−1)+Σφ_jΔy_t−j+Σψ_jΔx_t−j+ε_t',"\\Delta y_t=\\alpha(y_{t-1}-\\theta x_{t-1})+\\sum_j\\phi_j\\Delta y_{t-j}+\\sum_j\\psi_j\\Delta x_{t-j}+\\varepsilon_t"],
['k=max{i:p_(i)≤iq/m}；拒绝排序前k项',"k=\\max\\{i:p_{(i)}\\le iq/m\\}"],
['E[(D−m(X)){Y−l(X)−θ(D−m(X))}]=0',"\\mathbb E[(D-m(X))\\{Y-\\ell(X)-\\theta(D-m(X))\\}]=0"],
['多重插补总方差T=W+(1+1/M)B；复现差异Δ=本次结果−原文结果',"T=W+\\left(1+\\frac1M\\right)B"]
]);
const notes = new Map([
  ['τ̂_bc=τ̂−Biaŝ(τ̂)；区间需计入偏差估计变异','区间估计还需要计入偏差估计本身的变异。'],
  ['k=max{i:p_(i)≤iq/m}；拒绝排序前k项','按排序后的检验p值拒绝前k个原假设。'],
  ['多重插补总方差T=W+(1+1/M)B；复现差异Δ=本次结果−原文结果','复现差异：Δ = 本次结果 − 原文结果。']
]);
function normalize(){
  for(const el of document.querySelectorAll('main .formula,main .equation,article .formula,article .equation')){
    if(el.dataset.econMathDone||el.querySelector('pre,code,math,svg,mjx-container'))continue;
    el.dataset.econMathDone='1';
    const raw=(el.textContent||'').trim();const mapped=formulas.get(raw);
    if(mapped){
      let tex=mapped;
      if(tex.length>130 && tex.includes('\\qquad')){
        const pieces=tex.split('\\qquad');
        tex='\\begin{aligned}'+pieces.map(p=>p.replace('=','&=')).join('\\[0.7ex]')+'\\end{aligned}';
      }
      el.textContent='\\begin{equation}'+tex+'\\end{equation}';
      el.classList.add('econ-math-display');
      if(notes.has(raw)){
        const p=document.createElement('p');
        p.className='econ-equation-note';
        p.textContent=notes.get(raw);
        el.insertAdjacentElement('afterend',p);
      }
    }
    else if(raw.startsWith('\\[')&&raw.endsWith('\\]')){el.textContent='\\begin{equation}'+raw.slice(2,-2)+'\\end{equation}';el.classList.add('econ-math-display');}
    else if(raw.startsWith('$$')&&raw.endsWith('$$')){el.textContent='\\begin{equation}'+raw.slice(2,-2)+'\\end{equation}';el.classList.add('econ-math-display');}
    else if(raw.startsWith('\\begin{'))el.classList.add('econ-math-display');
    else if(/^\S.+[=≠≤≥∑Σ∫∂βγλθρτ√²³₀-₉]/u.test(raw)&&!/[。！？]/u.test(raw))el.classList.add('econ-math-unconverted');
    else el.classList.add('econ-math-prose');
  }
}
const src=document.currentScript?.src||new URL('../math-typography.js',location.href).href;
function start(){
  const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('math-typography.css?v=20261104',src).href;document.head.appendChild(css);
  normalize();
  window.MathJax={tex:{inlineMath:[['\\(','\\)'],['$','$']],displayMath:[['\\[','\\]'],['$$','$$']],processEscapes:true,processEnvironments:true,tags:'ams',tagSide:'right',tagIndent:'1em'},svg:{fontCache:'global'},options:{skipHtmlTags:['script','noscript','style','textarea','pre','code']}};
  const loader=document.createElement('script');loader.src='https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js';loader.async=true;loader.onerror=()=>{document.documentElement.dataset.econMathStatus='load-error';};document.head.appendChild(loader);
}
if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();