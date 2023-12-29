const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const imageGallery = document.querySelector(".image-gallery");

const OPENAI_API_KEY = "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"; 
let isImageGenerating = false;

const updateImageCard = (imgDataArray) => {
  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download-btn");
    
    const aiGeneratedImage = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imgElement.src = aiGeneratedImage;
    
    imgElement.onload = () => {
      imgCard.classList.remove("loading");
      downloadBtn.setAttribute("href", aiGeneratedImage);
      downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
    };
  });
};

const generateAiImages = async (userPrompt, userImgQuantity) => {
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: userPrompt,
        n: userImgQuantity,
        size: "512x512",
        response_format: "b64_json"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json(); // Parse error response for more details if available
      let errorMessage = "Failed to generate AI images. Please try again later.";

      // Customize error message based on error response or status code
      if (errorData && errorData.error) {
        errorMessage = errorData.error.message || errorMessage;
      } else if (response.status === 429) {
        errorMessage = "Too many requests. Please try again later.";
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = "Unauthorized. Please check your API key.";
      }

      throw new Error(errorMessage);
    }

    const { data } = await response.json();
    updateImageCard([...data]);
  } catch (error) {
    alert(error.message);
  } finally {
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";
    isImageGenerating = false;
  }
};


const handleImageGeneration = async (e) => {
  e.preventDefault();
  if (isImageGenerating) return;

  const userPrompt = e.target[0].value;
  const userImgQuantity = parseInt(e.target[1].value, 10);

  if (!userPrompt || isNaN(userImgQuantity) || userImgQuantity <= 0) {
    alert("Please enter a valid prompt and a positive number for image quantity.");
    return;
  }

  generateBtn.setAttribute("disabled", true);
  generateBtn.innerText = "Generating";
  isImageGenerating = true;

  const imgCardMarkup = Array.from({ length: userImgQuantity }, () => `
    <div class="img-card loading">
      <img src="images/loader.svg" alt="AI generated image">
      <a class="download-btn" href="#">
        <img src="images/download.svg" alt="download icon">
      </a>
    </div>
  `).join("");

  imageGallery.innerHTML = imgCardMarkup;
  await generateAiImages(userPrompt, userImgQuantity);
};

generateForm.addEventListener("submit", handleImageGeneration);
