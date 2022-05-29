
function getBrowser(){
    // In Opera
    if ((navigator.userAgent.includes("Opera"))) {
    return "opera";
   }
   // In MSIE
   else if ((navigator.userAgent.includes("MSIE"))) {
    return "ie";
   }
   // In Chrome
   else if ((navigator.userAgent.includes('Chrome'))) {
    return "chrome";
   }
   // In Safari
   else if ((navigator.userAgent.includes("Safari"))) {
    return "safari";
   }
   // In Firefox
   else if ((navigator.userAgent.includes("Firefox"))) {
    return "firefox";
   }
   // In most other browsers, "name/version" is at the end of userAgent 
   else {
    return "other";
   }
   
}

function getOS(){
if ((navigator.userAgent.includes("Linux"))) {
    return "linux";
}
if ((navigator.userAgent.includes("Windows"))) {
    return "windows";
}
}
  

export { getBrowser, getOS }