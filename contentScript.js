// Function to fetch submissions for a contest with retries
async function fetchSubmissionsWithRetries(contestId, handle, retries = 3) {
    try {
        const response = await fetch(`https://codeforces.com/api/contest.status?contestId=${contestId}&handle=${handle}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        if (retries > 0 && error.message === 'Failed to fetch') {
            console.log(`Retrying for contest ${contestId}, ${retries} retries left...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
            return fetchSubmissionsWithRetries(contestId, handle, retries - 1);
        } else {
            throw error;
        }
    }
}

// Wait for the page to fully load
window.addEventListener('load', async () => {
    // Find the table containing past contests
    const contestsTable = document.querySelector('.contests-table table');
    if (contestsTable) {
        // Get all rows except the header row
        const contestRows = contestsTable.querySelectorAll('tr:not(:first-child)');
        for (const row of contestRows) {
            // Extract contest ID
            const contestId = row.getAttribute('data-contestid');
            try {
                // Fetch submissions for the contest with retries
                const data = await fetchSubmissionsWithRetries(contestId, 'tomatoSword');
                // Filter submissions to include only accepted ones
                const acceptedSubmissions = data.result.filter(submission => submission.verdict === 'OK');
                // If there are more than one accepted submissions, extract problem IDs
                if (acceptedSubmissions.length > 0) {
                    const solvedProblemIds = acceptedSubmissions.map(submission => submission.problem.index);
                    // Create new cell with solved problems
                    const solvedCell = document.createElement('td');
                    solvedCell.textContent = solvedProblemIds.join(', ');
                    // Append the new cell to the row
                    row.appendChild(solvedCell);
                } else {
                    // If less than 2 problems are solved, create a placeholder cell
                    const placeholderCell = document.createElement('td');
                    placeholderCell.textContent = 'No problems solved';
                    // Append the placeholder cell to the row
                    row.appendChild(placeholderCell);
                }
            } catch (error) {
                console.error('Error fetching solved problems:', error);
                // Create placeholder cell for error
                const errorCell = document.createElement('td');
                errorCell.textContent = 'Error';
                // Append the error cell to the row
                row.appendChild(errorCell);
            }
        }
    }
});
