document.addEventListener("DOMContentLoaded", function () {

    const searchButton = document.getElementById("search-btn");
    const searchInput = document.getElementById("user-input");

    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");

    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");

    const cardStatsContainer = document.querySelector(".stats-card");

    function validUsername(username) {
        if (username.trim() === "") {
            alert("Please enter a valid username.");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        return regex.test(username);
    }

    async function fetchUserData(username) {

        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const proxyUrl = "https://cors-anywhere.herokuapp.com/";
            const targetUrl = "https://leetcode.com/graphql";

            const graphql = JSON.stringify({
                query: `
                    query getUserProfile($username: String!) {
                        allQuestionsCount {
                            difficulty
                            count
                        }
                        matchedUser(username: $username) {
                            submitStats {
                                acSubmissionNum {
                                    difficulty
                                    count
                                }
                                totalSubmissionNum {
                                    difficulty
                                    submissions
                                }
                            }
                        }
                    }
                `,
                variables: { username }
            });

            const response = await fetch(proxyUrl + targetUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: graphql
            });

            if (!response.ok) {
                throw new Error("Unable to fetch User detail");
            }

            const parsedData = await response.json();
            console.log("Logging data:", parsedData);

            displayUserData(parsedData.data);

        } catch (error) {
            console.error(error);
            alert("No data Found");
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved} / ${total}`;
    }

    function displayUserData(data) {
        const totalQues = data.allQuestionsCount[0].count;
        const easyQues = data.allQuestionsCount[1].count;
        const mediumQues = data.allQuestionsCount[2].count;
        const hardQues = data.allQuestionsCount[3].count;

        const solvedStats = data.matchedUser.submitStats.acSubmissionNum;
        const totalStats = data.matchedUser.submitStats.totalSubmissionNum;

        updateProgress(solvedStats[1].count, easyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedStats[2].count, mediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedStats[3].count, hardQues, hardLabel, hardProgressCircle);

        const cardsData = [
            { label: "Overall Submissions", value: totalStats[0].submissions },
            { label: "Overall Easy Submissions", value: totalStats[1].submissions },
            { label: "Overall Medium Submissions", value: totalStats[2].submissions },
            { label: "Overall Hard Submissions", value: totalStats[3].submissions },
        ];

        cardStatsContainer.innerHTML = cardsData
            .map(item => `
                <div class="card">
                    <h4>${item.label}</h4>
                    <p>${item.value}</p>
                </div>
            `)
            .join("");
    }

    searchButton.addEventListener("click", function () {
        const username = searchInput.value;
        if (validUsername(username)) {
            fetchUserData(username);
        }
    });

});