import { checker, notificator, callAPI } from './general.js';

checker()

$(document).ready(function () {
    $('#searchField').on('input', function () {
        const searchTerm = $(this).val().toLowerCase()
        $('.resultManagement').each(function () {
            $(this).find('tbody tr').each(function () {
                let rowContainsTerm = false
                $(this).find('td').each(function () {
                    const cellText = $(this).text().toLowerCase()
                    if (cellText.includes(searchTerm)) {
                        rowContainsTerm = true
                        return false
                    }
                });

                if (rowContainsTerm) {
                    $(this).show()
                } else {
                    $(this).hide()
                }
            });
        });
    });

    callAPI(
        'GET',
        '/api/results/list',
        function () {
            $('#resultManagements').empty().append(`
                <div class="small-item-center">
                    <div class="loader"></div>
                </div>
            `)
        },
        function (event) {
            $('#resultManagements').empty().append(`
                <table class="mb-0 table table-striped resultManagement">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Analyzer</th>
                            <th>Reference</th>
                            <th>Match Count</th>
                            <th>Execution Count</th>
                            <th>Logs</th>
                        </tr>
                    </thead>
                    <tbody id="resultManagementTable">
                    </tbody>
                </table>
            `)
            const responseData = JSON.parse(event.responseText)
            for (let index = 0; index < responseData.data.length; index++) {
                const element = responseData.data[index];
                $('#resultManagementTable').append(`
                    <tr id="ruleManagementRowOfSQLI_${element.id}">
                        <th>${element.id}</th>
                        <td>${element.analyzer}</td>
                        <td>${element.reference}</td>
                        <td class="text-danger"><strong>${element.match_count}</strong></td>
                        <td class="text-primary"><strong>${element.execution_count}</strong></td>
                        <td>
                            <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#resultLogsModal" data-rule-name="${element.reference}" data-type="${String(element.analyzer).toLowerCase()}" onclick=getResultLogs(this)>
                                <i class="fa fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `)
            }
            setInterval(function () {
                callAPI(
                    'GET',
                    '/api/results/list',
                    function () { },
                    function (event) {
                        $('#resultManagements').empty().append(`
                            <table class="mb-0 table table-striped resultManagement">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Analyzer</th>
                                        <th>Reference</th>
                                        <th>Match Count</th>
                                        <th>Execution Count</th>
                                        <th>Logs</th>
                                    </tr>
                                </thead>
                                <tbody id="resultManagementTable">
                                </tbody>
                            </table>
                        `)
                        $('#progressStream').empty()
                        const responseData = JSON.parse(event.responseText)
                        for (let index = 0; index < responseData.data.length; index++) {
                            const element = responseData.data[index];
                            $('#resultManagementTable').append(`
                                <tr id="ruleManagementRowOfSQLI_${element.id}">
                                    <th>${element.id}</th>
                                    <td>${element.analyzer}</td>
                                    <td>${element.reference}</td>
                                    <td class="text-danger"><strong>${element.match_count}</strong></td>
                                    <td class="text-primary"><strong>${element.execution_count}</strong></td>
                                    <td>
                                        <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#resultLogsModal" data-rule-name="${element.reference}" data-type="${String(element.analyzer).toLowerCase()}" onclick=getResultLogs(this)>
                                            <i class="fa fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `)
                            $('#progressStream').append(`
                                <div class="progress mt-4">
                                    <div class="progress-bar progress-bar-animated bg-danger progress-bar-striped" role="progressbar" style="width: ${element.match_count}%;">Match Count</div>
                                    <div class="progress-bar progress-bar-animated bg-primary progress-bar-striped" role="progressbar" style="width: ${element.execution_count}%;">Execution Count</div>
                                </div>
                                <div class="text-center">${element.reference}</div>
                            `)
                        }
                    },
                    function () { }
                )
            }, 1000)
        },
        function (event) {
            const responseError = JSON.parse(event.responseText)
            if (event.status == 404) {
                $('#resultManagements').empty().append(`
                    <div class="item-center">
                        <p>Empty</p>
                    </div>
                `)
            }
            else {
                $('#resultManagements').empty().append(`
                    <div class="item-center">
                        <p>Error</p>
                    </div>
                `)
                notificator('Error', responseError.reason, 'error')
            }
        }
    )

    $('#emptyButton').on('click', function () {
        const ruleName = document.getElementById('emptyButton').getAttribute('data-rule-name')
        const type = document.getElementById('emptyButton').getAttribute('data-type')
        callAPI(
            'DELETE',
            `/api/results/empty-errorlogs/${ruleName}?type=${type}`,
            function () {
                $('#emptyButton').empty().append(`
                    <div class="loader"></div>
                `).attr('disabled', true)
            },
            function () {
                $('#emptyButton').empty().text('Empty Logs').removeAttr('disabled')
                $('#resultLogsModalBody').empty().append(`
                    <div class="item-center">
                        Empty
                    </div>
                `)
            },
            function (error) {
                $('#emptyButton').empty().text('Empty Logs').removeAttr('disabled')
                const responseError = JSON.parse(error.responseText)
                notificator('Error', responseError.reason, 'error')
            }
        )
    })
})