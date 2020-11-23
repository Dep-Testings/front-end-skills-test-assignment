/*
 *             DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *                     Version 2, December 2004
 *
 *  Copyright (C) 2020 IJSE
 *
 *  Everyone is permitted to copy and distribute verbatim or modified
 *  copies of this license document, and changing it is allowed as long
 *  as the name is changed.
 *
 *             DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *    TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 *
 *   0. You just DO WHAT THE FUCK YOU WANT TO.
 */

/**
 * @author : Ranjith Suranga <suranga@ijse.lk>
 * @since : 11/15/20
 **/

/*===============================================================================
 * Global Variables
 *===============================================================================*/

var txtId;
var txtName;
var txtAddress;
var tblCustomers;
var customers = [];
var selectedCustomer = null;
var selectedRow = null;

var pageSize = -1;
var pageCount = 1;
var startPageIndex = 0;
var endPageIndex = -1;
var MAX_PAGES = 3;

/*===============================================================================
 * Init
 *===============================================================================*/

init();

function init(){
    txtId = document.getElementById("txt-id");
    txtName = document.getElementById("txt-name");
    txtAddress = document.getElementById("txt-address");
    tblCustomers = document.getElementById("tbl-customers");

    txtId.focus();
}

/*===============================================================================
 * Event Handlers and Timers
 *===============================================================================*/

document.getElementById("btn-save").addEventListener('click', handleSave);
document.addEventListener('click', handleClickEventDelegation);
txtId.addEventListener('input', handleInput);
txtName.addEventListener('input', handleInput);
txtAddress.addEventListener('input', handleInput);
/*===============================================================================
 * Functions
 *===============================================================================*/

function handleClickEventDelegation(event){
    if (event.target){
        var activePage;
        if (event.target.matches('#btn-backward *')){
            activePage = startPageIndex;
            endPageIndex = startPageIndex -1;
            startPageIndex = endPageIndex - (MAX_PAGES -1);
            if(startPageIndex < 0){
                activePage = 1;
                startPageIndex = 0;
                endPageIndex = startPageIndex + (MAX_PAGES -1);
            }
            initPagination();
            renderPage(activePage);
        } else if (event.target.matches('#btn-forward *')){
            startPageIndex = startPageIndex + MAX_PAGES;
            activePage = startPageIndex + 1;
            endPageIndex = startPageIndex + (MAX_PAGES -1 );
            if( startPageIndex > pageCount){
                endPageIndex = -1;
                activePage = pageCount;
            }
            initPagination();
            renderPage(activePage);
        }else if (event.target.matches("#li.page-item *")){
            renderPage(+event.target.innerText);
        }
    }
}

function handleSave(event){
    if(!validate()){
        return ;
    }

    /*select save or update*/
    if(!selectedCustomer){
        customers.push({
            id: txtId.value,
            name: txtName.value,
            address: txtAddress.value
        });

        /*initialize pagination*/
        initPagination();
        renderPage(Math.ceil(customers.length/pageSize));
        showOrHideTFoot();

        /*var row = tblCustomers.insertRow(-1);
        row.onclick = handleSelection;

        var idCell = row.insertCell(0);
        idCell.innerText = txtId.value;

        var nameCell = row.insertCell(1);
        nameCell.innerText = txtName.value;

        var addressCell = row.insertCell(2);
        addressCell.innerText = txtAddress.value;

        var trashCell = row.insertCell(3);
        trashCell.innerHTML = '<div class="trash" onclick="handleDelete(event)"></div>';*/

        /*clear input boxes after saving*/
        txtId.value = '';
        txtName.value = '';
        txtAddress.value = '';
        txtId.focus();

    }else {
        /*update selected customer*/
        selectedCustomer.name = txtName.value;
        selectedCustomer.address = txtAddress.value;
        selectedRow.cells[1].innerText = txtName.value;
        selectedRow.cells[2].innerText = txtAddress.value;
    }
}

function initPagination(){
    var paginationElm = document.querySelector("#pagination");

    /*page size calculation*/
    pageSize = -1;
    clearTable();
    if (customers.length > 0){

        /*check bootstrap mobile styling*/
        if((innerWidth < 992) && pageSize === -1){
            pageSize = 6;
        } else {

            /*add temp row  to table to find row size*/
            addCustomersToTable(0, 1);

            /*coordinates and dimensions*/
            var topPos = tblCustomers.tBodies[0].rows[0].getBoundingClientRect().top;
            var rowHeight = tblCustomers.tBodies[0].rows[0].clientHeight;
            var paginationHeight = paginationElm.clientHeight;
            var margin = 40;
            var i = 1;

            /*find page size*/
            do{
                var totalHeight = topPos + (rowHeight * i) + paginationHeight + margin;
                i++;
            } while (totalHeight < document.querySelector("footer").getBoundingClientRect().top);

            pageSize = i - 2;

            /*remove added temp row*/
            clearTable();
        }
    }

    /*calculate - page count*/
    if (pageSize === -1){
        pageCount = 1;
    } else {
        pageCount = Math.ceil(customers.length / pageSize );
    }

    /*display pagination or not*/
    if( pageCount > 1){
        paginationElm.classList.remove("hidden");
    } else {
        paginationElm.classList.add('hidden');
    }
    if (endPageIndex === -1){
        endPageIndex = pageCount;
        startPageIndex = endPageIndex - ((endPageIndex % MAX_PAGES) == 0 ? MAX_PAGES : (endPageIndex % MAX_PAGES));
    }

    var html = '<li class="page-item" id="btn-backward">' +
        ' <a class="page-link" href="#"><i class="fas fa-backward"></i></a>' +
    ' </li>';
    for (var i = 0; i < pageCount; i++) {
        if (i >= startPageIndex && i <= endPageIndex){
            html += '<li class="page-item"><a class="page-link" href="#">' + (i+1) + '</a></li>';
        } else {
            html += '<li class="page-item d-none"><a class="page-link" href="#">' + (i+1) + '</a></li>';
        }
    }
    html += '<li class="page-item" id="btn-forward">' +
        ' <a class="page-link" href="#"><i class="fas fa-forward"></i></a>' +
        ' </li>';
    document.querySelector(".pagination").innerHTML = html;
    endPageIndex = -1;
}

