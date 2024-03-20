// Reference the D3.js library
declare var d3: any;
// Data for the donut chart
interface DataPoint {
    label: string;
    value: number;
}

let weekData: DataPoint[] = [];
let monthData: DataPoint[] = [];

interface Spending {
    date: string;
    remarks: string;
    amount: number;
    is_other: boolean;
}

interface MonthTracker {
    income: number; 
    totalExpense: number;
    totalSaving: number;
    spending: Spending[];
}
let  month_expnese: MonthTracker[];
let MonthTracker = localStorage.getItem('month_tracker');
if (MonthTracker) {
    month_expnese = JSON.parse(MonthTracker);
    console.log("stored")
}

// Function to get the number of weeks in a month for a given year and month
function getWeeksInMonth(year: number, month: number): number {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const firstWeekDay = firstDayOfMonth.getDay();
    const lastWeekDay = lastDayOfMonth.getDay();
    const daysInFirstWeek = 7 - firstWeekDay;
    const daysInLastWeek = lastWeekDay === 0 ? 7 : lastWeekDay;

    const weeksInMonth = Math.ceil((daysInMonth - daysInFirstWeek - daysInLastWeek) / 7) + 2;
    return weeksInMonth;
}

const dropdown = document.getElementById('week') as HTMLSelectElement;
// Function to populate the dropdown with week numbers and corresponding dates
function populateWeekDropdown(year: number, month: number): void {
    const weeksInMonth = getWeeksInMonth(year, month);
    dropdown.innerHTML = ''; // Clear existing options

    for (let i = 1; i <= weeksInMonth; i++) {
        const startDate = getStartDateOfWeek(year, month, i);
        const endDate = getEndDateOfWeek(year, month, i);

        const startDateString = formatDate(startDate);
        const endDateString = formatDate(endDate);

        const option = document.createElement('option');
        option.value = `${startDateString}-${endDateString}`;
        option.textContent = `Week ${i}: ${startDateString} - ${endDateString}`;
        dropdown.appendChild(option);
    }
}

// Function to get the start date of a week
function getStartDateOfWeek(year: number, month: number, week: number): Date {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const startOfWeek = new Date(firstDayOfMonth);
    startOfWeek.setDate(startOfWeek.getDate() + (week - 1) * 7 - firstDayOfMonth.getDay());
    return startOfWeek;
}

// Function to get the end date of a week
function getEndDateOfWeek(year: number, month: number, week: number): Date {
    const startDate = getStartDateOfWeek(year, month, week);
    const endOfWeek = new Date(startDate);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return endOfWeek;
}

// Function to format a date as "DD/MM/YYYY"
function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// passing arguments current year and current month
const selectedYear: number = new Date().getFullYear();
const selectedMonth: number  = new Date().getMonth()+1;
populateWeekDropdown(selectedYear, selectedMonth);

let weekDates: {category:string, amount:number}[] = []


