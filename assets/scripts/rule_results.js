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
                            <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#resultLogsModal" data-id="${element.id}" onclick=getResultLogs(this)>
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
                                        <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#resultLogsModal" data-id="${element.id}" onclick=getResultLogs(this)>
                                            <i class="fa fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
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
})