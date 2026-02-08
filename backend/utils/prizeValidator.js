/**
 * Validates prize claims for Tambola game
 */

function validateLine(ticket, markedNumbers, rowIndex) {
    const row = ticket[rowIndex];
    const numbersInRow = row.filter(n => n !== null);

    // Check if all numbers in this row are marked
    return numbersInRow.every(num => markedNumbers.includes(num));
}

function validateCorners(ticket, markedNumbers) {
    // Find the 4 corners of the ticket
    const corners = [];

    // Top-left corner (first non-null in first row)
    const topRow = ticket[0];
    for (let i = 0; i < topRow.length; i++) {
        if (topRow[i] !== null) {
            corners.push(topRow[i]);
            break;
        }
    }

    // Top-right corner (last non-null in first row)
    for (let i = topRow.length - 1; i >= 0; i--) {
        if (topRow[i] !== null) {
            corners.push(topRow[i]);
            break;
        }
    }

    // Bottom-left corner (first non-null in last row)
    const bottomRow = ticket[2];
    for (let i = 0; i < bottomRow.length; i++) {
        if (bottomRow[i] !== null) {
            corners.push(bottomRow[i]);
            break;
        }
    }

    // Bottom-right corner (last non-null in last row)
    for (let i = bottomRow.length - 1; i >= 0; i--) {
        if (bottomRow[i] !== null) {
            corners.push(bottomRow[i]);
            break;
        }
    }

    // Check if all 4 corners are marked
    return corners.length === 4 && corners.every(num => markedNumbers.includes(num));
}

function validateFullHouse(ticket, markedNumbers) {
    // Get all numbers from the ticket
    const allNumbers = [];
    for (let row of ticket) {
        for (let num of row) {
            if (num !== null) {
                allNumbers.push(num);
            }
        }
    }

    // Check if all numbers are marked
    return allNumbers.every(num => markedNumbers.includes(num));
}

function validateLastNumberMarked(markedNumbers, lastCalledNumber) {
    return markedNumbers.includes(lastCalledNumber);
}

function getCompletedLines(ticket, markedNumbers) {
    const completedLines = [];

    for (let i = 0; i < 3; i++) {
        if (validateLine(ticket, markedNumbers, i)) {
            completedLines.push(i);
        }
    }

    return completedLines;
}

function validateEarlyFive(ticket, markedNumbers) {
    // Count total marked numbers on the ticket
    let markedCount = 0;
    for (let row of ticket) {
        for (let num of row) {
            if (num !== null && markedNumbers.includes(num)) {
                markedCount++;
            }
        }
    }
    return markedCount >= 5;
}

module.exports = {
    validateLine,
    validateCorners,
    validateFullHouse,
    validateLastNumberMarked,
    getCompletedLines,
    validateEarlyFive
};