// When user change the option
dropdown.addEventListener('change',  ()=>{
    // empty the chart container, so avoid duplicate.
    const weeklyReportContainer = document.getElementById('weekly_report') as HTMLDivElement;
    weeklyReportContainer.innerHTML="";

    weekData=[];
    weekDates=[];
    // console.log(dropdown.value);
    const selectedOption = dropdown.value;

    // Split the string into start date and end date
    const [startDate, endDate] = selectedOption.split('-');

    console.log(startDate);
    console.log(endDate);  
    let datePartstart = startDate.split('/');
    const startDatePart = parseInt(datePartstart[0], 10);
    console.log(startDatePart);
    let datePartend = endDate.split('/');
    const endDatePart = parseInt(datePartend[0], 10);
    console.log(endDatePart);
    

    const currentMonth = month_expnese[selectedMonth-1].spending; 
    // console.log(currentMonth);

    // const startDateParts = startDate.split('/');
    // const endDateParts = endDate.split('/');

    // // Date format: DD/MM/YYYY
    // const startDateObj = new Date(`${startDateParts[2]}-${startDateParts[1]}-${startDateParts[0]}`);
    // const endDateObj = new Date(`${endDateParts[2]}-${endDateParts[1]}-${endDateParts[0]}`);

    let category:string;
    let amount:number = 0 ;
    currentMonth.forEach(spend => {
        const spendDateParts = spend.date.split('/');
        const spendDatePart = parseInt(spendDateParts[0], 10);
        // const spendDateObj = new Date(`${spendDateParts[2]}-${spendDateParts[1]}-${spendDateParts[0]}`);
        // console.log(startDateObj+" | "+endDateObj);
        // console.log(spendDateObj);
        if (spendDatePart >= startDatePart && spendDatePart <= endDatePart) {
            // console.log(spend);
            if (spend.is_other == true) {
                category = 'others';
            }else if(spend.is_other == false){
                category = spend.remarks;
            }
                const existingCategoryIndex = weekDates.findIndex(item => item.category === category);
                if (existingCategoryIndex !== -1) {
                    // Update the amount for the existing category
                    weekDates[existingCategoryIndex].amount += spend.amount;
                } else {
                    // Push a new object with the category and amount
                    weekDates.push({ category, amount: spend.amount });
                }
        }
    });

    
    weekDates.forEach(ele=>{
        weekData.push({label: ele.category, value: ele.amount});
    });
    if (weekData.length === 0) {
        console.log("weekData is empty");
        const weekly_report = document.getElementById('weekly_report') as HTMLDivElement;
        weekly_report.innerHTML="";
        weekly_report.innerText = `There is No Expense for this week`;
        weekly_report.style.fontSize = '16px';
        weekly_report.style.fontWeight = '500';

        const list = document.getElementById('weekList') as HTMLDivElement;
        list.innerHTML = "";
    } else {
        weekData.sort((a, b) => b.value - a.value);
        donutChart();
        createCategoryList(weekData, 'weekList');
    }
    
})


function donutChart() {
    // Set dimensions and margins for the SVG
const width = 350;
const height = 350;
const margin = 40;
const radius = Math.min(width, height) / 2 - margin;

// Select the SVG container
const svg = d3.select('#weekly_report')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${width / 2}, ${height / 2})`);

// Define the color scale
const color = d3.scaleOrdinal()
  .domain(weekData.map(d => d.label))
  .range(d3.schemeCategory10);

// Define the pie generator
const pie = d3.pie()
  .value((d: { value: any; }) => d.value);

// Generate the arcs
const arcs = pie(weekData);

// Define the arc generator
const arc = d3.arc()
  .innerRadius(radius * 0.5)
  .outerRadius(radius * 0.8);

// Draw the arcs
svg.selectAll('path')
  .data(arcs)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', (d: { data: { label: any; }; }) => color(d.data.label))
  .attr('stroke', 'white')
  .style('stroke-width', '2px');

// Add labels to the arcs
svg.selectAll('text')
  .data(arcs)
  .enter()
  .append('text')
  .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
  .attr('text-anchor', 'middle')
  .text((d: { data: { label: any; }; }) => d.data.label);
}


// Month Chart
// let month: {category:string, amount:number}[] = []

const monthChartBtn = document.getElementById('monthContainer') as HTMLAnchorElement;
monthChartBtn.addEventListener('click', ()=>{
    const weeklyReportContainer = document.getElementById('monthly_report') as HTMLDivElement;
    weeklyReportContainer.innerHTML="";

    monthData = [];
    const currentMonth = month_expnese[selectedMonth-1].spending; 

    let label:string;
    let amount:number = 0 ;
    currentMonth.forEach(Element =>{

        if (Element.is_other == true) {
            label = 'others';
        }else if(Element.is_other == false){
            label = Element.remarks;
        }
        // label = Element.remarks;
        const existingCategoryIndex = monthData.findIndex(item => item.label === label);
            if (existingCategoryIndex !== -1) {
                // Update the amount for the existing category
                monthData[existingCategoryIndex].value += Element.amount;
            } else {
                // Push a new object with the category and amount
                monthData.push({ label, value: Element.amount });
            }
    });

    if (monthData.length === 0) {
        console.log("MonthDate is empty");
        const month_report = document.getElementById('monthly_report') as HTMLDivElement;
        month_report.innerHTML="";
        month_report.innerText = `There is No Expense for this month`;
        month_report.style.fontSize = '16px';
        month_report.style.fontWeight = '500';

        const list = document.getElementById('monthList') as HTMLDivElement;
        list.innerHTML = "";
    } else {
        monthData.sort((a, b) => b.value - a.value);
        barChartMonth();
        createCategoryList(monthData, 'monthList');
    }
    
});

function donutChartMonth() {
       // Set dimensions and margins for the SVG
       console.log("Hello");
       
const width = 400;
const height = 400;
const margin = 40;
const radius = Math.min(width, height) / 2 - margin;

// Select the SVG container
const svg = d3.select('#monthly_report')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${width / 2}, ${height / 2})`);

