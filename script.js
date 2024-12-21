const universityList = document.getElementById('universityList');
const favoritesList = document.getElementById('favoritesList');
const countryInput = document.getElementById('countryInput');
const searchBtn = document.getElementById('searchBtn');
const perPageSelect = document.getElementById('perPageSelect');
const pagination = document.getElementById('pagination');
const modalTitle = document.getElementById('modalTitle');
const modalDetails = document.getElementById('modalDetails');
const universityModal = document.getElementById('universityModal');

let universities = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentPage = 1;
let perPage = 5;

function fetchUniversities() {
    const country = countryInput.value.trim();
    console.log('Searching for universities in:', country); 
    if (!country) {
        alert('Please enter a country name.');
        return;
    }
    fetch(`http://universities.hipolabs.com/search?country=${country}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            universities = data;
            currentPage = 1; 
            renderUniversities();
            renderPagination();
        })
        .catch(error => console.error('Error fetching universities:', error));
}

function renderUniversities() {
    universityList.innerHTML = '';
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const paginatedUniversities = universities.slice(start, end);

    paginatedUniversities.forEach(university => {
        const card = document.createElement('div');
        card.className = 'card col-md-4';
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${university.name}</h5>
                <button class="btn btn-info" onclick="showDetails('${university.name}', '${university.country}')">Details</button>
                <button class="btn btn-success" onclick="toggleFavorite('${university.name}')">
                    <i class="${isFavorite(university.name) ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
        `;
        universityList.appendChild(card);
    });
}

function renderPagination() {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(universities.length / perPage);
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.className = 'btn btn-primary mx-1';
        button.onclick = () => {
            currentPage = i;
            renderUniversities();
        };
        pagination.appendChild(button);
    }
}

function showDetails(name, country) {
    modalTitle.innerText = name;
    modalDetails.innerText = `Country: ${country}`;
    
    const favoriteBtn = document.getElementById('favoriteBtn');
    const favoriteIcon = document.getElementById('favoriteIcon');
    
    if (isFavorite(name)) {
        favoriteIcon.classList.remove('far');
        favoriteIcon.classList.add('fas'); // Filled heart
        favoriteBtn.innerText = 'Remove from Favorites';
    } else {
        favoriteIcon.classList.remove('fas');
        favoriteIcon.classList.add('far'); // Empty heart
        favoriteBtn.innerText = 'Add to Favorites';
    }

    favoriteBtn.onclick = () => {
        toggleFavorite(name);
        if (isFavorite(name)) {
            favoriteIcon.classList.remove('far');
            favoriteIcon.classList.add('fas');
            favoriteBtn.innerText = 'Remove from Favorites';
        } else {
            favoriteIcon.classList.remove('fas');
            favoriteIcon.classList.add('far');
            favoriteBtn.innerText = 'Add to Favorites';
        }
    };

    $(universityModal).modal('show'); 
}

function toggleFavorite(name) {
    if (isFavorite(name)) {
        favorites = favorites.filter(fav => fav !== name);
    } else {
        favorites.push(name);
 }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderUniversities();
    renderFavorites(); 
}

function isFavorite(name) {
    return favorites.includes(name);
}

function renderFavorites() {
    favoritesList.innerHTML = '';
    favorites.forEach((fav, index) => {
        const card = document.createElement('div');
        card.className = 'card col-md-4';
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${fav}</h5>
                <button class="btn btn-danger" onclick="removeFavorite('${fav}')">Remove</button>
                <button class="btn btn-secondary" onclick="moveFavorite(${index}, 'up')">Up</button>
                <button class="btn btn-secondary" onclick="moveFavorite(${index}, 'down')">Down</button>
                <button class="btn btn-secondary" onclick="moveFavorite(${index}, 'top')">Top</button>
                <button class="btn btn-secondary" onclick="moveFavorite(${index}, 'bottom')">Bottom</button>
            </div>
        `;
        favoritesList.appendChild(card);
    });
}

function removeFavorite(name) {
    favorites = favorites.filter(fav => fav !== name);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
}

function moveFavorite(index, direction) {
    if (direction === 'up' && index > 0) {
        [favorites[index], favorites[index - 1]] = [favorites[index - 1], favorites[index]];
    } else if (direction === 'down' && index < favorites.length - 1) {
        [favorites[index], favorites[index + 1]] = [favorites[index + 1], favorites[index]];
    } else if (direction === 'top' && index > 0) {
        const item = favorites.splice(index, 1)[0];
        favorites.unshift(item);
    } else if (direction === 'bottom' && index < favorites.length - 1) {
        const item = favorites.splice(index, 1)[0];
        favorites.push(item);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
}

searchBtn.addEventListener('click', fetchUniversities);
perPageSelect.addEventListener('change', (e) => {
    perPage = parseInt(e.target.value);
    renderUniversities();
});

renderFavorites();