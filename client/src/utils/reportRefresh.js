// client/src/utils/reportRefresh.js
//
// Tiny "something changed" signal. Call notifyDataChanged() after ANY save
// (new event, edited event, new investor, new deal ...). An open Reports page
// listens and reloads itself, so the reports are always up to date.
 
const EVENT_NAME = "thg:data-changed";
 
export const notifyDataChanged = () => {
  window.dispatchEvent(new Event(EVENT_NAME));
};
 
export const onDataChanged = (callback) => {
  window.addEventListener(EVENT_NAME, callback);
  // also refresh when the person comes back to this tab (other admin edited)
  window.addEventListener("focus", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("focus", callback);
  };
};