// Define the color scale
const color = d3.scaleOrdinal()
  .domain(monthData.map(d => d.label))
  .range(d3.schemeCategory10);

// Define the pie generator
const pie = d3.pie()
  .value((d: { value: any; }) => d.value);

// Generate the arcs
const arcs = pie(monthData);

// Define the arc generator
const arc = d3.arc()
  .innerRadius(radius * 0.5)
  .outerRadius(radius * 0.8);

// Draw the arcs
svg.selectAll('path')
  .data(arcs)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', (d: { data: { label: any; }; }) => color(d.data.label))
  .attr('stroke', 'white')
  .style('stroke-width', '2px');

// Add labels to the arcs
svg.selectAll('text')
  .data(arcs)
  .enter()
  .append('text')
  .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
  .attr('text-anchor', 'middle')
  .text((d: { data: { label: any; }; }) => d.data.label);
}

function barChartMonth() {
    // Set dimensions and margins for the SVG
    const width = 350;
    const height = 350;
    const margin = { top: 20, right: 10, bottom: 30, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Define colors for the bars
    const color = d3.scaleOrdinal()
        .domain(monthData.map(d => d.label))
        .range(d3.schemeCategory10);
    
    // Select the SVG container
    const svg = d3.select('#monthly_report')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Define the scale for x-axis
    const xScale = d3.scaleBand()
        .domain(monthData.map(d => d.label))
        .range([margin.left, innerWidth])
        .padding(0.1);

    // Define the scale for y-axis
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(monthData, (d: { value: any; }) => d.value)])
        .range([innerHeight, margin.top]);

    // Draw the bars
    svg.selectAll('rect')
        .data(monthData)
        .enter()
        .append('rect')
        .attr('x', (d: { label: any; }) => xScale(d.label))
        .attr('y', (d: { value: any; }) => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', (d: { value: any; }) => innerHeight - yScale(d.value))
        .attr('fill', (d: { label: any; }) => color(d.label));

    // Add labels to the bars
    svg.selectAll('text')
        .data(monthData)
        .enter()
        .append('text')
        .attr('x', (d: { label: any; }) => xScale(d.label) + xScale.bandwidth() / 2)
        .attr('y', (d: { value: any; }) => yScale(d.value) - 5)
        .attr('text-anchor', 'middle')
        .text((d: { label: string; }) => d.label);

    // // Add legend
    // const legend = svg.append('g')
    //     .attr('transform', `translate(${margin.left}, ${height - margin.bottom + 5})`);

    // const legendItems = legend.selectAll('.legend-item')
    //     .data(monthData)
    //     .enter()
    //     .append('g')
    //     .attr('class', 'legend-item')
    //     .attr('transform', (d: any, i: number) => `translate(${i * 60}, 0)`);

    // legendItems.append('rect')
    //     .attr('x', 0)
    //     .attr('y', -9)
    //     .attr('width', 10)
    //     .attr('height', 10)
    //     .attr('fill', (d: any) => color(d.label));

    // legendItems.append('text')
    //     .attr('x', 15)
    //     .attr('y', 0)
    //     .attr('dy', '0.35em')
    //     .text((d: { label: any; }) => d.label);
}

const predefinedColors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
    '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
];

function createCategoryList(data: DataPoint[], id: string) {
    const list = document.getElementById(id) as HTMLDivElement;
    list.innerHTML = "";
    const ul = document.createElement('ul');

    data.forEach((element, index) => {
        const li = document.createElement('li');
        const colorRect = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        colorRect.setAttribute('width', '20');
        colorRect.setAttribute('height', '20');
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '0');
        rect.setAttribute('y', '10');
        rect.setAttribute('width', '15');
        rect.setAttribute('height', '10');
        rect.setAttribute('fill', predefinedColors[index % predefinedColors.length]);
        colorRect.appendChild(rect);
        li.appendChild(colorRect);
        li.innerHTML += `${element.label}: ₹ ${element.value}`;
        ul.appendChild(li);
    });
    list.appendChild(ul);
}




