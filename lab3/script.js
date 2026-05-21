const API = "https://backend-for-students-production.up.railway.app/api";

var token = localStorage.getItem("token") || "";

var statusVhodu = false;
var rezhym = "vhid";
var isAdmin = false;

var current = "все";

var globalCarsList = [];

var currentUserLogin = "";

var userProfileData = {
    username: "",
    phone: "+380 66 123 45 67",
    address: "м. Чернівці",
    orders: []
};

function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

window.addEventListener("load", function () {

    show("все");

    document.getElementById("authBtn").onclick = function () {

        if (statusVhodu === true) {

            if (isAdmin === true) {

                logoutUser();

            } else {

                openModal("profile-modal");
            }

        } else {

            openModal("auth-modal");
        }
    };

    document.getElementById("cartBtn").onclick = function () {

        openModal("cart-modal");
    };

    document.getElementById("close-auth").onclick = function () {

        closeModal("auth-modal");
    };

    document.getElementById("close-cart").onclick = function () {

        closeModal("cart-modal");
    };
});

var slide = 1;

document.getElementById("nextBtn").onclick = function () {

    slide++;

    if (slide > 3) {
        slide = 1;
    }

    showSlide();
};

document.getElementById("prevBtn").onclick = function () {

    slide--;

    if (slide < 1) {
        slide = 3;
    }

    showSlide();
};

function showSlide() {

    if (slide === 1) {

        document.getElementById("promo-title").innerText =
            "Весняні знижки!";

        document.getElementById("promo-text").innerText =
            "Знижки на Audi та BMW.";
    }

    if (slide === 2) {

        document.getElementById("promo-title").innerText =
            "Нові електрокари!";

        document.getElementById("promo-text").innerText =
            "Tesla та Audi E-Tron вже в магазині.";
    }

    if (slide === 3) {

        document.getElementById("promo-title").innerText =
            "Безкоштовна доставка!";

        document.getElementById("promo-text").innerText =
            "При покупці авто від 20000$.";
    }
}

async function show(category) {

    current = category;

    var grid = document.getElementById("product-grid");

    if (!grid) return;

    grid.innerHTML = "";

    let localCars =
        JSON.parse(localStorage.getItem("cars")) || [];

    if (localCars.length === 0) {

        try {

            let response = await fetch(
                API + "/items-query?category=auto-store"
            );

            localCars = await response.json();

            localStorage.setItem(
                "cars",
                JSON.stringify(localCars)
            );

        } catch (err) {

            console.log(err);
        }
    }

    globalCarsList = localCars;

    let cars = [...localCars];

    let sort =
        document.getElementById("sortPrice").value;

    if (sort === "cheap") {

        cars.sort((a, b) => a.price - b.price);
    }

    if (sort === "expensive") {

        cars.sort((a, b) => b.price - a.price);
    }

    for (var i = 0; i < cars.length; i++) {

        var carCategory = "";

        if (cars[i].description) {

            carCategory =
                cars[i].description.toLowerCase();
        }

        if (
            current === "все" ||
            carCategory.indexOf(current.toLowerCase()) !== -1
        ) {

            var buttons = `
                <button
                    class="buy-btn"
                    onclick="kupyty(
                        '${cars[i].name}',
                        ${cars[i].price}
                    )"
                >
                    Купити
                </button>
            `;

            if (isAdmin === true) {

                buttons = `
                    <div style="display:flex;flex-direction:column;gap:5px;">

                        <button
                            style="background:orange;color:white;"
                            onclick="editCar('${cars[i]._id}')"
                        >
                            ⚙️ Редагувати
                        </button>

                        <button
                            style="background:red;color:white;"
                            onclick="deleteCar('${cars[i]._id}')"
                        >
                            🗑️ Видалити
                        </button>

                    </div>
                `;
            }

            grid.innerHTML += `
                <div class="product-card">

                    <img
                        src="${cars[i].image}"
                        onerror="this.src='https://dummyimage.com/250x180/cccccc/000000&text=No+Image'"
                    >

                    <h3>${cars[i].name}</h3>

                    <p>${cars[i].description}</p>

                    <h2>${cars[i].price} $</h2>

                    ${buttons}

                </div>
            `;
        }
    }
}

