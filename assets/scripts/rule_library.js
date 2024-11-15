import { fetchData, notificator, checker, callAPI, convertFormToJSON } from "./general.js";

checker()

$(document).ready(function () {
    // Fetch filter
    function fetchAll() {
        fetchData(
            '/api/rules/rule-library?ruleType=true',
            'GET',
            null,
            function () {
                $('#ruleTypeFilter').empty().append(`<div class="loader"></div>`)
            },
            function (data) {
                $('#ruleTypeFilter').empty().append(`
                    <select class="mb-2 form-control-lg form-control" id="ruleType">
                        <option value="null">-----</option>
                    </select>
                `)
                const ruleTypeList = []
                for (let index = 0; index < data.data.length; index++) {
                    const element = data.data[index];
                    ruleTypeList.push(element)
                    if (element == 'SQLI') {
                        $('#ruleType').append(`<option value="${element}">SQL Injection (SQLI)</option>`)
                    }
                    else if (element == 'XSS') {
                        $('#ruleType').append(`<option value="${element}">Cross Site Scripting (XSS)</option>`)
                    }
                    else if (element == 'FU') {
                        $('#ruleType').append(`<option value="${element}">File Upload (FU)</option>`)
                    }
                    else {
                        $('#ruleType').append(`<option value="${element}">${element}</option>`)
                    }
                }
                $('#ruleType').on('change', function () {
                    for (let index = 0; index < ruleTypeList.length; index++) {
                        const element = ruleTypeList[index];
                        if ($('#ruleType').val() == 'null') {                        
                            $(`#cardOf${element}`).show()
                        }
                        else {
                            if ($('#ruleType').val() != element) {
                                $(`#cardOf${element}`).hide()
                            }
                            else {
                                $(`#cardOf${element}`).show()
                            }
                        }
                    }
                })
            },
            function () {
                $('#ruleTypeFilter').empty().append(`
                    <select class="mb-2 form-control-lg form-control" id="ruleType">
                        <option value="null">-----</option>
                    </select>
                `)
                notificator('Error', 'Can\'t fetch rule type from Rule Library!', 'error')
            }
        )
    
        fetchData(
            '/api/rules/rule-library',
            'GET',
            null,
            function () {
                $('#SQLI').empty().append(`
                    <div class="small-item-center">
                        <div class="loader"></div>
                    </div>
                `)
                $('#XSS').empty().append(`
                    <div class="small-item-center">
                        <div class="loader"></div>
                    </div>
                `)
                $('#FU').empty().append(`
                    <div class="small-item-center">
                        <div class="loader"></div>
                    </div>
                `)
            },
            function (response) {
                console.log(response);
                
                let sqliCounter = 0;
                let xssCounter = 0;
                let fuCounter = 0;
                let otherRuleType = []
                for (let index = 0; index < response.data.length; index++) {
                    const element = response.data[index];
                    if (element.rule_type == 'SQLI') {
                        sqliCounter++
                    }
                    else if (element.rule_type == 'XSS') {
                        xssCounter++
                    }
                    else if (element.rule_type == 'FU') {
                        fuCounter++
                    }
                    else {
                        otherRuleType.push(element.rule_type)
                    }
                }
                console.log(otherRuleType);
                
                const uniqueOtherRuleType = [...new Set(otherRuleType)]
                for (let index = 0; index < uniqueOtherRuleType.length; index++) {
                    const element = uniqueOtherRuleType[index];
                    $('#otherRuleTypeField').append(`
                        <div class="main-card mb-3 card" id="cardOf${element}">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-10">
                                        <h1 class="card-title medium-header">${element}</h1>
                                    </div>
                                    <div class="col-md-2 text-right">
                                        <button class="mb-2 mr-2 btn btn-danger" data-toggle="modal" data-target="#ruleDeleteAllModal" data-rule-type="${element}" onclick=deleteAll(this)>
                                            <i class="fa fa-trash"></i>
                                            Delete All
                                        </button>
                                    </div>
                                </div>
                                <div id="${element}" class="table-responsive">
                                    <table class="mb-0 table table-striped ruleLibraryTable">
                                        <thead>
                                            <tr>
                                                <th class="text-center">ID</th>
                                                <th class="text-center">Rule Type</th>
                                                <th>Rule Execution</th>
                                                <th>Rule Description</th>
                                                <th>Update</th>
                                                <th>Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody id="ruleLibraryTableOf${element}">
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    `)
                    for (let index = 0; index < response.data.length; index++) {
                        const otherElement = response.data[index];
                        if (element == otherElement.rule_type) {
                            $(`#ruleLibraryTableOf${element}`).append(`
                                <tr id="ruleManagementRowOf${element}_${otherElement.id}">
                                    <th class="text-center">${otherElement.id}</th>
                                    <td class="text-center">${otherElement.rule_type}</td>
                                    <td>${otherElement.rule_execution}</td>
                                    <td>${otherElement.rule_description}</td>
                                    <td>
                                        <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#ruleDetailsModal" data-id="${otherElement.id}" onclick=getRuleDetails(this)>
                                            <i class="fa fa-eye"></i>
                                        </button>
                                    </td>
                                    <td>
                                        <button class="mb-2 mr-2 btn btn-danger" data-toggle="modal" data-target="#ruleDeleteModal" data-id="${otherElement.id}" data-rule-type=${otherElement.rule_type} onclick=deleteRule(this)>
                                            <i class="fa fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `)
                        }
                    }
                }
                if (sqliCounter == 0) {
                    $('#SQLI').empty().append(`
                        <div class="item-center">
                            <p>Empty</p>
                        </div>
                    `)
                }
                else {
                    $('#SQLI').empty().append(`
                        <table class="mb-0 table table-striped ruleLibraryTable">
                            <thead>
                                <tr>
                                    <th class="text-center">ID</th>
                                    <th class="text-center">Rule Type</th>
                                    <th>Rule Execution</th>
                                    <th>Rule Description</th>
                                </tr>
                            </thead>
                            <tbody id="ruleLibraryTableOfSQLI">
                            </tbody>
                        </table>
                    `)
                    for (let index = 0; index < response.data.length; index++) {
                        const element = response.data[index];
                        if (element.rule_type == 'SQLI') {
                            $('#ruleLibraryTableOfSQLI').append(`
                                <tr id="ruleManagementRowOfSQLI_${element.id}">
                                    <th class="text-center">${element.id}</th>
                                    <td class="text-center">${element.rule_type}</td>
                                    <td>${element.rule_execution}</td>
                                    <td>${element.rule_description}</td>
                                </tr>
                            `)
                        }
                    }
                }
    
                if (xssCounter == 0) {
                    $('#XSS').empty().append(`
                        <div class="item-center">
                            <p>Empty</p>
                        </div>
                    `)
                }
                else {
                    $('#XSS').empty().append(`
                        <table class="mb-0 table table-striped ruleLibraryTable">
                            <thead>
                                <tr>
                                    <th class="text-center">ID</th>
                                    <th class="text-center">Rule Type</th>
                                    <th>Rule Execution</th>
                                    <th>Rule Description</th>
                                </tr>
                            </thead>
                            <tbody id="ruleLibraryTableOfXSS">
                            </tbody>
                        </table>
                    `)
                    for (let index = 0; index < response.data.length; index++) {
                        const element = response.data[index];
                        if (element.rule_type == 'XSS') {
                            $('#ruleLibraryTableOfXSS').append(`
                                <tr id="ruleManagementRowOfXSS_${element.id}">
                                    <th class="text-center">${element.id}</th>
                                    <td class="text-center">${element.rule_type}</td>
                                    <td>${element.rule_execution}</td>
                                    <td>${element.rule_description}</td>
                                </tr>
                            `)
                        }
                    }
                }
    
                if (fuCounter == 0) {
                    $('#FU').empty().append(`
                        <div class="item-center">
                            <p>Empty</p>
                        </div>
                    `)
                }
                else {
                    $('#FU').empty().append(`
                        <table class="mb-0 table table-striped ruleLibraryTable">
                            <thead>
                                <tr>
                                    <th class="text-center">ID</th>
                                    <th class="text-center">Rule Type</th>
                                    <th>Rule Execution</th>
                                    <th>Rule Description</th>
                                </tr>
                            </thead>
                            <tbody id="ruleLibraryTableOfFU">
                            </tbody>
                        </table>
                    `)
                    for (let index = 0; index < response.data.length; index++) {
                        const element = response.data[index];
                        if (element.rule_type == 'FU') {
                            $('#ruleLibraryTableOfFU').append(`
                                <tr id="ruleManagementRowOfFU_${element.id}">
                                    <th class="text-center">${element.id}</th>
                                    <td class="text-center">${element.rule_type}</td>
                                    <td>${element.rule_execution}</td>
                                    <td>${element.rule_description}</td>
                                </tr>
                            `)
                        }
                    }
                }
            },
            function (status, errorMessage) {
                console.log(errorMessage);
                
                if (status == 404) {
                    $('#SQLI').empty().append(`
                        <div class="item-center">
                            <p>Empty</p>
                        </div>
                    `)
                    $('#XSS').empty().append(`
                        <div class="item-center">
                            <p>Empty</p>
                        </div>
                    `)
                    $('#FU').empty().append(`
                        <div class="item-center">
                            <p>Empty</p>
                        </div>
                    `)
                }
                else {
                    notificator('Error', 'Can\'t fetch SQL Injection Rule Library')
                    $('#SQLI').empty().append(`
                        <div class="item-center">
                            <p>Error</p>
                        </div>
                    `)
                    notificator('Error', 'Can\'t fetch Cross Site Scripting Rule Library')
                    $('#XSS').empty().append(`
                        <div class="item-center">
                            <p>Error</p>
                        </div>
                    `)
                    notificator('Error', 'Can\'t fetch File Upload Rule Library')
                    $('#FU').empty().append(`
                        <div class="item-center">
                            <p>Error</p>
                        </div>
                    `)
                }
            }
        )
    }

    fetchAll()

    $('#updateButton').on('click', function () {
        const form = document.getElementById('ruleUpdateForm');
        const formData = new FormData(form)
        const formJSON = convertFormToJSON(formData)
        const id = document.getElementById('updateButton').getAttribute('data-id')
        callAPI(
            'PUT',
            '/api/rules/rule-modification/' + id,
            function () {
                $('#updateButton').empty().append(`<div class="loader"></div>`).attr('disabled', true)
            },
            function () {
                $('#updateButton').empty().text('Update').removeAttr('disabled')
                $('#ruleDetailsModalCloseButton').click()
                notificator('Success', 'Update rule successfully', 'success')
                notificator('Info', 'Current window will reload after 1 second', 'info')
                setTimeout(function () {
                    window.location.reload()
                }, 1000)
            },
            function (event) {
                $('#updateButton').empty().text('Update').removeAttr('disabled')
                const responseError = JSON.parse(event.responseText)
                notificator('Error', responseError.reason, 'error')
            },
            formJSON
        )
    })

    $('#deleteRuleButton').on('click', function () {
        const id = document.getElementById('deleteRuleButton').getAttribute('data-id')
        const ruleType = document.getElementById('deleteRuleButton').getAttribute('data-rule-type')
        callAPI(
            'DELETE',
            '/api/rules/rule-termination/' + id,
            function () {
                $('#deleteRuleButton').empty().append(`<div class="loader"></div>`).attr('disabled', true)
            },
            function () {
                notificator('Success', `Delete rule successfully`, 'success')
                $('#deleteRuleButton').empty().text('Delete').removeAttr('disabled')
                $('#ruleDeleteModalCloseButton').click()
                $(`#ruleManagementRowOf${ruleType}_${id}`).remove()
            },
            function (event) {
                $('#deleteRuleButton').empty().text('Delete').removeAttr('disabled')
                const responseError = JSON.parse(event.responseText)
                notificator('Error', responseError.reason, 'error')
            }
        )
    })

    $('#deleteAllButton').on('click', function () {
        const ruleType = document.getElementById('deleteAllButton').getAttribute('data-rule-type')
        callAPI(
            'DELETE',
            '/api/rules/rule-termination/_?ruleType=' + ruleType,
            function () {
                $('#deleteAllButton').empty().append(`<div class="loader"></div>`).attr('disabled', true)
            },
            function () {
                notificator('Success', `Delete all ${ruleType} Rule Libray successfully`, 'success')
                $('#deleteAllButton').empty().text('Delete all').removeAttr('disabled')
                $('#ruleDeleteAllModalCloseButton').click()
                $(`#cardOf${ruleType}`).remove()
            },
            function (event) {
                $('#deleteAllButton').empty().text('Delete all').removeAttr('disabled')
                const responseError = JSON.parse(event.responseText)
                notificator('Error', responseError.reason, 'error')
            }
        )
    })
})