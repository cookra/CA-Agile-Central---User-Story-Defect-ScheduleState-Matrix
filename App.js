Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function () {
        this._whatDoYouNeedToSee();
    },
    _whatDoYouNeedToSee: function () {
        var query = [
            ['ScheduleState', '=', 'Backlog', 'or'],
            ['ScheduleState', '=', 'Defined', 'or'],
            ['ScheduleState', '=', 'In-Progress', 'or'],
            ['ScheduleState', '=', 'Completed', 'or'],
            ['ScheduleState', '=', 'Accepted', 'or'],
            ['ScheduleState', '=', 'Live']
        ];
        this._storeUserStories(query);
    },
    _storeUserStories: function (query) {
        var theQuery = '';
        for (var x = 0; x < query.length; x++) {
            for (var i = 0; i < query[x].length; i++) {
                theQuery += query[x][i] + ' ';
            }
        }
        Ext.create('Rally.data.wsapi.Store', { // create store on the App (via this) so the code above can test for it's existence!
            model: 'User Story',
            autoLoad: true, // <----- Don't forget to set this to true! heh
            filters: theQuery,
            limit: Infinity,
            listeners: {
                load: function (myStore, myData) {
                    console.log('>>>> Store RETURNING:', myStore);
                    this._storeDefects(myData, query);
                },
                scope: this // This tells the wsapi data store to forward pass along the app-level context into ALL listener functions
            },
            fetch: ['FormattedID', 'Name', 'ScheduleState'] // Look in the WSAPI docs online to see all fields available!
        });
    },
    _storeDefects: function (storyData, query) {
        var theQuery = '';
        for (var x = 0; x < query.length; x++) {
            for (var i = 0; i < query[x].length; i++) {
                theQuery += query[x][i] + ' ';
            }
        }
        Ext.create('Rally.data.wsapi.Store', { // create store on the App (via this) so the code above can test for it's existence!
            model: 'Defect',
            autoLoad: true, // <----- Don't forget to set this to true! heh
            filters: theQuery,
            limit: Infinity,
            listeners: {
                load: function (myStore, myData) {
                    console.log('>>>> Store RETURNING:', myStore);
                    this._build(storyData, myData);
                },
                scope: this // This tells the wsapi data store to forward pass along the app-level context into ALL listener functions
            },
            fetch: ['FormattedID', 'Name', 'ScheduleState'] // Look in the WSAPI docs online to see all fields available!
        });
    },
    _build: function (storyData, defectData) {
        var html = '';
        var tS = this._filter(storyData);
        var tD = this._filter(defectData);

        var tSt = tS.reduce(add, 0);
        var tDt = tD.reduce(add, 0);

        function add(a, b) {
            return a + b;
        }

        var tSs = this._sizer(tS, tSt, 'story');
        var tDs = this._sizer(tD, tDt, 'defect');

        html =
            '<table width="100%" border="0" class="table";>' +
            '<tbody>' +
            '<tr>' +
            '<td class="table-row-header flex1">Schedule State</td>' +
            '<td class="table-row-header-label-story">US (' + tSt + ')</td>' +
            '<td class="table-row-header-percentage-story">%</td>' +
            '<td class="table-row-header-label-defect">DE (' + tDt + ')</td>' +
            '<td class="table-row-header-percentage-defect">%</td>' +
            '</tr>' +
            '<tr>' +
            '<td class="table-row-label flex1">Backlog</td>' +
            '<td class="data-story">' + tS[0] + '</td>' +
            '<td class="graph-story">' + tSs[0] + '</td>' +
            '<td class="data-defect">' + tD[0] + '</td>' +
            '<td class="graph-defect">' + tDs[0] + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td class="table-row-label flex1">Defined</td>' +
            '<td class="data-story">' + tS[1] + '</td>' +
            '<td class="graph-story">' + tSs[1] + '</td>' +
            '<td class="data-defect">' + tD[1] + '</td>' +
            '<td class="graph-defect">' + tDs[1] + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td class="table-row-label flex1">In-Progress</td>' +
            '<td class="data-story">' + tS[2] + '</td>' +
            '<td class="graph-story">' + tSs[2] + '</td>' +
            '<td class="data-defect">' + tD[2] + '</td>' +
            '<td class="graph-defect">' + tDs[2] + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td class="table-row-label flex1">Completed</td>' +
            '<td class="data-story">' + tS[3] + '</td>' +
            '<td class="graph-story">' + tSs[3] + '</td>' +
            '<td class="data-defect">' + tD[3] + '</td>' +
            '<td class="graph-defect">' + tDs[3] + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td class="table-row-label green">Accepted</td>' +
            '<td class="data-story green">' + tS[4] + '</td>' +
            '<td class="graph-story green">' + tSs[4] + '</td>' +
            '<td class="data-defect green">' + tD[4] + '</td>' +
            '<td class="graph-defect green">' + tDs[4] + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td class="table-row-label green">Live</td>' +
            '<td class="data-story green">' + tS[5] + '</td>' +
            '<td class="graph-story green">' + tSs[5] + '</td>' +
            '<td class="data-defect green">' + tD[5] + '</td>' +
            '<td class="graph-defect green">' + tDs[5] + '</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>';
        this.add({
            xtype: 'panel',
            html: html,
            height: 196,
            bodyStyle: {
                "background-color": "#172643"
            },
        });
    },
    _filter: function (myData) {
        var tB, tD, tP, tC, tA, tL = 0;
        var tS = [];
        tB = this._filterWorker(myData, 'Backlog');
        tD = this._filterWorker(myData, 'Defined');
        tP = this._filterWorker(myData, 'In-Progress');
        tC = this._filterWorker(myData, 'Completed');
        tA = this._filterWorker(myData, 'Accepted');
        tL = this._filterWorker(myData, 'Live');
        tS = [tB, tD, tP, tC, tA, tL];
        return tS;
    },
    _filterWorker: function (myData, match) {
        var x = 0;
        for (var i = 0; i < myData.length; ++i) {
            if (myData[i].raw.ScheduleState === match) {
                console.log('tB: ', myData[i].raw.ScheduleState);
                x++;
            }
        }
        return x;
    },

    _sizer: function (myData, total, whatAmI) {
        var x = [];
        for (var i = 0; i < myData.length; ++i) {
            console.log('l ', i, total, myData[i], myData[i] / total * 100);
            var width = myData[i] / total * 100;
            width = width - width % 1;
            x[i] = '<div class="graph-wrapper"><div class="graph-numeric-' + whatAmI + '">' + width + '%</div><div class="graph-background"><div class="graph-' + whatAmI + '" style="width:' + width + 'px">&nbsp;</div></div></div></div>';

        }
        return x;
    },
});