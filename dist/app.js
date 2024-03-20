"use strict";
let month_tracker = [];
let categoryDropDown = JSON.parse(localStorage.getItem('categoryList') || 'null') || ["GYM", "Food", "Movie", "Petrol", "Recharge", "EMI"];
// append category list in Category Dropdown
let selectType = document.getElementById('type');
function appendCategory() {
    selectType.innerHTML = "";
    categoryDropDown.forEach(element => {
        const option = document.createElement('option');
        option.innerText = `${element}`;
        option.value = element.toLowerCase();
        selectType.appendChild(option);
    });
    const option = document.createElement('option');
    option.innerText = `Other`;
    option.value = `other`;
    selectType.appendChild(option);
}
let currentMonth = new Date().getMonth();
console.log(currentMonth);
let storedMonthTracker = localStorage.getItem('month_tracker');
if (storedMonthTracker) {
    month_tracker = JSON.parse(storedMonthTracker);
    console.log("stored");
}
else {
    for (let i = 0; i < 12; i++) {
        month_tracker.push({
            income: 0,
            totalExpense: 0,
            totalSaving: 0,
            spending: [
            //     {
            //     date: '',
            //     remarks: '',
            //     amount: 0,
            //     is_other: false,
            // }
            ]
        });
    }
    localStorage.setItem('month_tracker', JSON.stringify(month_tracker));
    console.log("No store");
    localStorage.setItem('categoryList', JSON.stringify(categoryDropDown));
}
console.log(month_tracker[currentMonth].income);
// Check if current month is income is entered.
if (month_tracker[currentMonth].income != 0) {
    let incomeInputContainer = document.getElementById('income-input-field');
    incomeInputContainer.classList.add('hide');
    let displayIncomeContainer = document.getElementById('display-income-container');
    displayIncomeContainer === null || displayIncomeContainer === void 0 ? void 0 : displayIncomeContainer.classList.remove('hide');
    display_Expense_Balance();
    console.log('not 0');
}
else {
    let incomeInputContainer = document.getElementById('income-input-field');
    incomeInputContainer.classList.remove('hide');
    let displayIncomeContainer = document.getElementById('display-income-container');
    displayIncomeContainer === null || displayIncomeContainer === void 0 ? void 0 : displayIncomeContainer.classList.add('hide');
    console.log('0');
}
// Add Income
let addIncome = document.getElementById('insertIncome');
addIncome.addEventListener('click', () => {
    let income = document.getElementById('income');
    let incomeValue = parseInt(income.value);
    console.log(incomeValue);
    if (!isNaN(incomeValue) && incomeValue > 0) {
        month_tracker[currentMonth].income = incomeValue;
        month_tracker[currentMonth].totalSaving = incomeValue;
        localStorage.setItem('month_tracker', JSON.stringify(month_tracker));
        let incomeInputContainer = document.getElementById('income-input-field');
        incomeInputContainer === null || incomeInputContainer === void 0 ? void 0 : incomeInputContainer.classList.add('hide');
        let displayIncomeContainer = document.getElementById('display-income-container');
        displayIncomeContainer === null || displayIncomeContainer === void 0 ? void 0 : displayIncomeContainer.classList.remove('hide');
        display_Expense_Balance();
    }
    else {
        alert("please enter income!");
    }
});
// Display Income, Expense and Current Savings.
function display_Expense_Balance() {
    var _a, _b, _c;
    let displayIncome = document.getElementById('display-income');
    displayIncome.innerText = `${((_a = month_tracker[currentMonth]) === null || _a === void 0 ? void 0 : _a.income) || ""}`;
    let spent = document.getElementById('spent');
    spent.innerText = `${((_b = month_tracker[currentMonth]) === null || _b === void 0 ? void 0 : _b.totalExpense) || ""}`;
    let balance = document.getElementById('balance');
    balance.innerText = `${((_c = month_tracker[currentMonth]) === null || _c === void 0 ? void 0 : _c.totalSaving) || ""}`;
}
// Check if user select 'other' in Remarks option
selectType === null || selectType === void 0 ? void 0 : selectType.addEventListener('change', (event) => {
    const optionValue = event.target.value;
    console.log(optionValue);
    const others = document.getElementById('others');
    if (optionValue == 'other') {
        others.disabled = false;
        others.focus();
    }
    else {
        others.disabled = true;
    }
});
// set current date in Add Expense Modal Input Element 
let currentDate = new Date();
// Format the date as YYYY-MM-DD (required by the input type="date")
let formattedDate = currentDate.toISOString().split('T')[0];
// Get the current year and month
let currentYear = new Date().getFullYear();
// let currentMonth: number = new Date().getMonth(); // 0-based index
// Calculate the first day of the current month
let firstDayOfMonth = new Date(currentYear, currentMonth, 2).toISOString().split('T')[0];
// Calculate the last day of the current month
let lastDayOfMonth = new Date(currentYear, currentMonth + 1, 1).toISOString().split('T')[0];
// Set the value of the input field
let dateInput = document.getElementById('cDate');
dateInput.value = formattedDate;
// Set the min and max attributes of the input field
dateInput.min = firstDayOfMonth;
dateInput.max = lastDayOfMonth;
// Add Expense in LocalStorage
let addExpense = document.getElementById('addExpense');
const successMsg = document.getElementById('successfullMsg');
addExpense.addEventListener('click', () => {
    if (month_tracker[currentMonth].income != 0) {
        const others = document.getElementById('others');
        const amount = document.getElementById('amount');
        // Validate amount input
        const amountValue = parseInt(amount.value);
        if (isNaN(amountValue) || amountValue <= 0) {
            alert("Please enter a valid positive number for the amount");
            return; // Exit the function early if amount is invalid
        }
        let bool = false;
        let otherRemarks = selectType.value;
        if (selectType.value == 'other') {
            bool = true;
            otherRemarks = others.value;
        }
        let selectedDate = new Date(dateInput.value);
        // Format the date as "MM/DD/YYYY"
        let formattedDate = selectedDate.toLocaleDateString('en-IN');
        let expensive = {
            date: formattedDate,
            remarks: otherRemarks,
            amount: amountValue,
            is_other: bool,
        };
        month_tracker[currentMonth].spending.push(expensive);
        month_tracker[currentMonth].totalExpense += parseInt(amount.value);
        month_tracker[currentMonth].totalSaving -= parseInt(amount.value);
        localStorage.setItem('month_tracker', JSON.stringify(month_tracker));
        // Show success message
        successMsg.textContent = "Expense successfully added!";
        setTimeout(() => {
            successMsg.textContent = ""; // Clear the message after a few seconds
        }, 3000);
    }
    else {
        alert("Please Enter Income First");
    }
    display_Expense_Balance();
    display_list();
});
// Add Remarks (Category)
const addCategory = document.getElementById('addCategory');
const modal = document.getElementById('category');
const successMsgCat = document.getElementById('successfullMsgCat');
addCategory.addEventListener('click', () => {
    console.log("Add Category");
    const categoryList = document.getElementById('categoryList');
    if (categoryList.value !== "") {
        let isCategoryList = false;
        categoryDropDown.forEach(ele => {
            if (ele.toLowerCase() === categoryList.value.toLowerCase()) {
                isCategoryList = true;
            }
        });
        if (!isCategoryList) {
            categoryDropDown.push(categoryList.value);
            localStorage.setItem('categoryList', JSON.stringify(categoryDropDown));
            appendCategory();
            successMsgCat.textContent = "Category successfully added!";
            setTimeout(() => {
                successMsgCat.textContent = ""; // Clear the message after a few seconds
            }, 3000);
            // $('.modal').modal('hide');
            // closeModal(); // Close the modal after successfully adding the category
        }
        else {
            alert("This Category is already in the list.");
        }
    }
    else {
        alert("Please Enter the Category");
    }
});
function closeModal() {
    const body = document.querySelector('body');
    body.classList.remove('modal-open');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    modalBackdrop.classList.remove('in');
    modalBackdrop.remove();
    modal.classList.remove('in');
    // modal.classList.remove('modal-open', 'modal');
    modal.style.display = "none";
    modalBackdrop.style.display = "none";
}
// Display Expense list
const tableBody = document.getElementById('tbody');
function display_list() {
    tableBody.innerHTML = "";
    month_tracker[currentMonth].spending.forEach(element => {
        // First column
        const tr = document.createElement('tr');
        const tdFirstCol = document.createElement('td');
        const div = document.createElement('div');
        div.classList.add('data-remarks');
        const pDate = document.createElement('p');
        pDate.classList.add('date');
        pDate.innerText = `${element.date}`;
        const pRemark = document.createElement('p');
        pRemark.classList.add('remarks');
        pRemark.innerText = `${element.remarks}`;
        div.appendChild(pDate);
        div.appendChild(pRemark);
        tdFirstCol.appendChild(div);
        tr.appendChild(tdFirstCol);
        // Second column
        const tdSecCol = document.createElement('td');
        const span = document.createElement('span');
        span.innerText = `${element.amount}`;
        span.classList.add('amount');
        tdSecCol.appendChild(span);
        tr.appendChild(tdSecCol);
        tableBody.appendChild(tr);
    });
}
// Analysics button
const analysics = document.getElementById('analysics');
analysics.addEventListener('click', () => {
    window.location.href = "analyzeChart.html";
});
appendCategory();
display_list();
// Chart.js
