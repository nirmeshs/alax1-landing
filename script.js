const params = new URLSearchParams(window.location.search);
["utm_source","utm_medium","utm_campaign","utm_content","utm_term","ref"].forEach(k=>{
  const el = document.getElementById(k);
  if (el) el.value = params.get(k) || "";
});
