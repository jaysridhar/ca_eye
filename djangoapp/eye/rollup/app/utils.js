
export var nj = new nunjucks.Environment()
    .addFilter('sprintf', function(value, format) {
	return sprintf(format, value);
    })
    .addFilter('rreplace', function(value, regex, repl, kwargs) {
	kwargs = kwargs || {}
	return value.replace(new RegExp(regex, kwargs.flags || ''), repl);
    })
    .addFilter('formatNum', function(value, ndigits) {
	ndigits = ndigits || 0;
	return format_num(value, ndigits);
    })
    .addFilter('formatMoney', function(value, ndigits) {
	ndigits = ndigits || 0;
	return format_money(value, ndigits);
    })
    .addFilter('timeSince', function(date) {
	return timeSince(date);
    })
    .addFilter('fixUnicode', function(str) {
	return decodeURIComponent(escape(str));
    });

export function renderString(str, context, cb) { return nj.renderString(str, context, cb) }

export function makeid(N)
{
    /* From https://stackoverflow.com/a/19964557 */
    var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array(N).join().split(',').map(function() { return s.charAt(Math.floor(Math.random() * s.length)); }).join('');
}

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function readLocalFile(onloadCb, feedbackCb)
{
    var f = document.createElement('input');
    f.type = 'file';
    f.id = uuidv4();
    document.body.appendChild(f);
    $('#' + f.id).change(function(ev) {
	var reader = new FileReader();
	reader.onload = function(event) {
	    onloadCb(event.target.result, ev.target.files[0].name);
	}
	if ( feedbackCb ) feedbackCb();
	reader.readAsText(event.target.files[0]);
    });
    f.click();
    document.body.removeChild(f);
}

export async function doModal(options)
{
    let $modal = $(options.tmplEl || '#general-dialog');
    if ( $modal.length == 0 ) {
	await fetch('/assets/templates/modal.html')
	    .then(response => response.text())
	    .then(html => $('body').append(html));
	$modal = $(options.tmplEl || '#general-dialog');
    }
    $modal.find('.modal-dialog').removeClass('modal-lg modal-sm modal-xl');
    if ( options.sizeClass ) $modal.find('.modal-dialog').addClass(options.sizeClass)
    $modal.removeClass('modal-left modal-right modal-top modal-bottom modal-full');
    if ( options.whichSide ) $modal.addClass(options.whichSide)
    $modal.find('.modal-title').html(options.title);
    $modal.find('div.mesg-container').html(options.message);
    $modal.find('button.apply-action').text(options.okText);
    if ( options.okRequired ) $modal.find('button.apply-action').removeClass('d-none').addClass('d-block');
    else $modal.find('button.apply-action').removeClass('d-block').addClass('d-none');
    $modal.find('button.apply-action').unbind('click').prop('disabled', false);
    if ( options.okAction ) $modal.find('button.apply-action').bind('click', ev => options.okAction(ev, $modal));
    $modal.find('.modal-footer').removeClass('modal-footer-fixed');
    if ( options.fixedFooter ) $modal.find('.modal-footer').addClass('modal-footer-fixed');
    $modal.modal()
    return $modal
}

export function getCookieValue(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

export function downloadFromUrl(url, options)
{
    const a = document.createElement('a')
    options = options || {}
    a.href = url
    if ( options.newWindow ) a.target = '_blank'
    if ( options.name ) a.download = options.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

export function collectFormVars($form)
{
    let out = {}
    $form.find(':input').each(function(i, el) {
        var $el = $(el);
        if ( ! $el.prop('name') ) return;
        let name = $el.prop('name'),
	    eltype = $el.prop('type'),
	    dtype = $el.data('type');
        /* Skip these input types */
        if ( eltype === 'file' ) return;
        else if ( eltype === 'checkbox') {
            out[name] = $el.prop('checked') ? true : false;
        } else if ( eltype === 'radio') {
            if ( $el.prop('checked') ) out[name] = $el.val();
        } else {
	    let val = $el.val();
            if ( val ) out[name] = val;
            else out[name] = null;
        }
    });
    return out;
}
