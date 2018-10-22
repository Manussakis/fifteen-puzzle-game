
/**
 * addEventListener wrapper
 *
 * @param {Element|Window} target Target Element
 * @param {string} type Event name to bind to
 * @param {Function} callback Event callback
 * @param {boolean} [capture] Capture the event
 */
export function $on( target, type, callback, capture ) {
	target.addEventListener( type, callback, !!capture );
}

/**
* Write the inner HTML in the DOM element.
*
* @param {object} el - DOM element.
* @param {string} text - The text to bo inserted in the element.
*/
export function $writeInnerHTML ( el, text ) {
	el.innerHTML = text;
}
