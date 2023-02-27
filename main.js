// block for add cards
const list = document.querySelector('#products-list');
// API for requests;
const API = 'http://localhost:8000/products';

//Add products items
const addForm = document.querySelector("#add-form");
const titleInp = document.querySelector('#title');
const priceInp = document.querySelector("#price");
const desInp = document.querySelector("#description");
const imgURLInp = document.querySelector("#image");

const editTitleInp = document.querySelector('#edit-title');
const editPriceInp = document.querySelector('#edit-price');
const editdescriptionInp = document.querySelector('#edit-descr');
const editImageInp = document.querySelector('#edit-image');
const saveBtn = document.querySelector("#btn-save-edit");

let searchVal = '';
const searchInp = document.querySelector("#search");

getProducts();
// get data from server;
async function getProducts() {
    const res = await fetch(
		`${API}?title_like=${searchVal}&_limit=${limit}&_page=${currentPage}`
	);
	const count = res.headers.get('x-total-count');
	pageTotalCount = Math.ceil(count / limit);
    const data = await res.json();
    render(data);
};

async function deleteProduct(id) {
    await fetch(`${API}/${id}`, {
        method: 'DELETE'
    })
    getProducts();
}

async function getOneProduct(id) {
    const res = await fetch(`${API}/${id}`)
    const data = await res.json()
    return data;
};

async function editProduct(id, editedProduct) {
    await fetch(`${API}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(editedProduct),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    getProducts()
};

// render 
function render(arr) {
    list.innerHTML = '';
    arr.forEach((item) => {
        list.innerHTML += `
        <div class="card m-5" style="width: 18rem;">
            <img src="${item.image}" class="card-img-top" alt="...">
            <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
            <p class="card-text">${item.description.slice(0, 70)}...</p>
            <p class="card-text fw-bold fs-5">${item.price}$</p>
            <button id="${item.id}" class="btn btn-danger btn-delete">Delete</button>
            <button data-bs-target="#exampleModal" data-bs-toggle="modal" id="${item.id}" class="btn btn-dark btn-edit">Edit</button>
            </div>
        </div>
        `;
    });
    renderPagination();
};
// функция для добавления в db.json
async function addProduct(product) {
    // await для того чтобы функция getProducts() подождала пока данные добавятся 
    await fetch(API, {
        method: 'POST',
        body: JSON.stringify(product),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    // Стянуть и показать актуальные данные
    getProducts();
};
// Вешаем обработчик новых данных (события, для добавления)
addForm.addEventListener("submit", (e) => {
    // Это чтобы страница не перезагружалась 
    e.preventDefault();
    // Этот if для того чтобы проверить на заполненность полей
    if(!titleInp.value.trim() || !priceInp.value.trim() || !desInp.value.trim() || !imgURLInp.value.trim()) {
        alert('Заполните все поля!');
        return;
    };
    // Для отправки db.json нужно object, и мы создаем его.
    const product = {
        title: titleInp.value,
        price: priceInp.value,
        description: desInp.value,
        image: imgURLInp.value
    }
    // Отправляем данные db.json
    addProduct(product);
    // Очищаем после отправки данных;
    titleInp.value = '';
    priceInp.value = '';
    desInp.value = '';
    imgURLInp.value = '';
});

document.addEventListener('click', (e) => {
    if(e.target.classList.contains('btn-delete')) {
        deleteProduct(e.target.id);
    };
}); 
let id = null;
document.addEventListener("click", async (e) => {
    if(e.target.classList.contains('btn-edit')) {
        id = e.target.id;
        const product = await getOneProduct(e.target.id);

        editTitleInp.value = product.title;
        editPriceInp.value = product.price;
        editImageInp.value = product.image;
        editdescriptionInp.value = product.description
        
    }
})

saveBtn.addEventListener('click', (e) => {
    if(
        !editTitleInp.value.trim() || 
        !editPriceInp.value.trim() ||
        !editImageInp.value.trim() || 
        !editdescriptionInp.value.trim()
    ) {
        alert("Заполните все поля");
        return;
    };
    const editedProduct = {
        title: editTitleInp.value,
        price: editPriceInp.value,
        image: editImageInp.value,
        description: editdescriptionInp.value
    }
    editProduct(id, editedProduct)
});

searchInp.addEventListener('input', () => {
    searchVal = searchInp.value;
    getProducts();
});

//? инпут для поиска
const searchInput = document.querySelector('#search');
//? переменная по которой делаем запрос на поиск
//? то где отображаем кнопки для пагинации
const paginationList = document.querySelector('.pagination-list');
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');
//? максимальное количество продуктов на одной странице
const limit = 3;
//? текущая страница
let currentPage = 1;
//? максимальное количество страниц
let pageTotalCount = 1;



//? обработчик события для поиска
searchInput.addEventListener('input', () => {
	searchVal = searchInput.value;
	currentPage = 1;
	getProducts();
});

//? функция для отображения кнопок для пагинации
function renderPagination() {
	paginationList.innerHTML = '';
	for (let i = 1; i <= pageTotalCount; i++) {
		paginationList.innerHTML += `
			<li class="page-item ${currentPage == i ? 'active' : ''}">
				<button class="page-link page_number">${i}</button>
			</li>`;
	}

	//? чтобы кропка prev была неактивна на первой странице
	if (currentPage == 1) {
		prev.classList.add('disabled');
	} else {
		prev.classList.remove('disabled');
	}
	//? чтобы кропка next была неактивна на последней странице
	if (currentPage == pageTotalCount) {
		next.classList.add('disabled');
	} else {
		next.classList.remove('disabled');
	}
}

//? обработчик события чтобы перейти на определенную страницу
document.addEventListener('click', (e) => {
	if (e.target.classList.contains('page_number')) {
		currentPage = e.target.innerText;
		getProducts();
	}
});

//? обработчик события чтобы перейти на следующую страницу
next.addEventListener('click', () => {
	if (currentPage == pageTotalCount) {
		return;
	}
	currentPage++;
	getProducts();
});

//? обработчик события чтобы перейти на предыдущую страницу
prev.addEventListener('click', () => {
	if (currentPage == 1) {
		return;
	}
	currentPage--;
	getProducts();
});

// console.log("Some changes.");
console.log("New branch.");