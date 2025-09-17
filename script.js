document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const promptInput = document.getElementById('prompt-input');
    const editButton = document.getElementById('edit-button');
    const originalImage = document.getElementById('original-image');
    const editedImage = document.getElementById('edited-image');
    const loader = document.getElementById('loader');
    const originalPlaceholder = document.getElementById('original-placeholder');
    const editedPlaceholder = document.getElementById('edited-placeholder');
    const uploadLabel = document.querySelector('.custom-file-upload span');

    let originalImageDataUrl = null;

    const checkButtonState = () => {
        const prompt = promptInput.value.trim();
        if (originalImageDataUrl && prompt) {
            editButton.disabled = false;
        } else {
            editButton.disabled = true;
        }
    };

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                originalImageDataUrl = e.target.result;
                originalImage.src = originalImageDataUrl;
                originalImage.style.display = 'block';
                originalPlaceholder.style.display = 'none';
                uploadLabel.textContent = file.name;
                checkButtonState();
            };
            reader.readAsDataURL(file);
        }
    });

    promptInput.addEventListener('input', checkButtonState);

    editButton.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();

        if (!originalImageDataUrl || !prompt) {
            // This case should be rare since the button is disabled
            alert('Please upload an image and provide an edit instruction.');
            return;
        }

        // Show loader and hide previous image/placeholder
        loader.classList.remove('hidden');
        editedImage.style.display = 'none';
        editedPlaceholder.style.display = 'none';
        editButton.disabled = true;
        editButton.textContent = 'Generating...';

        try {
            const result = await websim.imageGen({
                prompt: prompt,
                image_inputs: [{ url: originalImageDataUrl }],
            });

            if (result && result.url) {
                editedImage.src = result.url;
                editedImage.style.display = 'block';
            } else {
                editedPlaceholder.textContent = 'Sorry, the AI could not generate an image. Please try again.';
                editedPlaceholder.style.display = 'block';
            }
        } catch (error) {
            console.error('Error generating image:', error);
            editedPlaceholder.textContent = 'An error occurred. Please check the console and try again.';
            editedPlaceholder.style.display = 'block';
        } finally {
            // Hide loader and re-enable button
            loader.classList.add('hidden');
            editButton.textContent = 'Generate Edit';
            checkButtonState(); // Re-enable button if conditions are met
        }
    });
});

