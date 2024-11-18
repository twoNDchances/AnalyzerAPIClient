import { fetchData, notificator, checker, callAPI, convertFormToJSON } from './general.js';

checker()

$(document).ready(function () {
    $('#actionType').on('change', function () {
        const actionTypeList = ['Webhook', 'Email']
        for (let index = 0; index < actionTypeList.length; index++) {
            const element = actionTypeList[index];
            if ($('#actionType').val() == 'null') {
                $(`#cardOf${element}`).show()
            }
            else {
                if ($('#actionType').val() != element.toLowerCase()) {
                    $(`#cardOf${element}`).hide()
                }
                else {
                    $(`#cardOf${element}`).show()
                }
            }
        }
    })

    fetchData(
        '/api/actions/list',
        'GET',
        null,
        function () {
            $('#actionManagementOfWebhook').empty().append(`
                <div class="small-item-center">
                    <div class="loader"></div>
                </div>
            `)
            $('#actionManagementOfEmail').empty().append(`
                <div class="small-item-center">
                    <div class="loader"></div>
                </div>
            `)
        },
        function (responseData) {
            let webhookData = []
            let emailData = []
            for (let index = 0; index < responseData.data.length; index++) {
                const element = responseData.data[index];
                if (element.action_type == 'webhook') {
                    webhookData.push(element)
                }
                else if (element.action_type == 'email') {
                    emailData.push(element)
                }
            }
            if (webhookData.length == 0) {
                $('#actionManagementOfWebhook').empty().append(`
                    <div class="item-center">
                        <p>Empty</p>
                    </div>
                `)
            }
            else {
                $('#actionManagementOfWebhook').empty().append(`
                    <table class="mb-0 table table-striped actionManagementTable">
                        <thead>
                            <tr>
                                <th class="text-center">ID</th>
                                <th class="text-center">Action Name</th>
                                <th class="text-center">Action Type</th>
                                <th class="text-center">Action Configuration</th>
                                <th class="text-center">Action Details</th>
                                <th class="text-center">Remove</th>
                            </tr>
                        </thead>
                        <tbody id="actionManagementTableOfWebhook">
                        </tbody>
                    </table>
                `)
                for (let index = 0; index < webhookData.length; index++) {
                    const element = webhookData[index];
                    $('#actionManagementTableOfWebhook').append(`
                        <tr id="actionManagementRowOfWebhook_${element.id}">
                            <th class="text-center">${element.id}</th>
                            <td class="text-center">${element.action_name}</td>
                            <td class="text-center">${element.action_type}</td>
                            <td><pre>${JSON.stringify(JSON.parse(element.action_configuration), null, 4)}</pre></td>
                            <td class="text-center">
                                <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#actionDetailsModal" data-id="${element.id}" onclick=getActionDetails(this)>
                                    <i class="fa fa-eye"></i>
                                </button>
                            </td>
                            <td class="text-center">
                                <button class="mb-2 mr-2 btn btn-danger" data-toggle="modal" data-target="#actionDeleteModal" data-id="${element.id}" onclick=removeActionDetails(this)>
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `)
                }
            }
            if (emailData.length == 0) {
                $('#actionManagementOfEmail').empty().append(`
                    <div class="item-center">
                        <p>Empty</p>
                    </div>
                `)
            }
            else {
                $('#actionManagementOfEmail').empty().append(`
                    <table class="mb-0 table table-striped actionManagementTable">
                        <thead>
                            <tr>
                                <th class="text-center">ID</th>
                                <th class="text-center">Action Name</th>
                                <th class="text-center">Action Type</th>
                                <th class="text-center">Action Configuration</th>
                                <th class="text-center">Action Details</th>
                                <th class="text-center">Remove</th>
                            </tr>
                        </thead>
                        <tbody id="actionManagementTableOfEmail">
                        </tbody>
                    </table>
                `)
                for (let index = 0; index < emailData.length; index++) {
                    const element = emailData[index];
                    let actionConfigurationJSON = JSON.parse(element.action_configuration)
                    actionConfigurationJSON.smtp.password = '*'.repeat(actionConfigurationJSON.smtp.password.length)
                    $('#actionManagementTableOfEmail').append(`
                        <tr id="actionManagementRowOfEmail_${element.id}">
                            <th class="text-center">${element.id}</th>
                            <td class="text-center">${element.action_name}</td>
                            <td class="text-center">${element.action_type}</td>
                            <td><pre>${JSON.stringify(actionConfigurationJSON, null, 4)}</pre></td>
                            <td class="text-center">
                                <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#actionDetailsModal" data-id="${element.id}" onclick=getActionDetails(this)>
                                    <i class="fa fa-eye"></i>
                                </button>
                            </td>
                            <td class="text-center">
                                <button class="mb-2 mr-2 btn btn-danger" data-toggle="modal" data-target="#actionDeleteModal" data-id="${element.id}" onclick=removeActionDetails(this)>
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `)
                }
            }
            $('#actionType').on('change', function () {
                const ruleTypeList = ['webhook', 'email']
                for (let index = 0; index < ruleTypeList.length; index++) {
                    const element = ruleTypeList[index];
                    if ($('#actionType').val() == 'null') {
                        $(`#cardOf${element.charAt(0).toUpperCase() + element.slice(1).toLowerCase()}`).show()
                    }
                    else {
                        if ($('#actionType').val() != element) {
                            $(`#cardOf${element.charAt(0).toUpperCase() + element.slice(1).toLowerCase()}`).hide()
                        }
                        else {
                            $(`#cardOf${element.charAt(0).toUpperCase() + element.slice(1).toLowerCase()}`).show()
                        }
                    }
                }
            })
        },
        function (status, errorMessage) {
            console.log(errorMessage);
            
            if (status == 404) {
                $('#actionManagementOfWebhook').empty().append(`
                    <div class="item-center">
                        <p>Empty</p>
                    </div>
                `)
                $('#actionManagementOfEmail').empty().append(`
                    <div class="item-center">
                        <p>Empty</p>
                    </div>
                `)
            }
            else {
                notificator('Error', 'Can\'t fetch action from Analyzer backend', 'error')
                $('#actionManagementOfWebhook').empty().append(`
                    <div class="item-center">
                        <p>Error</p>
                    </div>
                `)
                $('#actionManagementOfEmail').empty().append(`
                    <div class="item-center">
                        <p>Error</p>
                    </div>
                `)
            }
        }
    )

    $('#updateButton').on('click', function () {
        const id = document.getElementById('updateButton').getAttribute('data-id')
        const form = document.getElementById('actionUpdateForm');
        const formData = new FormData(form)
        const formJSON = convertFormToJSON(formData)
        callAPI(
            'PUT',
            '/api/actions/update/' + id,
            function () {
                $('#updateButton').empty().append(`
                    <div class="loader"></div>
                `).attr('disabled', true)
            },
            function (event) {
                const responseData = JSON.parse(event.responseText)
                $('#updateButton').empty().text('Update').removeAttr('disabled')
                notificator('Success', 'Action update successfully', 'success')
                $('#actionDetailsModalCloseButton').click()
                if (responseData.data.action_type == 'webhook'){
                    $(`#actionManagementRowOfWebhook_${responseData.data.id}`).empty().append(`
                        <th class="text-center">${responseData.data.id}</th>
                        <td class="text-center">${responseData.data.action_name}</td>
                        <td class="text-center">${responseData.data.action_type}</td>
                        <td><pre>${JSON.stringify(responseData.data.action_configuration, null, 4)}</pre></td>
                        <td class="text-center">
                            <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#actionDetailsModal" data-id="${responseData.data.id}" onclick=getActionDetails(this)>
                                <i class="fa fa-eye"></i>
                            </button>
                        </td>
                        <td class="text-center">
                            <button class="mb-2 mr-2 btn btn-danger" data-toggle="modal" data-target="#actionDeleteModal" data-id="${responseData.data.id}" onclick=removeActionDetails(this)>
                                <i class="fa fa-trash"></i>
                            </button>
                        </td>
                    `)
                }
                else if (responseData.data.action_type == 'email') {
                    let actionConfigurationJSON = responseData.data.action_configuration
                    actionConfigurationJSON.smtp.password = '*'.repeat(responseData.data.action_configuration.smtp.password.length)
                    $(`#actionManagementRowOfEmail_${responseData.data.id}`).empty().append(`
                        <th class="text-center">${responseData.data.id}</th>
                        <td class="text-center">${responseData.data.action_name}</td>
                        <td class="text-center">${responseData.data.action_type}</td>
                        <td><pre>${JSON.stringify(actionConfigurationJSON, null, 4)}</pre></td>
                        <td class="text-center">
                            <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#actionDetailsModal" data-id="${responseData.data.id}" onclick=getActionDetails(this)>
                                <i class="fa fa-eye"></i>
                            </button>
                        </td>
                        <td class="text-center">
                            <button class="mb-2 mr-2 btn btn-danger" data-toggle="modal" data-target="#actionDeleteModal" data-id="${responseData.data.id}" onclick=removeActionDetails(this)>
                                <i class="fa fa-trash"></i>
                            </button>
                        </td>
                    `)
                }
            },
            function (event) {
                const responseError = JSON.parse(event.responseText)
                $('#updateButton').empty().text('Update').removeAttr('disabled')
                notificator('Error', responseError.reason, 'error')
            },
            formJSON
        )
    })

    $('#removeButton').on('click', function() {
        const id = document.getElementById('removeButton').getAttribute('data-id')
        callAPI(
            'DELETE',
            '/api/actions/delete/' + id,
            function () {
                $('#removeButton').empty().append(`
                    <div class="loader"></div>
                `).attr('disabled', true)
            },
            function (event) {
                const responseData = JSON.parse(event.responseText)
                notificator('Success', 'Action delete successfully', 'success')
                $('#removeButton').empty().text('Remove').removeAttr('disabled')
                $('#actionDeleteModalCloseButton').click()
                if (responseData.data.action_type == 'webhook') {
                    $(`#actionManagementRowOfWebhook_${responseData.data.id}`).remove()
                }
                else if (responseData.data.action_type == 'email') {
                    $(`#actionManagementRowOfEmail_${responseData.data.id}`).remove()
                }
            },
            function () {
                $('#removeButton').empty().text('Remove').removeAttr('disabled')
                notificator('Error', 'Can\'t remove this action', 'error')
            }
        )
    })
})