document.getElementById("sortPrice").onchange =
    function () {

        show(current);
    };

async function addItem() {

    if (!isAdmin) {

        alert("Тільки admin може додавати авто!");

        return;
    }

    let name =
        document.getElementById("item-name").value;

    let description =
        document.getElementById("item-description").value;

    let price = parseFloat(
        document.getElementById("item-price").value
    );

    let image =
        document.getElementById("item-image").value;

    if (
        !name ||
        !description ||
        isNaN(price) ||
        !image
    ) {

        alert("Заповніть всі поля!");

        return;
    }

    let newCar = {

        _id: Date.now(),

        name: name,

        description: description,

        price: price,

        image: image,

        category: "auto-store"
    };

    globalCarsList.push(newCar);

    localStorage.setItem(
        "cars",
        JSON.stringify(globalCarsList)
    );

    alert("Авто додано!");

    show("все");
}

function deleteCar(id) {

    if (!isAdmin) {

        alert("Недостатньо прав!");

        return;
    }

    let yes = confirm("Видалити авто?");

    if (!yes) return;

    globalCarsList =
        globalCarsList.filter(
            car => car._id != id
        );

    localStorage.setItem(
        "cars",
        JSON.stringify(globalCarsList)
    );

    alert("Авто видалено!");

    show("все");
}

function editCar(id) {

    if (!isAdmin) return;

    var found = null;

    for (var i = 0; i < globalCarsList.length; i++) {

        if (globalCarsList[i]._id == id) {

            found = globalCarsList[i];

            break;
        }
    }

    if (found == null) return;

    var newPrice = prompt(
        "Нова ціна:",
        found.price
    );

    if (newPrice == null) return;

    newPrice = parseFloat(newPrice);

    if (isNaN(newPrice)) {

        alert("Невірна ціна!");

        return;
    }

    found.price = newPrice;

    localStorage.setItem(
        "cars",
        JSON.stringify(globalCarsList)
    );

    alert("Авто оновлено!");

    show("все");
}

document.getElementById("zmina").onclick =
    function () {

        var titul =
            document.getElementById("titul");

        var knopka =
            document.getElementById("knopka");

        var pas2 =
            document.getElementById("pas2");

        if (rezhym === "vhid") {

            rezhym = "reg";

            titul.innerText = "Реєстрація";

            knopka.innerText =
                "Створити акаунт";

            pas2.classList.remove("hidden");

            this.innerText =
                "Вже є акаунт? Увійти";

        } else {

            rezhym = "vhid";

            titul.innerText = "Вхід";

            knopka.innerText = "Увійти";

            pas2.classList.add("hidden");

            this.innerText =
                "Ще немає акаунту? Реєстрація";
        }
    };

document.getElementById("forma").onsubmit =
    async function (e) {

        e.preventDefault();

        var login =
            document.getElementById("log").value;

        var pass =
            document.getElementById("pas").value;

        if (
            login === "Ros098" &&
            pass === "123456"
        ) {

            statusVhodu = true;

            isAdmin = true;

            token = "student-admin-token";

            localStorage.setItem("token", token);

            currentUserLogin = "admin";

            document.getElementById(
                "authBtn"
            ).innerText =
                "Вихід (Admin)";

            document.getElementById(
                "admin-panel"
            ).style.display = "block";

            closeModal("auth-modal");

            alert("Вхід як ADMIN!");

            show("все");

            return;
        }

        if (
            login.length >= 3 &&
            pass.length >= 3
        ) {

            statusVhodu = true;

            isAdmin = false;

            currentUserLogin = login;

            document.getElementById(
                "authBtn"
            ).innerText =
                "Мій кабінет";

            document.getElementById(
                "profile-login"
            ).innerText = login;

            closeModal("auth-modal");

            alert("Вхід успішний!");

            show("все");

            return;
        }

        alert("Помилка входу!");
    };

