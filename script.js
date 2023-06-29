const brandInput = document.getElementById("marka");
const typeInput = document.getElementById("product");
const submitButton = document.getElementById("submit-button");
const brandName = document.getElementById("brand-name");
const productImage = document.getElementById("product-image");

brandInput.addEventListener("input", handleInputChange);
typeInput.addEventListener("input", handleInputChange);
submitButton.addEventListener("click", () => {
  const brand_item = brandInput.value;
  const type_item = typeInput.value;
  krData(brand_item, type_item);
});

fetch('http://makeup-api.herokuapp.com/api/v1/products.json')
  .then(response => response.json())
  .then(data => {
    const brands = data.map(product => product.brand); 
    const uniqueBrands = [...new Set(brands)]; 

    const brandInput = document.getElementById('marka');
    const productTypeInput = document.getElementById('product');

    const searchButton = document.getElementById('searchButton');

    brandInput.addEventListener('blur', () => {
      const brandToFind = brandInput.value.trim();
      if (brandToFind !== '') {
        fetch('http://makeup-api.herokuapp.com/api/v1/products.json')
          .then(response => response.json())
          .then(data => {
            const productTypes = [];

            data.forEach(product => {
              if (product.brand && product.brand.toLowerCase() === brandToFind && brandToFind.toLowerCase()) {
                productTypes.push(product.product_type);
              }
            });

            const uniqueProductTypes = [...new Set(productTypes)];
            console.log(uniqueProductTypes);

            const updatedProductTypes = [...new Set([...uniqueProductTypes].map(type => type.replace(/_/g, ' ')))];
        
            const productTypeInput = document.getElementById('product');
            const productTypeOptions = document.getElementById('productTypeOptions');

            updatedProductTypes.forEach(type => {
              const option = document.createElement('option');
              option.value = type;
              productTypeOptions.appendChild(option);
            });
      
            productTypeInput.addEventListener('input', function(){
              const inputText= this.value;
              const filteredOptions = updatedProductTypes.filter(type =>
                type && type.toLowerCase().includes(inputText.toLowerCase())
              );

              productTypeOptions.innerHTML = '';
              
              filteredOptions.forEach(option => {
                const datalistOption = document.createElement('option');
                datalistOption.value = option;
                productTypeOptions.appendChild(datalistOption);
              });
            });
          });
      }
    });

    const brandList = document.getElementById('brandList');

    uniqueBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        brandList.appendChild(option);
    });

    brandInput.addEventListener('input', function() {
        const inputText = this.value;
        const filteredOptions = uniqueBrands.filter(brand =>
          brand && brand.toLowerCase().includes(inputText.toLowerCase())
        );
        
        brandList.innerHTML = ''; 

        filteredOptions.forEach(option => {
            const datalistOption = document.createElement('option');
            datalistOption.value = option;
            brandList.appendChild(datalistOption);
        });    
    });
  })
  .catch(error => {
    console.error('Ошибка при получении данных:', error);
  }
);

async function krData(brand_item, type_item) {
  try {
    const response = await fetch(`http://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand_item}&product_type=${type_item}`);
    console.log(response.status);
    if (!response.ok) {
      throw new Error(`Ссылка не найдена. Ошибка ${response.status}`);
    }
    const data = await response.json();
    getValue(data, brand_item);
  } catch (error) {
    console.error(error);
  }
}

function handleInputChange() {
  const brand_item = brandInput.value;
  const type_item = typeInput.value;
//   console.log(brand_item, type_item);
}



function getValue(array) {
  array.sort(sortByName); 
  array.sort(sortByPrice); 
  console.log(array); 

  const productContainer = document.getElementById("productContainer");
  productContainer.innerHTML = "";

  array.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    const brand = document.createElement("h2");
    brand.textContent = item.brand.charAt(0).toUpperCase() + item.brand.slice(1);

    const name = document.createElement("p");
    name.textContent = item.name;

    const price = document.createElement("p");
    price.textContent = "Price: $" + item.price;

    const link = document.createElement("a");
    link.href = "#";

    const image = document.createElement("img");
    image.src = item.image_link;
    image.alt = item.product_type;
    image.classList.add("image");

    link.appendChild(image);

    let description = null; 
    let existingImage = null; 
    let caption = null;

    link.addEventListener("click", function () {
      if (description && existingImage && caption) {
        card.removeChild(description);
        card.removeChild(existingImage);
        card.removeChild(caption);
        description = null; 
        existingImage = null; 
        caption = null;
      } else {
        const newDescription = document.createElement("p");
        newDescription.classList.add("description");

        const newCaption = document.createElement("p");
        newCaption.textContent = "Альтернативное изображение товара из сети интернет:";
        newCaption.classList.add("caption");

        const apiKey = "AIzaSyDOGxepQdWafa0x6g4zKvBT_EyHe8j3vok"; 
        const searchEngineId = "e49d6270ad32b4d17"; 
        
        const query = item.name;
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${query}&searchType=image&num=1`;

        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            const imageUrl = data.items[0].link;

            const newImage = document.createElement("img");
            newImage.src = imageUrl;
            newImage.alt = item.product_type;
            newImage.classList.add("image");

            newImage.style.maxWidth = "90%";
            newImage.style.height = "auto";

            newDescription.textContent = item.description;
            card.appendChild(newDescription);
            card.appendChild(newCaption);
            card.appendChild(newImage);

            description = newDescription;
            caption = newCaption;
            existingImage = newImage;
          })
          .catch((error) => {
            console.log("Error:", error);
          });
      }
    });

    card.appendChild(brand);
    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(link);

    productContainer.appendChild(card);
  });
}

function sortByName(a, b) {
  if (a.name === b.name) {
    return 0;
  } else {
    return a.name < b.name ? -1 : 1;
  }
}

function sortByPrice(a, b) {
  if (Number(a.price) === Number(b.price)) {
    return 0;
  } else {
    return Number(a.price) < Number(b.price) ? -1 : 1;
  }
}
