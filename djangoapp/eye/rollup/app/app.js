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
	console.log('$tableEl = %O, paneId = %O, $tabEl = %O', $tableEl, paneId, $tabEl);
	$tabEl.find('div.spin').remove();
	console.log('param = %O', param);
	let total = param.rows.length || 0, filtered = $tabEl.find('span.badge').data('filtered') || 0;
	$tabEl.find('span.badge').remove();
	$tabEl.append(` <span data-total="${total}" class="badge badge-secondary">${total}</span>`);
    }
}

function setupNormal()
{
    let $tableEl = $('#events-table');
    let columns = buildColumns($tableEl),
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

function setupError()
{
    let $tableEl = $('#errors-table');
    let columns = buildColumns($tableEl),
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

$(function() {
    console.log('loaded app.js');
    setupNormal();
    setupError();

    $('.delete-btn').click(ev => {
	let $tableEl = $($(ev.target).closest('div.tab-pane').find('table.table')),
	    selected = $tableEl.bootstrapTable('getSelections')
	console.log('selected = %O', selected);
    });
})
