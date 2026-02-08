/**
 * Generates a valid Tambola ticket matching traditional format
 * Rules:
 * - 3 rows x 9 columns
 * - Each row has exactly 5 numbers and 4 blanks
 * - Column ranges: 1-9, 10-19, 20-29, ..., 80-90
 * - Each column can have 0-3 numbers across all rows
 * - No duplicate numbers
 */

function generateTambolaTicket() {
    // Initialize empty ticket
    const ticket = [
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null]
    ];

    // Column ranges for numbers
    const columnRanges = [
        [1, 9],    // Column 0
        [10, 19],  // Column 1
        [20, 29],  // Column 2
        [30, 39],  // Column 3
        [40, 49],  // Column 4
        [50, 59],  // Column 5
        [60, 69],  // Column 6
        [70, 79],  // Column 7
        [80, 90]   // Column 8
    ];

    // Step 1: Decide how many numbers per column (must total 15)
    // Each column can have 0-3 numbers, but we need exactly 15 total
    const numbersPerColumn = distributeNumbersAcrossColumns();

    // Step 2: For each column, select random numbers and place them
    const usedNumbers = new Set();

    for (let col = 0; col < 9; col++) {
        const count = numbersPerColumn[col];
        if (count === 0) continue;

        const [min, max] = columnRanges[col];

        // Get available numbers for this column
        const availableNumbers = [];
        for (let num = min; num <= max; num++) {
            if (!usedNumbers.has(num)) {
                availableNumbers.push(num);
            }
        }

        // Shuffle and pick required count
        shuffleArray(availableNumbers);
        const selectedNumbers = availableNumbers.slice(0, count).sort((a, b) => a - b);

        // Decide which rows to place these numbers in
        const availableRows = [0, 1, 2];
        shuffleArray(availableRows);

        for (let i = 0; i < selectedNumbers.length; i++) {
            ticket[availableRows[i]][col] = selectedNumbers[i];
            usedNumbers.add(selectedNumbers[i]);
        }
    }

    // Step 3: Ensure each row has exactly 5 numbers
    // This is done by adjusting the placement
    for (let row = 0; row < 3; row++) {
        const numbersInRow = ticket[row].filter(n => n !== null).length;

        if (numbersInRow < 5) {
            // Need to add more numbers to this row
            const needed = 5 - numbersInRow;
            const emptyColumns = [];

            for (let col = 0; col < 9; col++) {
                if (ticket[row][col] === null) {
                    // Check if we can add a number here
                    const columnCount = [ticket[0][col], ticket[1][col], ticket[2][col]].filter(n => n !== null).length;
                    if (columnCount < 3) {
                        emptyColumns.push(col);
                    }
                }
            }

            shuffleArray(emptyColumns);

            for (let i = 0; i < needed && i < emptyColumns.length; i++) {
                const col = emptyColumns[i];
                const [min, max] = columnRanges[col];

                // Find unused number in this column range
                for (let num = min; num <= max; num++) {
                    if (!usedNumbers.has(num)) {
                        ticket[row][col] = num;
                        usedNumbers.add(num);
                        break;
                    }
                }
            }
        } else if (numbersInRow > 5) {
            // Need to remove numbers from this row
            const toRemove = numbersInRow - 5;
            let filledColumns = [];

            for (let col = 0; col < 9; col++) {
                if (ticket[row][col] !== null) {
                    filledColumns.push(col);
                }
            }

            shuffleArray(filledColumns);

            // Filter columns that have > 1 number to avoid emptying a column
            const safeToRemoveColumns = filledColumns.filter(col => {
                const count = [ticket[0][col], ticket[1][col], ticket[2][col]].filter(n => n !== null).length;
                return count > 1;
            });

            // Use safe columns first, fallback to any if necessary (should be rare)
            const candidates = [...safeToRemoveColumns, ...filledColumns.filter(c => !safeToRemoveColumns.includes(c))];

            for (let i = 0; i < toRemove; i++) {
                const col = candidates[i];
                if (col !== undefined) {
                    usedNumbers.delete(ticket[row][col]);
                    ticket[row][col] = null;
                }
            }
        }
    }

    // Step 4: Final Column Sorting
    // Ensure numbers in each column are in ascending order (top to bottom)
    for (let col = 0; col < 9; col++) {
        // Collect all non-null numbers in this column and their row indices
        const columnData = [];
        for (let row = 0; row < 3; row++) {
            if (ticket[row][col] !== null) {
                columnData.push({ row, val: ticket[row][col] });
            }
        }

        if (columnData.length > 1) {
            // Sort the values ascending
            const sortedVals = columnData.map(d => d.val).sort((a, b) => a - b);

            // Re-assign them back to the same row positions in sorted order
            columnData.forEach((data, index) => {
                ticket[data.row][col] = sortedVals[index];
            });
        }
    }

    return ticket;
}

function distributeNumbersAcrossColumns() {
    // We need exactly 15 numbers distributed across 9 columns
    // Each column MUST have at least 1 number and max 3 numbers
    const distribution = [1, 1, 1, 1, 1, 1, 1, 1, 1]; // Start with 1 per column
    let remaining = 6; // 15 - 9 = 6

    // Randomly distribute the remaining 6 numbers
    while (remaining > 0) {
        const col = Math.floor(Math.random() * 9);
        if (distribution[col] < 3) {
            distribution[col]++;
            remaining--;
        }
    }

    return distribution;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = { generateTambolaTicket };
