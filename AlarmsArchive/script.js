// https://unpkg.com/tabulator-tables@4.8.2/dist/css/bootstrap/tabulator_bootstrap4.min.css

let finalDataArchiveFull = [];

var dateFilterEditor = function (cell, success, cancel) {
    var container = $('<span></span>');
    var start = $("<input type='date' placeholder='Start'/>");
    var end = $("<input type='date' placeholder='End'/>");

    container.append(start).append(end);

    var inputs = $('input', container);

    inputs.css({
        'padding': '4px',
        'width': '50%',
        'box-sizing': 'border-box'
    }).val(cell.getValue())

    function buildDateString() {
        return {
            start: start.val(),
            end: end.val()
        };
    }

    inputs.on('change blur', function (e) {
        success(buildDateString());
    });

    inputs.on('keydown', function (e) {
        if (e.keyCode == 13) {
            success(buildDateString());
        }

        if (e.keyCode == 27) {
            cancel();
        }
    });

    return container[0];
};

function dateFilterFunction(headerValue, rowValue, filterParams) {
    //headerValue - the value of the header filter element
    //rowValue - the value of the column in this row
    //filterParams - params object passed to the headerFilterFuncParams property

    var format = filterParams.format; //|| "DD.MM.YYYY";
    var start = moment(headerValue.start);
    var end = moment(headerValue.end + 1);
    var value = moment(rowValue, format);
    if (rowValue) {
        if (start.isValid()) {
            if (end.isValid()) {
                return value >= start && value <= end;
            } else {
                return value >= start;
            }
        } else {
            if (end.isValid()) {
                return value <= end;
            } else return value;
        }
    }

    return false
}

self.onInit = function () {
    var dashObject = self.ctx.stateController?.getEntityId();
    let stateObjects = self.ctx.stateController?.stateObject;
    let nowStateObject = self.ctx.stateController?.stateValue;

    if (stateObjects) {
        for (let i = 0; i < stateObjects.length; i++) {
            if (stateObjects[i].id === nowStateObject) {
                dashObject = stateObjects[i].params;
                break;
            }
        }
    }

    var funcKeys = {};
    for (let i = 0; i < self.ctx.widgetConfig.datasources[0].dataKeys.length; i++) {
        if (typeof self.ctx.widgetConfig.datasources[0].dataKeys[i].postFuncBody != 'undefined')
            funcKeys[self.ctx.widgetConfig.datasources[0].dataKeys[i].name] = self.ctx.widgetConfig.datasources[0].dataKeys[i].postFuncBody;
    }

    exT = $('#example-table');
    widgetAlias = '';
    columns = [];
    queryKeys = [];
    attributeTs = [];

    if (self.ctx.widgetConfig.datasources[0].name != 'function') {
        var widgetConfigKeys = self.ctx.widgetConfig.datasources[0].dataKeys;
        var widgetAlias = self.ctx.widgetConfig.datasources[0].entityAliasId;

        for (let i = 0; i < widgetConfigKeys.length; i++) {
            if (widgetConfigKeys[i].type === 'timeseries')
                attributeTs.push(widgetConfigKeys[i].name);

            queryKeys.push(widgetConfigKeys[i].name);
            defaultColumnParams = {
                title: widgetConfigKeys[i].label,
                field: widgetConfigKeys[i].name,
                align: 'center',
                headerFilter: 'input',
                headerFilterPlaceholder: '...',
                sorter: function (a, b) {
                    if (a == null || b == null) {
                        if (a == null && b != null) return -1;
                        if (a != null && b == null) return 1;

                        return a - b;
                    }
                    if (a.toString().indexOf('№') == -1) {
                        if (a.toString().toLowerCase() < b.toString().toLowerCase())
                            return -1;
                        if (a.toString().toLowerCase() == b.toString().toLowerCase())
                            return 0;
                        if (a.toString().toLowerCase() > b.toString().toLowerCase())
                            return 1;
                    }
                    if (isNaN(a) && a.match(/\d+/g) !== null) {
                        a = a.match(/\d+/g)[0];
                    }
                    if (isNaN(b) && b.match(/\d+/g) !== null) {
                        b = b.match(/\d+/g)[0];
                    }
                    return a - b
                }
            };
            if (widgetConfigKeys[i].label.toLowerCase().indexOf('статус') != -1) {
                defaultColumnParams.headerFilterFunc = '='
            }
            if (widgetConfigKeys[i].label.toLowerCase().indexOf('дата') != -1) {
                (defaultColumnParams.sorter = function (a, b) {
                    a = new Date(a);
                    b = new Date(b);
                    return a - b
                }),
                    (defaultColumnParams.headerFilter = dateFilterEditor);
                defaultColumnParams.headerFilterFunc = dateFilterFunction;
                defaultColumnParams.formatter = 'datetime';
                defaultColumnParams.formatterParams = {
                    outputFormat: 'DD.MM.YYYY HH:mm',
                    invalidPlaceholder: function (value) {
                        return value;
                    }
                };
            }
            columns.push(defaultColumnParams);
        }
    }

    $('.loading').hide();

    table = new Tabulator('#example-table', {
        persistence: true,
        maxHeight: '100%',
        initialSort: [{ column: 'ts', dir: 'desc' }],
        data: finalDataArchiveFull,
        layout: 'fitColumns', //fitDataTable fitData fitDataFill
        columns: columns,
    });

    table.extendModule('persistence', 'writers', {
        example: function (id, type, data) {
            localStorage.setItem(id + '-' + type, JSON.stringify(data));
        }
    });

    let storageFilters = JSON.parse(
        localStorage.getItem('tabulatorID' + '-' + 'headerFilters')
    );

    for (let i in storageFilters) {
        table.setHeaderFilterValue(i, storageFilters[i]);
    }

    setInterval(function () {
        let filters = {};
        for (let i in columns) {
            filters[columns[i].field] = table.getHeaderFilterValue(columns[i].field);
        }
        let nowFilters = JSON.parse(
            localStorage.getItem('tabulatorID' + '-' + 'headerFilters')
        );
        let changes = false;
        for (let i in filters) {
            if (typeof nowFilters[i] == 'undefined') {
                changes = true;
                continue;
            }
            if (filters[i] != nowFilters[i]) changes = true;
        }
        if (changes)
            localStorage.setItem('tabulatorID' + '-' + 'headerFilters', JSON.stringify(filters));
    }, 5000);

    // end onInit
};

self.onDataUpdated = function () {
    let data = [];
    for (let keyI = 0; keyI < self.ctx.data.length; keyI++) {
        let keyData = self.ctx.data[keyI];

        let key = keyData.dataKey.name;
        if (key == 'ts') continue;
        for (let i = 0; i < keyData.data.length; i++) {
            if (typeof data[i] == 'undefined') {
                data.push({ ts: new Date(keyData.data[i][0]) });
            }
            data[i][key] = keyData.data[i][1];
        }
    }
    table.replaceData(data);
};

self.onResize = function () { };

self.onDestroy = function () {
    table.destroy()
}

self.getDataKeySettingsSchema = function () {
    return TbFlot.datakeySettingsSchema(true, 'graph');
};
