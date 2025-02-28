from PIL import Image, ImageDraw

# Create a blank image with a white background
def create_checkmark(color, filename):
    # Create a 200x200 image with a white background
    image = Image.new("RGB", (200, 200), "white")
    draw = ImageDraw.Draw(image)

    # Draw a checkmark
    draw.line((50, 100, 90, 150), fill=color, width=10)  # First part of the check
    draw.line((90, 150, 150, 50), fill=color, width=10)  # Second part of the check

    # Save the image
    image.save(filename)

# Generate the checkmarks
create_checkmark("green", "green_check.png")
create_checkmark("red", "red_check.png")
create_checkmark("black", "black_check.png")

print("Checkmark images generated successfully!")