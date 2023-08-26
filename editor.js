document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetch exercise data
        const exerciseResponse = await fetch("http://127.0.0.1:8000/api/exercise");
        const exerciseData = await exerciseResponse.json();
        const exerciseDatabase = exerciseData.data; // Assuming your exercise data is an array

        // Populate exercise table
        const exerciseTable = document.getElementById("exercise-table");

        // Clear previous content
        exerciseTable.innerHTML = "";

        // Create table header
        const tableHeader = document.createElement("thead");
        tableHeader.innerHTML = `
            <tr>
                <th>Title</th>
                <th>Exercise</th>
                <th>Edit</th>
                <th>Delete</th>
            </tr>
        `;
        exerciseTable.appendChild(tableHeader);

        // Create table body and populate rows
        const tableBody = document.createElement("tbody");
        exerciseDatabase.forEach((exercise) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${exercise.title}</td>
                <td>${exercise.exercise}</td>
                <td><button class="btn btn-secondary edit-exercise" data-exercise-id="${exercise.id}"><i class="fas fa-edit"></i> Edit</button></td>
                <td><button class="btn btn-danger delete-exercise" data-exercise-id="${exercise.id}"><i class="fas fa-trash"></i> Delete</button></td>
                 <td><button class="btn btn-success solve-exercise" data-exercise-id="${exercise.id}"><i class="fas fa-check"></i> Solve</button></td>
            `;
            tableBody.appendChild(row);
        });
        exerciseTable.appendChild(tableBody);

        const createExerciseButton = document.createElement("button");
        createExerciseButton.className = "btn btn-primary";
        createExerciseButton.textContent = "Create Exercise";

        createExerciseButton.addEventListener("click", () => {
            Swal.fire({
                html: `
          <div class="modal-content">
            <h2>Create New Exercise</h2>
            <label for="new-title">Title:</label>
            <input type="text" id="new-title" class="swal2-input" placeholder="Enter title">
            <label for="new-exercise">Exercise:</label>
            <textarea id="new-exercise" class="swal2-input" placeholder="Enter exercise"></textarea>
          </div>`,
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Create",
                cancelButtonText: "Cancel",
                preConfirm: async () => {
                    const title = document.getElementById("new-title").value;
                    const exerciseText = document.getElementById("new-exercise").value;

                    if (!title.trim() || !exerciseText.trim()) {
                        Swal.showValidationMessage("Please fill in all fields");
                        return false;
                    }

                    try {
                        const createResponse = await fetch("http://127.0.0.1:8000/api/exercise", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ title, exercise: exerciseText }),
                        });

                        if (createResponse.ok) {
                            Swal.fire({
                                icon: "success",
                                title: "Success",
                                text: "Exercise Created",
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "Failed to create exercise",
                            });
                        }
                    } catch (error) {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Error creating exercise",
                        });
                    }
                },
            });
        });
        const solveExerciseButton = document.createElement("button");
        solveExerciseButton.className = "btn btn-success";
        solveExerciseButton.textContent = "Solve Exercise";

        solveExerciseButton.addEventListener("click", async () => {
            Swal.fire({
                html: `
            <div class="modal-content">
                <h2>Solve Exercise</h2>
                <label for="exercise-solution">Solution:</label>
                <textarea id="exercise-solution" class="swal2-input" placeholder="Enter your solution"></textarea>
            </div>`,
                showCancelButton: true,
                confirmButtonColor: "#28a745",
                cancelButtonColor: "#d33",
                confirmButtonText: "Submit",
                cancelButtonText: "Cancel",
                preConfirm: async () => {
                    const solution = document.getElementById("exercise-solution").value;

                    if (!solution.trim()) {
                        Swal.showValidationMessage("Please enter your solution");
                        return false;
                    }

                    try {
                        // Send the solution to the server
                        const exerciseId = solveExerciseButton.getAttribute("data-exercise-id");
                        const solutionResponse = await fetch("http://127.0.0.1:8000/api/answer", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ exerciseId, solution }),
                        });

                        if (solutionResponse.ok) {
                            Swal.fire({
                                icon: "success",
                                title: "Success",
                                text: "Exercise Solved",
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "Failed to solve exercise",
                            });
                        }
                    } catch (error) {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Error solving exercise",
                        });
                    }
                },
            });
        });

        const solveButtons = document.querySelectorAll(".solve-exercise");
        solveButtons.forEach(button => {
            button.addEventListener("click", async () => {
                const exerciseId = button.getAttribute("data-exercise-id");
                solveExerciseButton.setAttribute("data-exercise-id", exerciseId);
                solveExerciseButton.click();
            });
        });

        async function fetchExerciseData(exerciseId) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/exercise/${exerciseId}`);
                const responseData = await response.json();
                const exerciseData = responseData.data;
                return exerciseData;
            } catch (error) {
                console.error("Error fetching exercise data:", error);
                return null;
            }
        }

        const editButtons = document.querySelectorAll(".edit-exercise");
        editButtons.forEach(button => {
            button.addEventListener("click", async () => {
                const exerciseId = button.getAttribute("data-exercise-id");

                const exerciseData = await fetchExerciseData(exerciseId);

                if (!exerciseData) {
                    alert("Exercise not found");
                    return;
                }

                Swal.fire({
                    html: `
                        <div class="modal-content">
                            <h2>Edit Exercise</h2>
                            <label for="edit-title">New Title:</label>
                            <input type="text" id="edit-title" class="swal2-input" value="${exerciseData.title}">
                            <label for="edit-exercise">New Exercise:</label>
                            <textarea id="edit-exercise" class="swal2-input">${exerciseData.exercise}</textarea>
                        </div>`,
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Update",
                    cancelButtonText: "Cancel",
                    preConfirm: async () => {
                        const newTitle = document.getElementById("edit-title").value;
                        const newExerciseText = document.getElementById("edit-exercise").value;

                        if (!newTitle.trim() || !newExerciseText.trim()) {
                            Swal.showValidationMessage("Please fill in all fields");
                            return false;
                        } else {
                            return { newTitle, newExerciseText };
                        }
                    }
                }).then(async (result) => {
                    if (!result.isConfirmed) {
                        return; // User canceled
                    }

                    const { newTitle, newExerciseText } = result.value;

                    try {
                        const updateResponse = await fetch(`http://127.0.0.1:8000/api/exercise/${exerciseId}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ title: newTitle, exercise: newExerciseText }),
                        });

                        if (updateResponse.ok) {
                            Swal.fire({
                                icon: "success",
                                title: "Success",
                                text: "Exercise Updated",
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "Failed to update exercise",
                            });
                        }
                    } catch (error) {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Error updating exercise",
                        });
                    }
                });
            });
        });

        const deleteButtons = document.querySelectorAll(".delete-exercise");
        deleteButtons.forEach(button => {
            button.addEventListener("click", async () => {
                const exerciseId = button.getAttribute("data-exercise-id");

                Swal.fire({
                    title: "Confirm Deletion",
                    text: "Are you sure you want to delete this exercise?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Yes, delete it!"
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            const deleteResponse = await fetch(`http://127.0.0.1:8000/api/exercise/${exerciseId}`, {
                                method: "DELETE"
                            });
                            if (deleteResponse.ok) {
                                // Refresh the exercise list after successful deletion
                                location.reload();
                            } else {
                                console.error("Failed to delete exercise");
                            }
                        } catch (error) {
                            console.error("Error deleting exercise:", error);
                        }
                    }
                });
            });
        });



        const addButtonContainer = document.getElementById("add-button-container");
        addButtonContainer.appendChild(createExerciseButton);

    } catch (error) {
        console.error("Error fetching exercise data:", error);
    }
});
