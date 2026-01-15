from google.cloud import vision

def main():
    client = vision.ImageAnnotatorClient()

    with open('test.jpg', 'rb') as f:
        content = f.read()

    image = vision.Image(content=content)
    response = client.text_detection(image=image)

    if response.error.message:
        raise Exception(response.error.message)

    text = response.full_text_annotation.text
    print(text[:1500])

if __name__ == '__main__':
    main()
