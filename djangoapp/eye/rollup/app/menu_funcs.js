'use strict';

import * as ut from './utils';

export function get_row(opt)
{
    if ( opt.$trigger.length == 0 ) return;
    let $tr = $(opt.$trigger[0]);
    return $tr.closest('table').bootstrapTable('getRowByUniqueId', $tr.data('uniqueid'));
}

export function get_table(opt)
{
    if ( opt.$trigger.length == 0 ) return;
    let $tr = $(opt.$trigger[0]);
    return $tr.closest('table');
}
