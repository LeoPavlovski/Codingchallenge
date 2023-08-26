document.addEventListener("DOMContentLoaded", async () => {
    try {
        // ... (existing code fetching user data)

        const leaderboardSection = document.getElementById("leader");

        // Fetch leaderboard data
        const leaderboardResponse = await fetch("http://127.0.0.1:8000/api/leaderboard");
        const leaderboardData = await leaderboardResponse.json();
        const leaderboardUsers = leaderboardData.data;

        leaderboardSection.innerHTML = ''; // Clear previous content

        // Create table element for leaderboard
        const leaderboardTable = document.createElement("table");
        leaderboardTable.className = "table table-striped"; // Apply Bootstrap table styles

        // Create table header for leaderboard
        const leaderboardHeader = document.createElement("thead");
        leaderboardHeader.innerHTML = `
            <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Prize</th>
            </tr>
        `;
        leaderboardTable.appendChild(leaderboardHeader);

        // Create table body and populate rows for leaderboard
        const leaderboardBody = document.createElement("tbody");
        leaderboardUsers.forEach((user, index) => {
            const row = document.createElement("tr");
            row.className = "custom-table-row";
            let prize = '';

            // Determine prize and icon based on score
            if (user.score >= 90) {
                prize = '<i class="fas fa-medal gold"></i> Gold Medal';
            } else if (user.score >= 70) {
                prize = '<i class="fas fa-medal silver"></i> Silver Medal';
            } else if (user.score >= 50) {
                prize = '<i class="fas fa-medal bronze"></i> Bronze Medal';
            }

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.name}</td>
                <td>${user.score}</td>
                <td>${prize}</td>
            `;
            leaderboardBody.appendChild(row);
        });
        leaderboardTable.appendChild(leaderboardBody);

        leaderboardSection.appendChild(leaderboardTable);

        // Display highest and lowest scores
        const highestScore = leaderboardUsers.length > 0 ? leaderboardUsers[0].score : 0;
        const lowestScore = leaderboardUsers.length > 0 ? leaderboardUsers[leaderboardUsers.length - 1].score : 0;

        const scoreInfo = document.createElement("div");
        scoreInfo.className = "score-info";
        scoreInfo.innerHTML = `
            <p>Highest Score: ${highestScore}</p>
            <p>Lowest Score: ${lowestScore}</p>
        `;

        leaderboardSection.appendChild(scoreInfo);

        // ... (existing code for user editing and creation)
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
});
