const gbp = new Intl.NumberFormat('en-UK', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2
});

// Rent Logic
const total_rent = 1800;
const rent_display = document.getElementById('display-rent');

const council_tax = 2349.32;
const ten_month_council_tax = council_tax/10;
const twelve_month_council_tax = council_tax/12;
const council_tax_discount = 0.75;

// Regular utilities
const wifi = 37;
const wifi_display = document.getElementById('wifi-cost');

const energy = 198.85;
const energy_display = document.getElementById('energy-cost');

const water = 31;
const water_display = document.getElementById('water-cost');

rent_display.textContent = gbp.format(total_rent);
wifi_display.textContent = gbp.format(wifi);
energy_display.textContent = gbp.format(energy);
water_display.textContent = gbp.format(water);

// Total utilities
const utilities = energy + wifi + water;

function calculateAllHousemates() {
    const rentInputs = [
        { id: 1, fixed: false },
        { id: 2, fixed: false },
        { id: 3, fixed: true },
        { id: 4, fixed: true }
    ];

    // Step 1: Get fixed rents from housemates 3 and 4
    let fixedRentTotal = 0;
    rentInputs.forEach(h => {
        if (h.fixed) {
            const val = Number(document.getElementById(`rent-${h.id}`).value);
            fixedRentTotal += val;
        }
    });

    // Step 2: Calculate leftover
    const sharedRent = (total_rent - fixedRentTotal) / 2;
    const taxes = calculateCouncilTaxShares();
    // Step 3: Loop through each housemate
    rentInputs.forEach(h => {
        let rent;
        if (h.fixed) {
            rent = Number(document.getElementById(`rent-${h.id}`).value);
        } else {
            rent = sharedRent;
            document.getElementById(`rent-${h.id}`).value = rent.toFixed(2); // update the input field
        }

        const paysUtilities = document.getElementById(`pays-utilities-${h.id}`)?.checked ?? true;
        const util = paysUtilities ? (utilities / 4) : 0;
        const total = rent + taxes[h.id] + util;

        document.getElementById(`total-owed-${h.id}`).textContent = gbp.format(total);
    });
}

function calculateCouncilTaxShares() {
    const housemateIds = [1, 2, 3, 4];

    // Read toggle input from HTML
    const splitOverTenMonths = document.getElementById("ten-month-toggle").checked;

    const monthlyTax = splitOverTenMonths
        ? ten_month_council_tax
        : twelve_month_council_tax;

    // Get all who are paying and who are students
    const payingTax = housemateIds.filter(id =>
        document.getElementById(`pays-tax-${id}`).checked
    );

    const students = housemateIds.filter(id =>
        document.getElementById(`student-${id}`).checked
    );

    // Count non-students who are paying tax
    const nonStudentPayers = payingTax.filter(id => !students.includes(id));

    // Apply 25% discount if only one non-student payer
    const effectiveTax = (nonStudentPayers.length === 1)
        ? monthlyTax * council_tax_discount
        : monthlyTax;

    // Determine how many people to split it with
    const payersCount = payingTax.length || 1;

    const sharePerPerson = effectiveTax / payersCount;

    // Calculate share per housemate
    const taxShares = {};
    housemateIds.forEach(id => {
        taxShares[id] = payingTax.includes(id) ? sharePerPerson : 0;
    });

    return taxShares;
}

// Call it once at the start to populate everything
calculateAllHousemates();

// Recalculate whenever anything changes
const inputs = document.querySelectorAll("input");
inputs.forEach(input => {
    input.addEventListener("input", calculateAllHousemates);
    input.addEventListener("change", calculateAllHousemates);
});