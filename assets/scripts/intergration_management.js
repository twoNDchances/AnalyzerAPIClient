import { fetchData, notificator, checker, callAPI, convertFormToJSON } from "./general.js";

checker()

$(document).ready(function () {
    // Fetch YARAs
    fetchData(
        '/api/yaras/list',
        'GET',
        null,
        function () {
            $('#ruleManagementOfYARA').empty().append(`
                <div class="small-item-center">
                    <div class="loader"></div>
                </div>
            `)
        },
        function (responseData) {
            console.log(responseData);
            $('#ruleManagementOfYARA').empty().append(`
                <table class="mb-0 table table-striped ruleManagementTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>YARA Rule</th>
                            <th>YARA Description</th>
                            <th>Update</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody id="ruleManagementTableOfYARA">
                    </tbody>
                </table>
            `)
            for (let index = 0; index < responseData.data.length; index++) {
                const element = responseData.data[index];
                $('#ruleManagementTableOfYARA').append(`
                    <tr id="ruleManagementRowOfYARA_${element.id}">
                        <th class="size-adjustment">${element.id}</th>
                        <td><pre><textarea class="form-control" disabled rows="20">${element.yara_rule}</textarea></pre></td>
                        <td class="size-adjustment">${element.yara_description}</td>
                        <td class="size-appendix">
                            <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#intergrationDetailsModal" data-id="${element.id}" onclick=getYARARuleDetails(this)>
                                <i class="fa fa-eye"></i>
                            </button>
                        </td>
                        <td class="size-appendix">
                            <button class="mb-2 mr-2 btn btn-danger" data-toggle="modal" data-target="#intergrationDeleteModal" data-id="${element.id}" onclick=deleteYARARule(this)>
                                <i class="fa fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `)
            }
        },
        function (status, errorMessage) {
            console.log(errorMessage);
            
            if (status == 404) {
                $('#ruleManagementOfYARA').empty().append(`
                    <div class="item-center">
                        <p>Empty</p>
                    </div>
                `)
            }
            else {
                notificator('Error', 'Can\'t fetch YARA rules', 'error')
                $('#ruleManagementOfYARA').empty().append(`
                    <div class="item-center">
                        <p>Error</p>
                    </div>
                `)
            }
        }
    )

    function formatYARARule(ruleText) {
        const lines = ruleText.split('\n').map(line => line.trim());
        let formattedLines = [];
        let indentLevel = 0;
    
        lines.forEach(line => {
            if (line.includes('rule ')) {
                formattedLines.push(line);
                indentLevel = 1;
            } else if (line.includes('{')) {
                formattedLines.push(' '.repeat(indentLevel * 4) + line);
                indentLevel++;
            } else if (line.includes('}')) {
                indentLevel = Math.max(indentLevel - 1, 0);
                formattedLines.push(' '.repeat(indentLevel * 4) + line);
            } else if (line.includes(':')) {
                formattedLines.push(' '.repeat(indentLevel * 4) + line);
            } else {
                formattedLines.push(' '.repeat(indentLevel * 4) + line);
            }
        });
    
        return formattedLines.join('\n');
    }

    $('#intergrationType').on('change', function () {
        const ruleTypeList = ['YARA']
        for (let index = 0; index < ruleTypeList.length; index++) {
            const element = ruleTypeList[index];
            if ($('#intergrationType').val() == 'null') {
                $(`#cardOf${element}`).show()
            }
            else {
                if ($('#intergrationType').val() != element) {
                    $(`#cardOf${element}`).hide()
                }
                else {
                    $(`#cardOf${element}`).show()
                }
            }
        }
    })

    $('#updateButton').on('click', function () {
        const id = document.getElementById('updateButton').getAttribute('data-id')
        const form = document.getElementById('intergrationUpdateForm')
        const formData = new FormData(form)
        const formJSON = convertFormToJSON(formData)
        callAPI(
            'PUT',
            '/api/yaras/update/' + id,
            function () {
                $('#updateButton').empty().append(`<div class="loader"></div>`).attr('disabled', true)
            },
            function (event) {
                $('#updateButton').empty().text('Update').removeAttr('disabled')
                $('#intergrationDetailsModalCloseButton').click()
                notificator('Success', 'Update YARA Rule successfully', 'success')
                const responseData = JSON.parse(event.responseText)
                $(`#ruleManagementRowOfYARA_${responseData.data.id}`).empty().append(`
                    <th class="size-adjustment">${responseData.data.id}</th>
                    <td><pre><textarea class="form-control" disabled rows="20">${responseData.data.yara_rule}</textarea></pre></td>
                    <td class="size-adjustment">${responseData.data.yara_description}</td>
                    <td class="size-appendix">
                        <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#intergrationDetailsModal" data-id="${responseData.data.id}" onclick=getYARARuleDetails(this)>
                            <i class="fa fa-eye"></i>
                        </button>
                    </td>
                    <td class="size-appendix">
                        <button class="mb-2 mr-2 btn btn-danger" data-toggle="modal" data-target="#intergrationDeleteModal" data-id="${responseData.data.id}" onclick=deleteYARARule(this)>
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                `)
            },
            function (event) {
                $('#updateButton').empty().text('Update').removeAttr('disabled')
                const responseError = JSON.parse(event.responseText)
                notificator('Error', responseError.reason, 'error')
            },
            formJSON
        )
    })

    $('#deleteButton').on('click', function () {
        const id = document.getElementById('deleteButton').getAttribute('data-id')
        callAPI(
            'DELETE',
            '/api/yaras/delete/' + id,
            function () {
                $('#deleteButton').empty().append(`<div class="loader"></div>`).attr('disabled', true)
            },
            function () {
                $('#deleteButton').empty().text('Delete').removeAttr('disabled')
                $('#intergrationDeleteModalCloseButton').click()
                notificator('Success', 'Delete YARA Rule successfully', 'success')
                $(`#ruleManagementRowOfYARA_${id}`).remove()
            },
            function (event) {
                $('#deleteButton').empty().text('Delete').removeAttr('disabled')
                const responseError = JSON.parse(event.responseText)
                notificator('Error', responseError.reason, 'error')
            }
        )
    })
})