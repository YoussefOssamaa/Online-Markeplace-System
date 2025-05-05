
const reportData = {
    totalDeposits: "840,140$",
    highestDepositsMonth: "July",
    tableData: [
        { userId: "500", depositAmount: "80$", date: "1/1/2025" },
        { userId: "540", depositAmount: "100$", date: "1/2/2025" },
        { userId: "600", depositAmount: "50$", date: "1/3/2025" },
    ],
};

function populateTotalDepositsReport() {
    const totalDepositsElement = document.querySelector(".font-semibold.text-green-500");
    const highestDepositsMonthElement = document.querySelector(".font-semibold.text-blue-500");
    const tableBody = document.querySelector(".bg-white.divide-y.divide-gray-200");

    if (totalDepositsElement) {
        totalDepositsElement.textContent = reportData.totalDeposits;
    }
    if (highestDepositsMonthElement) {
        highestDepositsMonthElement.textContent = reportData.highestDepositsMonth;
    }
    if (tableBody) {
        tableBody.innerHTML = reportData.tableData
            .map(
                (item) => `
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.userId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.depositAmount}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.date}</td>
          </tr>
        `
            )
            .join("");
    }
}

document.addEventListener("DOMContentLoaded", populateTotalDepositsReport);

const report__Data = {
    totalOrders: "8420",
    highestOrdersMonth: "November",
    tableData: [
        { userId: "500", orderId: "74000", date: "1/1/2025" },
        { userId: "540", orderId: "80000", date: "1/2/2025" },
        { userId: "600", orderId: "10000", date: "1/3/2025" },
    ],
};

function populateTotalOrdersReport() {
    const totalOrdersElement = document.querySelector(".font-semibold.text-green-500");
    const highestOrdersMonthElement = document.querySelector(".font-semibold.text-blue-500");
    const tableBody = document.querySelector(".bg-white.divide-y.divide-gray-200");

    if (totalOrdersElement) {
        totalOrdersElement.textContent = reportData.totalOrders;
    }
    if (highestOrdersMonthElement) {
        highestOrdersMonthElement.textContent = reportData.highestOrdersMonth;
    }
    if (tableBody) {
        tableBody.innerHTML = reportData.tableData
            .map(
                (item) => `
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.userId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.orderId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.date}</td>
          </tr>
        `)
            .join("");
    }
}

document.addEventListener("DOMContentLoaded", populateTotalOrdersReport);

const report_Data = {
    totalWithdrawals: "704,100$",
    highestWithdrawalsMonth: "July",
    tableData: [
        { userId: "500", withdrawalAmount: "80$", date: "1/1/2025" },
        { userId: "540", withdrawalAmount: "100$", date: "1/2/2025" },
        { userId: "600", withdrawalAmount: "50$", date: "1/3/2025" },
    ],
};

function populateTotalWithdrawalsReport() {
    const totalWithdrawalsElement = document.querySelector(".font-semibold.text-green-500");
    const highestWithdrawalsMonthElement = document.querySelector(".font-semibold.text-blue-500");
    const tableBody = document.querySelector(".bg-white.divide-y.divide-gray-200");

    if (totalWithdrawalsElement) {
        totalWithdrawalsElement.textContent = report_Data.totalWithdrawals;
    }
    if (highestWithdrawalsMonthElement) {
        highestWithdrawalsMonthElement.textContent = report_Data.highestWithdrawalsMonth;
    }
    if (tableBody) {
        tableBody.innerHTML = report_Data.tableData
            .map(
                (item) => `
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.userId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.withdrawalAmount}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.date}</td>
          </tr>
        `
            )
            .join("");
    }
}

document.addEventListener("DOMContentLoaded", populateTotalWithdrawalsReport);
