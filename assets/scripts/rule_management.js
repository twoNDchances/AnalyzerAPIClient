import { checker, notificator, callAPI, fetchData, convertFormToJSON } from './general.js';

checker()

$(document).ready(function () {
    // Fetch SQLI
    fetchData(
        '/api/sqlis/list',
        'GET',
        null,
        function() {
            $('#ruleManagementOfSQLI').empty().append(`
                <div class="small-item-center">
                    <div class="loader"></div>
                </div>
            `)
        },
        function (responseData) {
            $('#ruleManagementOfSQLI').empty().append(`
                <table class="mb-0 table table-striped ruleManagementTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Rule Name</th>
                            <th>Is Enabled</th>
                            <th>Target Field</th>
                            <th>IP Root Cause Field</th>
                            <th>Regex Matcher</th>
                            <th>Rule Library</th>
                            <th>Action</th>
                            <th>View Details</th>
                            <th>Remove</th>
                        </tr>
                    </thead>
                    <tbody id="ruleManagementTableOfSQLI">
                    </tbody>
                </table>
            `)
            for (let index = 0; index < responseData.data.length; index++) {
                const element = responseData.data[index];
                $('#ruleManagementTableOfSQLI').append(`
                    <tr id="ruleManagementRowOfSQLI_${element.id}">
                        <th>${element.id}</th>
                        <td>${element.rule_name}</td>
                        <td>${element.is_enabled}</td>
                        <td>${element.target_field}</td>
                        <td>${element.ip_root_cause_field}</td>
                        <td>${element.regex_matcher}</td>
                        <td>${element.rule_library}</td>
                        <td>${element.action_id}</td>
                        <td>
                            <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#ruleDetailsModal" data-id="${element.id}" onclick=getSQLIRuleDetails(this)>
                                <i class="fa fa-eye"></i>
                            </button>
                        </td>
                        <td>
                            <button class="mb-2 mr-2 btn btn-danger" data-toggle="modal" data-target="#ruleDeleteModal" data-id="${element.id}" data-rule-name="${element.rule_name}" onclick=deleteSQLIRule(this)>
                                <i class="fa fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `)
            }
        },
        function (status, errorMessage) {
            if (status == 404) {
                $('#ruleManagementOfSQLI').empty().append(`
                    <div class="item-center">
                        <p>Empty</p>
                    </div>
                `)
            }
            else {
                notificator('Error', 'Can\'t fetch rules from Analyzer backend', 'error')
                $('#ruleManagementOfSQLI').empty().append(`
                    <div class="item-center">
                        <p>Error</p>
                    </div>
                `)
            }
        }
    )
    // Fetch XSS 
    fetchData(
        '/api/xsss/list',
        'GET',
        null,
        function() {
            $('#ruleManagementOfXSS').empty().append(`
                <div class="small-item-center">
                    <div class="loader"></div>
                </div>
            `)
        },
        function (responseData) {
            $('#ruleManagementOfXSS').empty().append(`
                <table class="mb-0 table table-striped ruleManagementTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Rule Name</th>
                            <th>Is Enabled</th>
                            <th>Target Field</th>
                            <th>IP Root Cause Field</th>
                            <th>Regex Matcher</th>
                            <th>Rule Library</th>
                            <th>Action</th>
                            <th>View Details</th>
                            <th>Remove</th>
                        </tr>
                    </thead>
                    <tbody id="ruleManagementTableOfXSS">
                    </tbody>
                </table>
            `)
            for (let index = 0; index < responseData.data.length; index++) {
                const element = responseData.data[index];
                $('#ruleManagementTableOfXSS').append(`
                    <tr id="ruleManagementRowOfXSS_${element.id}">
                        <th>${element.id}</th>
                        <td>${element.rule_name}</td>
                        <td>${element.is_enabled}</td>
                        <td>${element.target_field}</td>
                        <td>${element.ip_root_cause_field}</td>
                        <td>${element.regex_matcher}</td>
                        <td>${element.rule_library}</td>
                        <td>${element.action_id}</td>
                        <td>
                            <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#ruleDetailsModal" data-id="${element.id}" onclick=getXSSRuleDetails(this)>
                                <i class="fa fa-eye"></i>
                            </button>
                        </td>
                        <td>
                            <button class="mb-2 mr-2 btn btn-danger" data-toggle="modal" data-target="#ruleDeleteModal" data-id="${element.id}" data-rule-name="${element.rule_name}" onclick=deleteXSSRule(this)>
                                <i class="fa fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `)
            }
        },
        function (status, errorMessage) {
            if (status == 404) {
                $('#ruleManagementOfXSS').empty().append(`
                    <div class="item-center">
                        <p>Empty</p>
                    </div>
                `)
            }
            else {
                notificator('Error', 'Can\'t fetch rules from Analyzer backend', 'error')
                $('#ruleManagementOfXSS').empty().append(`
                    <div class="item-center">
                        <p>Error</p>
                    </div>
                `)
            }
        }
    )
    $('#ruleType').on('change', function () {
        const ruleTypeList = ['SQLI', 'XSS']
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

    $('#ruleName').on('input', function() {
        const searchTerm = $(this).val().toLowerCase()
        $('.ruleManagementTable').each(function() {
            $(this).find('tbody tr').each(function() {
                let rowContainsTerm = false
                $(this).find('td').each(function() {
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
    $('#updateButton').on('click', function () {
        const type = document.getElementById('updateButton').getAttribute('data-type')
        const id = document.getElementById('updateButton').getAttribute('data-id')
        if (type == 'SQLI') {
            const form = document.getElementById('sqlInjectionRuleUpdateForm');
            const formData = new FormData(form)
            const formJSON = convertFormToJSON(formData)
            callAPI(
                'PUT',
                '/api/sqlis/update/' + id,
                function () {
                    $('#updateButton').empty().append(`
                        <div class="loader"></div>
                    `).attr('disabled', true)
                },
                function (event) {
                    const responseData = JSON.parse(event.responseText)
                    $('#updateButton').empty().text('Update').removeAttr('disabled')
                    notificator('Success', 'Update SQLI Rule successfully', 'success')
                    $(`#ruleManagementRowOfSQLI_${responseData.data.id}`).empty().append(`
                        <th>${responseData.data.id}</th>
                        <td>${responseData.data.rule_name}</td>
                        <td>${responseData.data.is_enabled}</td>
                        <td>${responseData.data.target_field}</td>
                        <td>${responseData.data.ip_root_cause_field}</td>
                        <td>${responseData.data.regex_matcher}</td>
                        <td>${responseData.data.rule_library}</td>
                        <td>${responseData.data.action}</td>
                        <td>
                            <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#ruleDetailsModal" data-id="${responseData.data.id}" onclick=getSQLIRuleDetails(this)>
                                <i class="fa fa-eye"></i>
                            </button>
                        </td>
                        <td>
                            <button class="mb-2 mr-2 btn btn-danger" data-toggle="modal" data-target="#ruleDeleteModal" data-id="${responseData.data.id}" data-rule-name="${responseData.data.rule_name}" onclick=deleteSQLIRule(this)>
                                <i class="fa fa-trash"></i>
                            </button>
                        </td>
                    `)
                    $('#ruleDetailsModalCloseButton').click()
                },
                function (event) {
                    const responseError = JSON.parse(event.responseText)
                    $('#updateButton').empty().text('Update').removeAttr('disabled')
                    notificator('Error', responseError.reason, 'error')
                },
                formJSON
            )
        }
        else if (type == 'XSS') {
            const form = document.getElementById('crossSiteScriptingRuleUpdateForm');
            const formData = new FormData(form)
            const formJSON = convertFormToJSON(formData)
            callAPI(
                'PUT',
                '/api/xsss/update/' + id,
                function () {
                    $('#updateButton').empty().append(`
                        <div class="loader"></div>
                    `).attr('disabled', true)
                },
                function (event) {
                    const responseData = JSON.parse(event.responseText)
                    $('#updateButton').empty().text('Update').removeAttr('disabled')
                    notificator('Success', 'Update XSS Rule successfully', 'success')
                    $(`#ruleManagementRowOfXSS_${responseData.data.id}`).empty().append(`
                        <th>${responseData.data.id}</th>
                        <td>${responseData.data.rule_name}</td>
                        <td>${responseData.data.is_enabled}</td>
                        <td>${responseData.data.target_field}</td>
                        <td>${responseData.data.ip_root_cause_field}</td>
                        <td>${responseData.data.regex_matcher}</td>
                        <td>${responseData.data.rule_library}</td>
                        <td>${responseData.data.action}</td>
                        <td>
                            <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#ruleDetailsModal" data-id="${responseData.data.id}" onclick=getXSSRuleDetails(this)>
                                <i class="fa fa-eye"></i>
                            </button>
                        </td>
                        <td>
                            <button class="mb-2 mr-2 btn btn-danger" data-toggle="modal" data-target="#ruleDeleteModal" data-id="${responseData.data.id}" data-rule-name="${responseData.data.rule_name}" onclick=deleteXSSRule(this)>
                                <i class="fa fa-trash"></i>
                            </button>
                        </td>
                    `)
                    $('#ruleDetailsModalCloseButton').click()
                },
                function (event) {
                    const responseError = JSON.parse(event.responseText)
                    $('#updateButton').empty().text('Update').removeAttr('disabled')
                    notificator('Error', responseError.reason, 'error')
                },
                formJSON
            )
        }
    })

    $('#removeButton').on('click', function () {
        const type = document.getElementById('removeButton').getAttribute('data-type')
        const id = document.getElementById('removeButton').getAttribute('data-id')
        if (type == 'SQLI') {
            callAPI(
                'DELETE',
                '/api/sqlis/delete/' + id,
                function () {
                    $('#removeButton').empty().append(`
                        <div class="loader"></div>
                    `).attr('disabled', true)
                },
                function (event) {
                    const responseData = JSON.parse(event.responseText)
                    $('#removeButton').empty().text('Remove').removeAttr('disabled')
                    notificator('Success', 'Remove SQLI Rule successfully', 'success')
                    $(`#ruleManagementRowOfSQLI_${responseData.data.id}`).remove()
                    $('#ruleDeleteModalCloseButton').click()
                },
                function (event) {
                    const responseError = JSON.parse(event.responseText)
                    $('#removeButton').empty().text('Remove').removeAttr('disabled')
                    notificator('Error', responseError.reason, 'error')
                }
            )
        }
        else if (type == 'XSS') {
            callAPI(
                'DELETE',
                '/api/xsss/delete/' + id,
                function () {
                    $('#removeButton').empty().append(`
                        <div class="loader"></div>
                    `).attr('disabled', true)
                },
                function (event) {
                    const responseData = JSON.parse(event.responseText)
                    $('#removeButton').empty().text('Remove').removeAttr('disabled')
                    notificator('Success', 'Remove XSS Rule successfully', 'success')
                    $(`#ruleManagementRowOfXSS_${responseData.data.id}`).remove()
                    $('#ruleDeleteModalCloseButton').click()
                },
                function (event) {
                    const responseError = JSON.parse(event.responseText)
                    $('#removeButton').empty().text('Remove').removeAttr('disabled')
                    notificator('Error', responseError.reason, 'error')
                }
            )
        }
    })
})