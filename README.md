# Hexagonal map generator
A hexagonal map generator made with OpenCV and JavaScript.

## Hexagonal map and parameters

You can generate a simple hexagonal map with different parameters that make your map generation more interesting:
- **Orientation**. The orientation of the hexagons, rather *Flat top* or *Pointy top*.
- **Distance**. The maximum Manhattan distance from the center.
- **Size**. The size of the hexagons in the medium unit.
- **Random walk**. Probability of walking, the less is the probability, the more is the randomness.
- **Media**. I'm going to save this for the next point.

![hexagonal_map_generator_1](https://github.com/user-attachments/assets/dfc21001-73f9-4392-babb-f680dbc1e93d)


## Hexagonal map generation with a drawing or an outline.

If you are bored of the simple hexagonal map you can also draw your preferred outline or download it from the internet and uploading it.

This is where OpenCV enters, with a bit of a magic, it detects the contours of your image and it only generates the map inside these. The parameters will affect the result as well.

![hexagonal_map_generator_2](https://github.com/user-attachments/assets/bfe6ba2c-c545-4f60-94b4-4b4a18a12e76)

## Hexagonal map generation with a video

If you are trully bored, you can just gave it a video and see the visual effect that it will have with this generator haha.

