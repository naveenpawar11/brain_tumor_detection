function previewImage() {
    const fileInput = document.getElementById('fileInput');
    const imagePreview = document.getElementById('imagePreview');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Image Preview" class="preview-img">`;
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.innerHTML = "";
    }
}

async function uploadImage() {
    const fileInput = document.getElementById('fileInput');
    const outputDiv = document.getElementById('output');
    const imageOutput = document.getElementById('imageOutput');
    outputDiv.innerHTML = ""; // Clear any previous results
    imageOutput.innerHTML = ""; // Clear any previous image output

    if (!fileInput.files[0]) {
        alert('Please select an image!');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        outputDiv.innerHTML = `<p>Processing...</p>`;
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            outputDiv.innerHTML = `
                <div class="result">
                    <p><strong>Prediction:</strong> <span class="result-value">${data.result}</span></p>
                    <p><strong>Confidence:</strong> <span class="result-value">${(data.confidence * 100).toFixed(2)}%</span></p>
                </div>
            `;

            // Display the uploaded image
            const reader = new FileReader();
            reader.onload = function (e) {
                imageOutput.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" class="preview-img">`;
            };
            reader.readAsDataURL(fileInput.files[0]);

        } else {
            outputDiv.innerHTML = `<p><strong>Error:</strong> ${data.error}</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Check the console for details.');
        outputDiv.innerHTML = `<p><strong>Error:</strong> Something went wrong!</p>`;
    }
}
