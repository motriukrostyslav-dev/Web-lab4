const API =
    "https://backend-for-students-production.up.railway.app/api";

let token =
    localStorage.getItem("token") || "";

let currentUser = null;

let isAdmin = false;

let cars = [];

let currentCategory = "все";

let cart = [];

let salesChart = null;

let slide = 1;

let authMode = "login";

let salesData = {

    Audi: 5,
    BMW: 8,
    Tesla: 3,
    Mercedes: 6

};



window.addEventListener("load", () => {

    if(localStorage.getItem("token")){

        token =
            localStorage.getItem("token");

    }

    fetchCars();

    initEvents();

});



function initEvents(){

    document.getElementById("authBtn")
    .addEventListener("click", () => {

        if(currentUser){

            if(isAdmin){

                logout();

            } else {

                openModal("profile-modal");

            }

        } else {

            openModal("auth-modal");

        }

    });



    document.getElementById("cartBtn")
    .addEventListener("click", () => {

        openModal("cart-modal");

    });



    document.getElementById("close-auth")
    .addEventListener("click", () => {

        closeModal("auth-modal");

    });



    document.getElementById("close-cart")
    .addEventListener("click", () => {

        closeModal("cart-modal");

    });



    document.getElementById("close-profile")
    .addEventListener("click", () => {

        closeModal("profile-modal");

    });



    document.getElementById("toggleAuth")
    .addEventListener("click", toggleAuthMode);



    document.getElementById("forma")
    .addEventListener("submit", login);



    document.getElementById("sortPrice")
    .addEventListener("change", showCars);



    document.getElementById("sendBtn")
    .addEventListener("click", makeOrder);



    document.getElementById("nextBtn")
    .addEventListener("click", () => {

        slide++;

        if(slide > 3){

            slide = 1;

        }

        showSlide();

    });



    document.getElementById("prevBtn")
    .addEventListener("click", () => {

        slide--;

        if(slide < 1){

            slide = 3;

        }

        showSlide();

    });

}

function toggleAuthMode(){

    let title =
        document.getElementById("auth-title");

    let submit =
        document.getElementById("auth-submit");

    let pas2 =
        document.getElementById("pas2");

    let toggle =
        document.getElementById("toggleAuth");



    if(authMode === "login"){

        authMode = "register";



        title.innerText =
            "Реєстрація";



        submit.innerText =
            "Зареєструватися";



        pas2.classList.remove("hidden");



        toggle.innerText =
            "Вже є акаунт? Увійти";

    } else {

        authMode = "login";

        document.getElementById("pas2").value = "";



        title.innerText =
            "Вхід";



        submit.innerText =
            "Увійти";



        pas2.classList.add("hidden");



        toggle.innerText =
            "Ще немає акаунта? Реєстрація";

    }

}



function openModal(id){

    document.getElementById(id)
    .classList.remove("hidden");

}



function closeModal(id){

    document.getElementById(id)
    .classList.add("hidden");

}



function show(category){

    currentCategory = category;

    showCars();

}



async function fetchCars(){

    try{

        let response =
            await fetch(API + "/items");

        let data =
            await response.json();

        cars = data.filter(
            item => item.category === "auto-store"
        );

        showCars();

    } catch(err){

        console.log(err);

    }

}



function showCars(){

    let grid =
        document.getElementById("product-grid");

    grid.innerHTML = "";



    let carsToShow = [...cars];

    



    if(currentCategory !== "все"){

    carsToShow = carsToShow.filter(car =>

        car.description
        .toLowerCase()
        .includes(
            currentCategory.toLowerCase()
        )

    );

}



    let sort =
        document.getElementById("sortPrice").value;



    if(sort === "cheap"){

        carsToShow.sort(
            (a, b) => a.price - b.price
        );

    }



    if(sort === "expensive"){

        carsToShow.sort(
            (a, b) => b.price - a.price
        );

    }



    carsToShow.forEach(car => {

        let buttons = `

            <button
                class="buy-btn"
                onclick="buyCar(
                    '${car.name}',
                    ${car.price}
                )"
            >

                Купити

            </button>

        `;



        if(isAdmin){

            buttons = `

                <button
                    onclick="editCar('${car._id}')"
                >

                    Редагувати

                </button>

                <button
                    onclick="deleteCar('${car._id}')"
                >

                    Видалити

                </button>

            `;

        }



        grid.innerHTML += `

            <div class="product-card">

                <img
                    src="${car.image}"
                    onerror="
                    this.src='https://dummyimage.com/250x180/cccccc/000000&text=No+Image'
                    "
                >

                <h3>${car.name}</h3>

                <p>${car.description}</p>

                <h2>${car.price}$</h2>

                ${buttons}

            </div>

        `;

    });

}



