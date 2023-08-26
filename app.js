document.addEventListener("DOMContentLoaded", async () => {
    try {
        console.log("Fetching user data...");
        const response = await fetch("http://127.0.0.1:8000/api/allUsers");
        const responseData = await response.json();
        const users = responseData.data; // Access the array of users

        console.log("Received data:", users);

        const userListElement = document.getElementById("user-list");
        userListElement.innerHTML = ""; // Clear previous content

        // Create table element
        const table = document.createElement("table");
        table.className = "table table-striped"; // Apply Bootstrap table styles

        // Create table header
        const tableHeader = document.createElement("thead");
        tableHeader.innerHTML = `
            <tr>
            <th>Image</th>
                <th>Name</th>
                <th>Score</th>
                <th>Edit</th>
                <th>Delete</th>
            </tr>
        `;
        table.appendChild(tableHeader);

        // Create table body and populate rows
        const tableBody = document.createElement("tbody");
        users.forEach(user => {
            const row = document.createElement("tr");
            row.className = "custom-table-row";
            row.innerHTML = `
      <td ><img src="https://www.eduopinions.com/wp-content/uploads/2018/02/South-East-European-University-SEEU-logo.png" style="width:100px; height:100px;"></td>
                <td >${user.name}</td>
                <td>${user.score}</td>
                <td><button class="btn btn-secondary edit-user" data-user-id="${user.id}"><i class="fas fa-edit"></i></button></td>
                <td><button class="btn btn-danger delete-user" data-user-id="${user.id}"><i class="fas fa-trash"></i></button></td>
            `;
            tableBody.appendChild(row);
        });
        table.appendChild(tableBody);


        userListElement.appendChild(table);

        // Add event listener for edit buttons
        const editButtons = document.querySelectorAll(".edit-user");
        editButtons.forEach(button => {
            button.addEventListener("click", async () => {
                const userId = button.getAttribute("data-user-id");

                Swal.fire({
                    title: "Edit User",
                    html:
                        `<div class="modal-content" style="width:100%; display:block;">
                <h2>Edit User</h2>
                <label for="edit-name">New Name:</label>
                <input type="text" id="edit-name" class="form-control">
                <label for="edit-score">New Score:</label>
                <input type="number" id="edit-score" class="form-control">
            </div>`,
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Update",
                    cancelButtonText: "Cancel",
                    preConfirm: () => {
                        const newName = document.getElementById("edit-name").value;
                        const newScore = document.getElementById("edit-score").value;
                        if (!newName || !newScore) {
                            Swal.showValidationMessage("Please fill in all fields");
                            return false;
                        } else if (parseInt(newScore) > 100) {
                            Swal.showValidationMessage("Score cannot be bigger than 100");
                            return false;
                        } else {
                            return { newName, newScore };
                        }
                    }
                }).then(async (result) => {
                    if (!result.isConfirmed) {
                        return; // User canceled
                    }

                    const { newName, newScore } = result.value;

                    try {
                        const editResponse = await fetch(`http://127.0.0.1:8000/api/editUser/${userId}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ name: newName, score: newScore }) // Sending new name and score in the request body
                        });

                        if (editResponse.ok) {
                            Swal.fire({
                                icon: "success",
                                title: "Success",
                                text: "User Updated",
                            }).then(() => {
                                location.reload();
                            });
                            // Update the UI without reloading the page
                            // You can implement this part based on your UI structure
                            // For example, update the user's score in the table
                        } else {
                            console.error("Failed to edit user");
                        }
                    } catch (error) {
                        console.error("Error editing user:", error);
                    }
                });
            });
        });


        // Add event listener for delete buttons
        const deleteButtons = document.querySelectorAll(".delete-user");
        deleteButtons.forEach(button => {
            button.addEventListener("click", async () => {
                const userId = button.getAttribute("data-user-id");

                Swal.fire({
                    title: "Confirm Deletion",
                    text: "Are you sure you want to delete this user?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Yes, delete it!"
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            const deleteResponse = await fetch(`http://127.0.0.1:8000/api/deleteUser/${userId}`, {
                                method: "DELETE"
                            });
                            if (deleteResponse.ok) {
                                // Refresh the user list after successful deletion
                                location.reload();
                            } else {
                                console.error("Failed to delete user");
                            }
                        } catch (error) {
                            console.error("Error deleting user:", error);
                        }
                    }
                });
            });
        });

        // Create User button functionality
        const createUserButton = document.createElement("button");
        createUserButton.className = "btn btn-primary";
        createUserButton.textContent = "Create User";
        createUserButton.addEventListener("click", () => {
            const createUserModal = document.createElement("div");
            createUserModal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content" style="width:20%; display:block;">
                <h2>Create New User</h2>
                <label for="new-name">Name:</label>
                <input type="text" id="new-name" class="form-control">
                <label for="new-score">Score:</label>
                <input type="number" id="new-score" class="form-control">
                <button class="btn btn-primary" id="submit-create-user">Create</button>
                <button class="btn btn-secondary" id="cancel-create-user">Cancel</button>
            </div>
        </div>
    `;

            document.body.appendChild(createUserModal);

            const overlay = createUserModal.querySelector(".modal-overlay");
            const newNameInput = createUserModal.querySelector("#new-name");
            const newScoreInput = createUserModal.querySelector("#new-score");
            const submitButton = createUserModal.querySelector("#submit-create-user");
            const cancelButton = createUserModal.querySelector("#cancel-create-user");

            overlay.addEventListener("click", () => {
                document.body.removeChild(createUserModal);
            });

            const stopPropagation = event => {
                event.stopPropagation();
            };

            createUserModal.querySelector(".modal-content").addEventListener("click", stopPropagation);

            submitButton.addEventListener("click", async () => {
                const name = newNameInput.value;
                const score = newScoreInput.value;

                if (name.trim() !== "" && score.trim() !== "") {
                    if (parseInt(score) > 100) {
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "Score cannot be bigger than 100",
                        });
                        return; // Prevent further execution
                    }

                    try {
                        const createResponse = await fetch("http://127.0.0.1:8000/api/createUser", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ name, score }), // Sending user's name and score in the request body
                        });

                        if (createResponse.ok) {
                            Swal.fire({
                                icon: "success",
                                title: "Success",
                                text: "User Created",
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            console.error("Failed to create user");
                        }
                    } catch (error) {
                        console.error("Error creating user:", error);
                    }
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Name and score cannot be empty",
                    });
                }

                document.body.removeChild(createUserModal);
            });


            cancelButton.addEventListener("click", () => {
                document.body.removeChild(createUserModal);
            });
        });


        userListElement.appendChild(createUserButton);
    } catch (error) {
        console.error("Error fetching user data:", error);
    }

});

