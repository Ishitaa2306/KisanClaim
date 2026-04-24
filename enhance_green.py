from PIL import Image

input_path = r"C:\Users\drish\.gemini\antigravity\brain\9a6b5998-de87-4d19-9383-99dc4e73ee50\media__1777061968257.jpg"
output_path = r"c:\Users\drish\Desktop\KisanClaim\frontend\src\assets\images\after_fraud.jpg"

try:
    img = Image.open(input_path).convert("RGB")
    data = list(img.getdata())
    
    # Enhance green channel
    # Limit max to 255
    new_data = []
    for r, g, b in data:
        # Boost G channel by 15%, dampen R slightly to make it look "healthier" and less "damaged red"
        new_g = min(255, int(g * 1.5))
        new_r = int(r * 0.8)
        new_data.append((new_r, new_g, b))
        
    img.putdata(new_data)
    img.save(output_path)
    print("Enhanced green image saved to", output_path)
except Exception as e:
    print("Error processing image:", e)
