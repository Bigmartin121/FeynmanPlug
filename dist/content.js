chrome.runtime.onMessage.addListener((e,r,n)=>{if(e.type==="GET_PAGE_CONTENT"){const t=document.body.innerText;n({content:t})}return!0});
