import { fetchData, notificator, checker, callAPI } from "./general.js";

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
                            <button class="mb-2 mr-2 btn btn-light">
                                <i class="fa fa-eye"></i>
                            </button>
                        </td>
                        <td class="size-appendix">
                            <button class="mb-2 mr-2 btn btn-danger">
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
                indentLevel = Math.max(indentLevel - 1, 0); // Đảm bảo indentLevel không bao giờ âm
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
})