async function login(e){

    e.preventDefault();

    let username =
        document.getElementById("log").value;

    let password =
        document.getElementById("pas").value;

    let password2 =
        document.getElementById("pas2").value;



    if(authMode === "register"){

        if(password !== password2){

            alert("Паролі не співпадають");

            return;

        }

        try{

            let response = await fetch(

                API + "/register",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                        "application/json"

                    },

                    body: JSON.stringify({

                        username: username,
                        password: password

                    })

                }

            );



            let data =
                await response.json();

            console.log(data);



            if(response.ok){

                alert("Реєстрація успішна!");



                authMode = "login";



                document.getElementById(
                    "auth-title"
                ).innerText = "Вхід";



                document.getElementById(
                    "auth-submit"
                ).innerText = "Увійти";



                document.getElementById(
                    "pas2"
                ).classList.add("hidden");



                document.getElementById(
                    "toggleAuth"
                ).innerText =
                    "Ще немає акаунта? Реєстрація";

            } else {

                alert(

                    data.message ||
                    "Користувач уже існує"

                );

            }

        } catch(err){

            console.log(err);

            alert("Помилка реєстрації");

        }

        return;

    }


    try{

        let response = await fetch(

            API + "/login",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                    "application/json"

                },

                body: JSON.stringify({

                    username: username,
                    password: password

                })

            }

        );



        let data =
            await response.json();

        console.log(data);



        if(response.ok && data.token){

            token = data.token;

            localStorage.setItem(
                "token",
                token
            );



            currentUser = username;



            document.getElementById(
                "profile-login"
            ).innerText = username;



            if(username === "Ros777"){

                isAdmin = true;



                document.getElementById(
                    "admin-panel"
                ).style.display = "block";



                document.getElementById(
                    "charts-panel"
                ).style.display = "block";



                showChart("bar");



                document.getElementById(
                    "authBtn"
                ).innerText =
                    "Вихід (Admin)";

            }

            else {

                isAdmin = false;



                document.getElementById(
                    "authBtn"
                ).innerText =
                    "Мій кабінет";

            }



            closeModal("auth-modal");



            alert("Вхід успішний!");



            fetchCars();

        } else {

            alert(

                data.message ||
                "Невірний логін або пароль"

            );

        }

    } catch(err){

        console.log(err);

        alert("Помилка входу");

    }

}



async function addItem(){

    if(!isAdmin){

        alert("Тільки admin!");

        return;

    }



    let name =
        document.getElementById("item-name").value;

    let description =
        document.getElementById("item-description").value;

    let price =
        document.getElementById("item-price").value;

    let image =
        document.getElementById("item-image").value;



    try{

        await fetch(

            API + "/items",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                    "application/json",

                    "Authorization":
                    `Bearer ${token}`

                },

                body: JSON.stringify({

                    name,
                    description,
                    price: Number(price),
                    image,
                    category: "auto-store"

                })

            }

        );



        alert("Авто додано!");

        fetchCars();

    } catch(err){

        console.log(err);

    }

}



async function deleteCar(id){

    try{

        await fetch(

            API + "/items/" + id,

            {

                method: "DELETE",

                headers: {

                    "Authorization":
                    `Bearer ${token}`

                }

            }

        );



        alert("Авто видалено!");

        fetchCars();

    } catch(err){

        console.log(err);

    }

}