function renderPage(page){
    if(!page){
        return ;
    }

    if (page < 1){
        page = 1;
    }
    if(page > pageCount){
        page = pageCount;
    }

    /*remove active status of previous page*/
    var exActivePage = document.querySelector("#pagination .page-item.active");
    if (exActivePage !== null){
        exActivePage.classList.remove('active');
    }

    document.querySelector('.pagination li:nth-child(' + (page + 1) +')').classList.add('active');

    /*check - disabality of backward or forward button*/
    toggleBackwardForwardDisability(page);

    clearTable();

    addCustomersToTable((page - 1) * pageSize, page * pageSize);
}

function clearTable(){
    for (var i = tblCustomers.tBodies[0].rows.length - 1; i >= 0; i--) {
        tblCustomers.tBodies[0].deleteRow(i);
    }
}

function addCustomersToTable(){
    if( endIndex > customers.length){
        endIndex = customers.length;
    }

    for (var i = startIndex; i < endIndex; i++) {

        /*append new row*/
        var row = tblCustomers.tBodies.item(0).insertRow(-1);
        row.onclick = handleSelection;

        /*add table data*/
        row.insertCell(0).innerText = customers[i].id;
        row.insertCell(1).innerText = customers[i].name;
        row.insertCell(2).innerText = customers[i].address;
        row.insertCell(3).innerHTML = '<div class="trash" onclick="handleDelete(event)"></div>';
    }
}

function toggleBackwardForwardDisability(){
    
}

function clearSelection(){
    var rows = document.querySelectorAll("#tbl-customers tbody tr");
    for (var i = 0; i < rows.length; i++) {
        rows[i].classList.remove('selected');
    }

    txtId.disable = false;
    selectedRow = null;
    selectedCustomer = null;
}

function handleSelection(){
    clearSelection();
    selectedRow = event.target.parentElement;
    selectedRow.classList.add('selected');
    txtId.value = selectedRow.cells[0].innerText;
    txtId.disable = true;
    txtName.value = selectedRow.cells[1].innerText;
    txtAddress.value = selectedRow.cells[2].innerText;
    selectedCustomer = customers.find(function (c){
        return c.id === selectedRow.cells[0].innerText;
    });
}

function handleDelete(){
    if (confirm("Are you sure to delete this customer?")){
        tblCustomers.deleteRow(event.target.parentElement.parentElement.rowIndex);
        showOrHideTFoot();

        customers.splice(customers.findIndex(function (c){
            return c.id === event.target.parentElement.parentElement.cells[0].innerText;
        }), 1);
        event.stopPropagation();
    }
}

function showOrHideTFoot(){
    if(tblCustomers.tBodies.item(0).rows.length > 0){
        document.querySelector("#tbl-customers tfoot").classList.add('d-none');
    }else{
        document.querySelector("#tbl-customers tfoot").classList.remove('d-none');
    }
}

function handleInput(event){
    this.classList.remove('is-invalid');
}

function validate(){
    /*Object Literal {}, Array Literal [], RegExp Literal /expression/ */
    /*new Object(),  new Array(), new RegExp() */


    var regExp;
    var validated = true;

    txtId.classList.remove('is-invalid');
    txtName.classList.remove('is-invalid');
    txtAddress.classList.remove('is-invalid');

    if(txtAddress.value.trim().length < 3){
        txtAddress.classList.add('is-invalid');
        txtAddress.select();
        validated = false;
    }

    regExp = /^[A-Za-z][A-Za-z .]{3,}$/;
    if(!regExp.test(txtName.value)){
        txtName.classList.add('is-invalid');
        txtName.select();
        validated = false;
    }

    regExp = /^C\d{3}$/;
    if(!regExp.test(txtId.value)){
        txtId.classList.add('is-invalid');
        document.getElementById('helper-txt-id').classList.remove('text-muted');
        document.getElementById('helper-txt-id').classList.add('invalid-feedback');
        txtId.select();
        validated = false;
    }
    return validated;
}