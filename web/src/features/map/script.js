async function loadData() {

    const response = await fetch("http://localhost:3000/users");

    const users = await response.json();

    const result = document.getElementById("result");

    result.innerHTML = "";

    users.forEach(user => {
        const li = document.createElement("li");
        li.textContent = `${user.id} : ${user.name}`;
        result.appendChild(li);
    });
}