async function editCar(id){

    if(!isAdmin){

        alert("Недостатньо прав!");

        return;

    }



    let newPrice =
        prompt("Нова ціна:");



    if(!newPrice) return;



    try{

        let response = await fetch(

            API + "/items/" + id,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                    "application/json",

                    "Authorization":
                    `Bearer ${token}`

                },

                body: JSON.stringify({

                    price: Number(newPrice)

                })

            }

        );



        let data =
            await response.json();

        console.log(data);



        if(response.ok){

            alert("Авто оновлено!");

            fetchCars();

        } else {

            alert("Помилка редагування");

        }

    } catch(err){

        console.log(err);

        alert("Server error");

    }

}



function buyCar(name, price){

    cart.push({

        name,
        price

    });



    if(salesData[name]){

        salesData[name]++;

    } else {

        salesData[name] = 1;

    }



    renderCart();



    if(isAdmin){

        showChart("bar");

    }

}



function renderCart(){

    let list =
        document.getElementById(
            "cart-items-list"
        );



    if(cart.length === 0){

        list.innerHTML =
            "Кошик порожній ☹️";



        document.getElementById(
            "vseho-groshiv"
        ).innerText = 0;

        return;

    }



    list.innerHTML = "";



    let total = 0;



    cart.forEach((item, index) => {

        total += item.price;



        list.innerHTML += `

            <div
                style="
                display:flex;
                justify-content:space-between;
                margin-bottom:10px;
                "
            >

                <span>

                    ${item.name}
                    -
                    ${item.price}$

                </span>

                <button
                    onclick="removeFromCart(${index})"
                >

                    ✖

                </button>

            </div>

        `;

    });



    document.getElementById(
        "vseho-groshiv"
    ).innerText = total;

}



function removeFromCart(index){

    cart.splice(index, 1);

    renderCart();

}



function makeOrder(){

    if(!currentUser){

        alert("Спочатку увійдіть!");

        return;

    }



    alert("Замовлення оформлено!");



    cart = [];

    renderCart();

    closeModal("cart-modal");

}

function show(category){

    currentCategory = category;

    showCars();

}



function showChart(type){

    if(!isAdmin) return;



    let ctx =
        document.getElementById(
            "salesChart"
        ).getContext("2d");



    if(salesChart){

        salesChart.destroy();

    }



    salesChart = new Chart(ctx, {

        type: type,

        data: {

            labels: Object.keys(salesData),

            datasets: [{

                label: "Продажі",

                data: Object.values(salesData),

                backgroundColor: [

                    "#2563eb",
                    "#ef4444",
                    "#10b981",
                    "#f59e0b"

                ],

                borderWidth: 2

            }]

        },

        options: {

            responsive: true

        }

    });

}



function saveProfileData(){

    let phone =
        document.getElementById(
            "new-profile-phone"
        ).value;



    let address =
        document.getElementById(
            "new-profile-address"
        ).value;



    if(phone){

        document.getElementById(
            "profile-phone"
        ).innerText = phone;

    }



    if(address){

        document.getElementById(
            "profile-address"
        ).innerText = address;

    }



    alert("Дані збережено!");

}



function logout(){

    token = "";

    currentUser = null;

    isAdmin = false;

    cart = [];



    localStorage.removeItem("token");



    renderCart();



    document.getElementById(
        "authBtn"
    ).innerText =
        "Вхід / Реєстрація";



    document.getElementById(
        "admin-panel"
    ).style.display = "none";



    document.getElementById(
        "charts-panel"
    ).style.display = "none";



    closeModal("profile-modal");



    alert("Вихід виконано!");



    fetchCars();

}



function showSlide(){

    if(slide === 1){

        document.getElementById(
            "promo-title"
        ).innerText =
            "Весняні знижки!";



        document.getElementById(
            "promo-text"
        ).innerText =
            "Знижки на Audi та BMW.";

    }



    if(slide === 2){

        document.getElementById(
            "promo-title"
        ).innerText =
            "Нові електрокари!";



        document.getElementById(
            "promo-text"
        ).innerText =
            "Tesla вже в магазині.";

    }



    if(slide === 3){

        document.getElementById(
            "promo-title"
        ).innerText =
            "Безкоштовна доставка!";



        document.getElementById(
            "promo-text"
        ).innerText =
            "Для авто від 20000$";

    }

}