function saveProfileData() {

    var newPhone =
        document.getElementById(
            "new-profile-phone"
        ).value;

    var newAddress =
        document.getElementById(
            "new-profile-address"
        ).value;

    if (newPhone) {

        userProfileData.phone = newPhone;

        document.getElementById(
            "profile-phone"
        ).innerText = newPhone;
    }

    if (newAddress) {

        userProfileData.address = newAddress;

        document.getElementById(
            "profile-address"
        ).innerText = newAddress;
    }

    alert("Дані збережено!");
}

var suma = 0;

function kupyty(name, price) {

    var list =
        document.getElementById(
            "cart-items-list"
        );

    if (suma === 0) {

        list.innerHTML = "";
    }

    let itemId = Date.now();

    list.innerHTML += `
        <div
            id="cart-${itemId}"
            style="
                border-bottom:1px solid #ccc;
                padding:10px;
                display:flex;
                justify-content:space-between;
                align-items:center;
            "
        >

            <div>
                ${name}
                -
                ${price}$
            </div>

            <button
                onclick="deleteFromCart(${itemId}, ${price})"
                style="
                    background:red;
                    color:white;
                    border:none;
                    padding:5px 10px;
                    border-radius:5px;
                    cursor:pointer;
                "
            >
                ✖
            </button>

        </div>
    `;

    suma += price;

    document.getElementById(
        "vseho-groshiv"
    ).innerText = suma;
}

function deleteFromCart(id, price) {

    let item =
        document.getElementById(
            "cart-" + id
        );

    if (item) {

        item.remove();

        suma -= price;

        if (suma < 0) {

            suma = 0;
        }

        document.getElementById(
            "vseho-groshiv"
        ).innerText = suma;

        let list =
            document.getElementById(
                "cart-items-list"
            );

        if (
            list.children.length === 0
        ) {

            list.innerHTML =
                "Кошик порожній ☹️";
        }
    }
}

document.addEventListener(
    "click",
    function (e) {

        if (e.target.id === "sendBtn") {

            if (!statusVhodu) {

                alert(
                    "Спочатку увійдіть!"
                );

                return;
            }

            alert(
                "Замовлення оформлено!"
            );

            document.getElementById(
                "cart-items-list"
            ).innerHTML =
                "Кошик порожній ☹️";

            suma = 0;

            document.getElementById(
                "vseho-groshiv"
            ).innerText = "0";

            closeModal("cart-modal");
        }
    }
);

var migrafik = null;

function pokazatyGrafik(type) {

    var canvas =
        document.getElementById(
            "moiaDiagrama"
        );

    var ctx =
        canvas.getContext("2d");

    if (migrafik != null) {

        migrafik.destroy();
    }

    migrafik = new Chart(ctx, {

        type: type,

        data: {

            labels: [
                "Audi",
                "BMW",
                "Tesla",
                "Mercedes"
            ],

            datasets: [{

                label: "Продажі",

                data: [5, 3, 7, 4],

                backgroundColor: [
                    "#2563eb",
                    "#ef4444",
                    "#10b981",
                    "#f59e0b"
                ]
            }]
        }
    });
}

function logoutUser() {

    statusVhodu = false;

    isAdmin = false;

    token = "";

    localStorage.removeItem("token");

    currentUserLogin = "";

    document.getElementById(
        "authBtn"
    ).innerText =
        "Вхід / Реєстрація";

    document.getElementById(
        "admin-panel"
    ).style.display = "none";

    closeModal("profile-modal");

    alert("Вихід виконано!");

    show("все");
}