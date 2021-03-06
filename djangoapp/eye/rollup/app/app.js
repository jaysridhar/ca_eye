'use strict';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { timeSince } from './myfuncs';
import * as ut from './utils';
import { get_row, get_table } from './menu_funcs';
import { make_refresh_func, prepare_event } from './app_utils';

dayjs.extend(utc);

function buildColumns($tableEl, titlesArr)
{
    const dataFormatter = (value, row) => value,
	  dateFormatter = (value, row) => dayjs(value.replace('(:\d\d)\.\d+Z.*','$1'), 'YYYY-MM-DD"T"HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
    let columns = [{ field: "id",
		     title: "ID",
		     sortable: true },
		   { field: "session_id",
		     title: "Session",
		     sortable: true },
		   { field: "category",
		     title: "Category",
		     sortable: true },
		   { field: "name",
		     title: "Name",
		     sortable: true },
		   { field: 'data',
		     title: 'Data',
		     formatter: dataFormatter,
		     sortable: true },
		   { field: 'error_mesg',
		     title: 'Error',
		     sortable: true },
		   { field: 'timestamp',
		     title: 'Timestamp',
		     formatter: dateFormatter,
		     sortable: true }];
    if ( !titlesArr ) titlesArr = columns.map(x => x.title);
    columns.forEach(item => {
	if ( titlesArr.find(title => title === item.title) ) item.visible = true
	else item.visible = false;
    });
    return [{ checkbox: true }].concat(columns);
}

function make_load_complete($tableEl)
{
    return function(param) {
	let $tabPane = $tableEl.closest('div.tab-pane'),
	    paneId = $tabPane.prop('id'),
	    $tabEl = $tabPane.closest('div.tab-content').prev('.nav-tabs').find(`a[href="#${paneId}"]`);
	$tabEl.find('div.spin').remove();
	let total = param.rows.length || 0, filtered = $tabEl.find('span.badge').data('filtered') || 0;
	$tabEl.find('span.badge').remove();
	$tabEl.append(` <span data-total="${total}" class="badge badge-secondary">${total}</span>`);
    }
}

function setupNormal(titlesArr)
{
    let $tableEl = $('#events-table');
    let columns = buildColumns($tableEl, titlesArr),
	deleteBtn = () => $('.delete-btn').prop('disabled', $tableEl.bootstrapTable('getSelections').length == 0),
	changeBtnState = row => deleteBtn();;
    $tableEl.bootstrapTable({
	columns: columns,
	uniqueId: 'id',
	sidePagination: 'server',
	ajax: make_refresh_func('/event?error=none', prepare_event),
	pagination: true,
	showColumns: true,
	clickToSelect: true,
	showColumnsSearch: true,
	showRefresh: true,
	search: true,
	showExtendedPagination: true,
	cookie: true,
	cookieIdTable: 'normal',
	cookieExpire: '7d',
	showMultiSort: true,
	sortPriority: [],
	rowStyle: (row, index) => {return { classes: 'show-completed-menu' }},
	onCheck: changeBtnState,
	onCheckAll: changeBtnState,
	onUncheck: changeBtnState,
	onUncheckAll: changeBtnState,
	onLoadSuccess: make_load_complete($tableEl),
    })
}

function setupError(titlesArr)
{
    let $tableEl = $('#errors-table');
    let columns = buildColumns($tableEl, titlesArr),
	updateBtn = () => $('.approved-btn').prop('disabled', $tableEl.bootstrapTable('getSelections').length == 0),
	changeBtnState = row => updateBtn();
    $tableEl.bootstrapTable({
	columns: columns,
	uniqueId: 'id',
	sidePagination: 'server',
	ajax: make_refresh_func('/event?error=show', prepare_event),
	pagination: true,
	showColumns: true,
	clickToSelect: true,
	showColumnsSearch: true,
	showRefresh: true,
	search: true,
	showExtendedPagination: true,
	cookie: true,
	cookieIdTable: 'errors',
	cookieExpire: '7d',
	showMultiSort: true,
	sortPriority: [],
	rowStyle: (row, index) => {return { classes: 'show-completed-menu' }},
	onCheck: changeBtnState,
	onCheckAll: changeBtnState,
	onUncheck: changeBtnState,
	onUncheckAll: changeBtnState,
	onLoadSuccess: make_load_complete($tableEl),
    })
}

function deleteFn(ev, $modal)
{
    let arr = $modal.find('tr[data-id]').get().map(el => parseInt($(el).data('id'))),
	$tableEl = $modal.data('tableEl');
    $modal
	.find('.apply-action')
	.prop('disabled', true)
	.append('<span> <div class="spinner-border spinner-border-sm"></div></span>');
    const doneFn = () => $modal.find('.apply-action').find('span').remove();
    $.ajax({
	method: 'DELETE',
	url: '/event',
	contentType: 'application/json',
	data: JSON.stringify(arr),
	headers: { 'X-CSRFToken': ut.getCookieValue('csrftoken') },
    }).done(function(resp, status, jqxhr) {
	$modal.find('div.output').empty().append(resp);
	$tableEl.bootstrapTable('refresh');
	doneFn();
	setTimeout(() => $modal.modal('hide'), 3000);
    }).fail(function(jqxhr, status) {
	console.log('fail(%O)', arguments);
	$modal.find('div.errors')
	    .empty()
	    .append(`<div class="text-red-500">${jqxhr.responseText}</div>`);
	doneFn();
    })
}

$(function() {
    setupNormal(['ID', 'Session', 'Category', 'Name', 'Date', 'Timestamp']);
    setupError(['ID', 'Session', 'Category', 'Name', 'Date', 'Error', 'Timestamp']);

    $('.delete-btn').click(ev => {
	let $tableEl = $($(ev.target).closest('div.tab-pane').find('table.table')),
	    selected = $tableEl.bootstrapTable('getSelections')
	fetch('/assets/templates/confirm-user.html')
	    .then(response => response.text())
	    .then(async function(page) {
		const str = ut.renderString(page, {
		    selected: selected,
		    question: 'Are you sure you want to <span class="text-red-600">delete</span> the following events?',
		});
		ut.doModal({
		    title: 'Delete Event(s)',
		    message: str,
		    okRequired: true,
		    sizeClass: 'modal-lg',
		    okText: 'Delete',
		    okAction: deleteFn,
		}).then($modal => $modal.data('tableEl', $tableEl));
	    })
    });
})
